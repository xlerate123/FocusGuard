import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Square, Clock } from 'lucide-react';

/**
 * FocusTimer component - Displays and tracks focus time
 * Supports both Stopwatch and Pomodoro modes with manual controls
 */
const FocusTimer = ({
    isFocused,
    onDistractionChange,
    onDurationChange,
    timerMode = 'stopwatch',
    pomodoroFocusTime = 25 * 60,
    pomodoroBreakTime = 5 * 60,
    onPomodoroComplete,
    onBreakComplete
}) => {
    const [sessionDuration, setSessionDuration] = useState(0);
    const [distractionCount, setDistractionCount] = useState(0);
    const [pomodoroTime, setPomodoroTime] = useState(pomodoroFocusTime);
    const [pomodoroPhase, setPomodoroPhase] = useState('focus'); // 'focus' or 'break'
    const [isRunning, setIsRunning] = useState(false);
    const [isStarted, setIsStarted] = useState(false); // Manual start for stopwatch

    const wasDistracted = useRef(false);
    const intervalRef = useRef(null);

    // Handle timer based on focus state (Stopwatch mode)
    useEffect(() => {
        if (timerMode !== 'stopwatch') return;

        // Only run if manually started
        if (!isStarted) return;

        if (isFocused) {
            intervalRef.current = setInterval(() => {
                setSessionDuration(prev => prev + 1);
            }, 1000);

            if (wasDistracted.current) {
                wasDistracted.current = false;
            }
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            if (!wasDistracted.current && sessionDuration > 0) {
                wasDistracted.current = true;
                setDistractionCount(prev => prev + 1);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isFocused, sessionDuration, timerMode, isStarted]);

    // Handle Pomodoro timer
    useEffect(() => {
        if (timerMode !== 'pomodoro' || !isRunning) return;

        // Only count down when focused (during focus phase) or always (during break)
        const shouldCount = pomodoroPhase === 'break' || isFocused;

        if (shouldCount) {
            intervalRef.current = setInterval(() => {
                setPomodoroTime(prev => {
                    if (prev <= 1) {
                        // Timer complete
                        if (pomodoroPhase === 'focus') {
                            setPomodoroPhase('break');
                            onPomodoroComplete?.();
                            return pomodoroBreakTime;
                        } else {
                            setPomodoroPhase('focus');
                            onBreakComplete?.();
                            return pomodoroFocusTime;
                        }
                    }
                    return prev - 1;
                });

                // Also track total focus time during focus phase
                if (pomodoroPhase === 'focus') {
                    setSessionDuration(prev => prev + 1);
                }
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timerMode, isRunning, isFocused, pomodoroPhase, pomodoroFocusTime, pomodoroBreakTime, onPomodoroComplete, onBreakComplete]);

    // Notify parent of changes
    useEffect(() => {
        onDistractionChange?.(distractionCount);
    }, [distractionCount, onDistractionChange]);

    useEffect(() => {
        onDurationChange?.(sessionDuration);
    }, [sessionDuration, onDurationChange]);

    // Format seconds to mm:ss
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Format for hours if needed
    const formatFullTime = (seconds) => {
        if (seconds >= 3600) {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return formatTime(seconds);
    };

    // Stopwatch controls
    const startStopwatch = () => {
        setIsStarted(true);
    };

    const stopStopwatch = () => {
        setIsStarted(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const resetStopwatch = () => {
        setIsStarted(false);
        setSessionDuration(0);
        setDistractionCount(0);
        wasDistracted.current = false;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Pomodoro controls
    const togglePomodoro = () => {
        setIsRunning(!isRunning);
    };

    const resetPomodoro = () => {
        setIsRunning(false);
        setPomodoroTime(pomodoroFocusTime);
        setPomodoroPhase('focus');
        setSessionDuration(0);
        setDistractionCount(0);
    };

    // Calculate progress for Pomodoro ring
    const getProgress = () => {
        const total = pomodoroPhase === 'focus' ? pomodoroFocusTime : pomodoroBreakTime;
        return ((total - pomodoroTime) / total) * 100;
    };

    if (timerMode === 'pomodoro') {
        return (
            <div className="focus-timer pomodoro-mode">
                <div className="pomodoro-display">
                    <div className="pomodoro-ring" style={{ '--progress': `${getProgress()}%` }}>
                        <div className="pomodoro-inner">
                            <span className={`pomodoro-phase ${pomodoroPhase}`}>
                                {pomodoroPhase === 'focus' ? 'FOCUS' : 'BREAK'}
                            </span>
                            <span className="timer-value pomodoro-time">
                                {formatTime(pomodoroTime)}
                            </span>
                        </div>
                    </div>

                    <div className="pomodoro-controls">
                        <button
                            className="pomodoro-btn"
                            onClick={togglePomodoro}
                            title={isRunning ? 'Pause' : 'Start'}
                        >
                            {isRunning ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button
                            className="pomodoro-btn"
                            onClick={resetPomodoro}
                            title="Reset"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>

                <div className="timer-secondary">
                    <Clock size={14} />
                    <span>Total: {formatFullTime(sessionDuration)}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="focus-timer stopwatch-mode">
            <div className="timer-display">
                <span className="timer-label">Focus Time</span>
                <span className={`timer-value ${isStarted && isFocused ? 'active' : 'paused'}`}>
                    {formatFullTime(sessionDuration)}
                </span>

                {/* Status indicator */}
                {isStarted && !isFocused && sessionDuration > 0 && (
                    <span className="timer-paused-indicator">
                        <Pause size={12} /> PAUSED
                    </span>
                )}
                {!isStarted && sessionDuration === 0 && (
                    <span className="timer-ready-indicator">
                        Press Start to begin
                    </span>
                )}
            </div>

            {/* Manual Controls */}
            <div className="stopwatch-controls">
                {!isStarted ? (
                    <button
                        className="stopwatch-btn start-btn"
                        onClick={startStopwatch}
                        title="Start Timer"
                    >
                        <Play size={18} />
                        <span>Start</span>
                    </button>
                ) : (
                    <button
                        className="stopwatch-btn stop-btn"
                        onClick={stopStopwatch}
                        title="Stop Timer"
                    >
                        <Square size={18} />
                        <span>Stop</span>
                    </button>
                )}
                <button
                    className="stopwatch-btn reset-btn"
                    onClick={resetStopwatch}
                    title="Reset Timer"
                    disabled={sessionDuration === 0}
                >
                    <RotateCcw size={18} />
                </button>
            </div>
        </div>
    );
};

export default FocusTimer;
