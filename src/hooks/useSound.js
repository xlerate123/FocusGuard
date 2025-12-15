import { useRef, useCallback } from 'react';

/**
 * Custom hook for playing notification sounds
 */
const useSound = (enabled = true) => {
    const audioContextRef = useRef(null);

    // Initialize AudioContext lazily
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Play a simple beep tone
    const playTone = useCallback((frequency = 440, duration = 200, type = 'sine') => {
        if (!enabled) return;

        try {
            const ctx = getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            // Fade out
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration / 1000);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }, [enabled, getAudioContext]);

    // Preset sounds
    const playDistractedSound = useCallback(() => {
        playTone(300, 150, 'square');
    }, [playTone]);

    const playFocusedSound = useCallback(() => {
        playTone(600, 100, 'sine');
    }, [playTone]);

    const playPomodoroComplete = useCallback(() => {
        // Play a pleasant chime sequence
        playTone(523, 150); // C5
        setTimeout(() => playTone(659, 150), 150); // E5
        setTimeout(() => playTone(784, 200), 300); // G5
    }, [playTone]);

    const playGoalAchieved = useCallback(() => {
        // Celebration sound
        playTone(523, 100);
        setTimeout(() => playTone(659, 100), 100);
        setTimeout(() => playTone(784, 100), 200);
        setTimeout(() => playTone(1047, 300), 300); // C6
    }, [playTone]);

    const playBreakStart = useCallback(() => {
        playTone(440, 200, 'triangle');
        setTimeout(() => playTone(349, 300, 'triangle'), 200);
    }, [playTone]);

    return {
        playTone,
        playDistractedSound,
        playFocusedSound,
        playPomodoroComplete,
        playGoalAchieved,
        playBreakStart,
    };
};

export default useSound;
