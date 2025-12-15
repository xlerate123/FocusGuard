import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

/**
 * Custom hook for focus detection using face-api.js landmarks
 * Uses 2D heuristics for yaw (left/right) and pitch (up/down) detection
 */
const useFocusDetection = (videoRef) => {
    const [isFocused, setIsFocused] = useState(false);
    const [status, setStatus] = useState('Initializing...');
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    const modelsLoaded = useRef(false);
    const animationFrameRef = useRef(null);
    const lastDetectionTime = useRef(0);

    // Smoothing: Track history of focus states to prevent flickering
    const focusHistory = useRef([]);
    const SMOOTHING_WINDOW = 5;  // Number of frames to consider
    const SMOOTHING_THRESHOLD = 3;  // Must have 3+ consistent readings to change state

    // Detection interval in ms (limit to ~10 FPS for performance)
    const DETECTION_INTERVAL = 100;

    // Thresholds for attention detection (made slightly tighter)
    const YAW_THRESHOLD_MIN = 0.30;  // Looking too far right (was 0.25)
    const YAW_THRESHOLD_MAX = 0.70;  // Looking too far left (was 0.75)
    const PITCH_THRESHOLD = 0.5;     // Looking down threshold (was 0.6)

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            if (modelsLoaded.current) return;

            try {
                setStatus('Loading models...');
                const MODEL_URL = '/models';

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                ]);

                modelsLoaded.current = true;
                setIsModelLoaded(true);
                setStatus('Ready - Look at the camera');
            } catch (err) {
                console.error('Error loading face-api models:', err);
                setStatus('Error loading models');
            }
        };

        loadModels();
    }, []);

    /**
     * Calculate attention state from face landmarks
     * @param {Object} landmarks - face-api.js landmarks object
     * @returns {{ isFocused: boolean, reason: string }}
     */
    const calculateAttention = useCallback((landmarks) => {
        const positions = landmarks.positions;

        // Key landmarks for attention detection
        const noseTip = positions[30];        // Nose tip
        const leftJaw = positions[0];         // Left jaw edge
        const rightJaw = positions[16];       // Right jaw edge
        const chin = positions[8];            // Chin
        const noseBridge = positions[27];     // Top of nose bridge

        // === YAW DETECTION (Looking Left/Right) ===
        // Compare horizontal position of nose tip relative to face width
        const faceWidth = rightJaw.x - leftJaw.x;
        const noseToLeftJaw = noseTip.x - leftJaw.x;
        const yawRatio = noseToLeftJaw / faceWidth;

        if (yawRatio < YAW_THRESHOLD_MIN) {
            return { isFocused: false, reason: 'Looking Right' };
        }
        if (yawRatio > YAW_THRESHOLD_MAX) {
            return { isFocused: false, reason: 'Looking Left' };
        }

        // === PITCH DETECTION (Looking Down) ===
        // Compare nose-to-chin distance vs nose-bridge-to-nose-tip distance
        const noseToChin = chin.y - noseTip.y;
        const bridgeToNose = noseTip.y - noseBridge.y;

        // When looking down, nose-to-chin distance decreases significantly
        // We use the ratio of these distances as an indicator
        if (bridgeToNose > 0) {
            const pitchRatio = noseToChin / bridgeToNose;
            if (pitchRatio < PITCH_THRESHOLD) {
                return { isFocused: false, reason: 'Looking Down' };
            }
        }

        return { isFocused: true, reason: 'Focused' };
    }, []);

    /**
     * Main detection loop using requestAnimationFrame
     */
    const detectFocus = useCallback(async (timestamp) => {
        // Skip if models not loaded
        if (!modelsLoaded.current) {
            animationFrameRef.current = requestAnimationFrame(detectFocus);
            return;
        }

        // Get the video element from webcam ref
        const video = videoRef?.current?.video;

        // Skip if video not ready or not playing
        if (!video || video.readyState < 4 || video.videoWidth === 0) {
            setStatus('Waiting for camera...');
            animationFrameRef.current = requestAnimationFrame(detectFocus);
            return;
        }

        // Throttle detection for performance
        if (timestamp - lastDetectionTime.current < DETECTION_INTERVAL) {
            animationFrameRef.current = requestAnimationFrame(detectFocus);
            return;
        }
        lastDetectionTime.current = timestamp;

        try {
            // Detect face with landmarks
            const detection = await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 })
                )
                .withFaceLandmarks();

            if (detection) {
                // Face detected - calculate attention state
                const attention = calculateAttention(detection.landmarks);

                // Add to history for smoothing
                focusHistory.current.push({
                    isFocused: attention.isFocused,
                    reason: attention.reason
                });

                // Keep only last SMOOTHING_WINDOW readings
                if (focusHistory.current.length > SMOOTHING_WINDOW) {
                    focusHistory.current.shift();
                }

                // Count focused vs distracted in recent history
                const focusedCount = focusHistory.current.filter(h => h.isFocused).length;
                const distractedCount = focusHistory.current.length - focusedCount;

                // Only change state if we have enough consistent readings
                if (focusedCount >= SMOOTHING_THRESHOLD) {
                    setIsFocused(true);
                    setStatus('Focused');
                } else if (distractedCount >= SMOOTHING_THRESHOLD) {
                    // Get the most common distraction reason
                    const reasons = focusHistory.current
                        .filter(h => !h.isFocused)
                        .map(h => h.reason);
                    const mostCommonReason = reasons.length > 0
                        ? reasons[reasons.length - 1]
                        : 'Distracted';
                    setIsFocused(false);
                    setStatus(mostCommonReason);
                }
                // If neither threshold met, keep current state (no flickering)
            } else {
                // No face detected - add to history
                focusHistory.current.push({ isFocused: false, reason: 'No face detected' });
                if (focusHistory.current.length > SMOOTHING_WINDOW) {
                    focusHistory.current.shift();
                }

                // Only update if consistently no face
                const noFaceCount = focusHistory.current
                    .filter(h => h.reason === 'No face detected').length;
                if (noFaceCount >= SMOOTHING_THRESHOLD) {
                    setIsFocused(false);
                    setStatus('No face detected');
                }
            }
        } catch (err) {
            console.error('Detection error:', err);
        }

        // Continue the loop
        animationFrameRef.current = requestAnimationFrame(detectFocus);
    }, [videoRef, calculateAttention]);

    // Start/stop detection loop based on model loading
    useEffect(() => {
        if (isModelLoaded) {
            animationFrameRef.current = requestAnimationFrame(detectFocus);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isModelLoaded, detectFocus]);

    return {
        isFocused,
        status,
        isModelLoaded
    };
};

export default useFocusDetection;
