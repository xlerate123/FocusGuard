import React, { forwardRef, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import useSound from '../hooks/useSound'; // Adjust path if needed

/**
 * CameraView component - Displays webcam feed with focus state indicator
 * Green border when focused, red border when distracted
 */
const CameraView = forwardRef(({ isFocused, status }, ref) => {
    const isInitializing = status === 'Initializing...' || status === 'Loading models...' || status === 'Waiting for camera...';
    const isReady = status === 'Ready - Look at the camera';

    // Sound hook for distraction alert
    const { playDistractedSound } = useSound(true);
    const prevFocusedRef = useRef(isFocused);

    // Play alert tone when focus is lost
    useEffect(() => {
        if (prevFocusedRef.current && !isFocused) {
            // Transition from focused -> not focused
            playDistractedSound();
        }
        prevFocusedRef.current = isFocused;
    }, [isFocused, playDistractedSound]);

    return (
        <div className="camera-container">
            <div className={`camera-wrapper ${isFocused ? 'focused' : 'distracted'}`}>
                <Webcam
                    ref={ref}
                    mirrored={true}
                    className="camera-feed"
                    videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: 'user'
                    }}
                />

                {/* Focus/Distraction Overlay */}
                <div className={`status-overlay ${isFocused ? 'focused' : 'distracted'}`}>
                    <span className="status-indicator-icon">
                        {isFocused ? (
                            <CheckCircle size={16} />
                        ) : isInitializing || isReady ? (
                            <Camera size={16} />
                        ) : (
                            <AlertTriangle size={16} />
                        )}
                    </span>
                    <span className="status-text">{status}</span>
                </div>

                {/* Distracted Alert */}
                {!isFocused && !isInitializing && !isReady && status !== 'No face detected' && (
                    <div className="distracted-alert">
                        <AlertTriangle size={24} />
                        <span className="alert-text">Distracted!</span>
                    </div>
                )}
            </div>
        </div>
    );
});

CameraView.displayName = 'CameraView';

export default CameraView;
