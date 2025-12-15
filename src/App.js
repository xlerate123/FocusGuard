import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Focus, Settings, RotateCcw } from 'lucide-react';
import CameraView from './components/CameraView';
import FocusTimer from './components/FocusTimer';
import StatsPanel from './components/StatsPanel';
import DailyGoal from './components/DailyGoal';
import SettingsBar from './components/SettingsBar';
import SessionHistory from './components/SessionHistory';
import ExportData from './components/ExportData';
import useFocusDetection from './hooks/useFocusDetection';
import useLocalStorage from './hooks/useLocalStorage';
import useSound from './hooks/useSound';
import './App.css';

function App() {
    const webcamRef = useRef(null);
    const { isFocused, status, isModelLoaded } = useFocusDetection(webcamRef);

    // Default state
    const defaultData = {
        sessions: [],
        totalFocusTime: 0,
        totalDistractions: 0,
        streak: 1,
        lastActiveDate: new Date().toDateString(),
        dailyGoal: 7200,
        theme: 'dark',
        soundEnabled: true,
    };

    // Persistent state
    const [savedData, setSavedData] = useLocalStorage('focusGuard', defaultData);

    // Session state
    const [sessionDuration, setSessionDuration] = useState(0);
    const [distractionCount, setDistractionCount] = useState(0);
    const [timerMode, setTimerMode] = useState('stopwatch');
    const [showSettings, setShowSettings] = useState(false);

    // Sound hooks
    const { playDistractedSound, playPomodoroComplete, playGoalAchieved, playBreakStart } = useSound(savedData.soundEnabled);

    // Previous focus state for detecting transitions
    const prevIsFocused = useRef(isFocused);

    // Play sound on distraction
    useEffect(() => {
        if (prevIsFocused.current && !isFocused && status !== 'No face detected' && status !== 'Waiting for camera...') {
            playDistractedSound();
        }
        prevIsFocused.current = isFocused;
    }, [isFocused, status, playDistractedSound]);

    // Calculate today's focus time from current session only
    const getTodaysFocusTime = useCallback(() => {
        const today = new Date().toDateString();
        const todaySessions = savedData.sessions.filter(
            s => new Date(s.startTime).toDateString() === today
        );
        return todaySessions.reduce((acc, s) => acc + s.focusTime, 0) + sessionDuration;
    }, [savedData.sessions, sessionDuration]);

    // Calculate productivity score
    const getProductivityScore = useCallback(() => {
        if (sessionDuration === 0 && distractionCount === 0) return 0;
        if (distractionCount === 0) return 100;
        const score = Math.min(100, Math.round((sessionDuration / Math.max(1, distractionCount)) / 60 * 15));
        return score;
    }, [sessionDuration, distractionCount]);

    // Handle Pomodoro complete
    const handlePomodoroComplete = useCallback(() => {
        playPomodoroComplete();
    }, [playPomodoroComplete]);

    // Handle break complete
    const handleBreakComplete = useCallback(() => {
        playBreakStart();
    }, [playBreakStart]);

    // Handle daily goal reached
    const handleGoalReached = useCallback(() => {
        playGoalAchieved();
    }, [playGoalAchieved]);

    // Theme toggle
    const handleThemeToggle = () => {
        setSavedData(prev => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
        }));
    };

    // Sound toggle
    const handleSoundToggle = () => {
        setSavedData(prev => ({
            ...prev,
            soundEnabled: !prev.soundEnabled,
        }));
    };

    // Timer mode change
    const handleTimerModeChange = (mode) => {
        setTimerMode(mode);
    };

    // Reset all data
    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            setSavedData(defaultData);
            setSessionDuration(0);
            setDistractionCount(0);
        }
    };

    return (
        <div className={`app ${savedData.theme}`}>
            {/* Header */}
            <header className="app-header">
                <div className="header-left">
                    <div className="logo">
                        <Focus size={28} className="logo-icon" />
                        <h1>FocusGuard</h1>
                    </div>
                    <span className="tagline">Stay focused, stay productive</span>
                </div>

                <div className="header-actions">
                    <button
                        className="header-btn reset-btn"
                        onClick={handleReset}
                        title="Reset All Data"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        className="header-btn"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            {/* Settings Bar */}
            {showSettings && (
                <SettingsBar
                    theme={savedData.theme}
                    onThemeToggle={handleThemeToggle}
                    soundEnabled={savedData.soundEnabled}
                    onSoundToggle={handleSoundToggle}
                    timerMode={timerMode}
                    onTimerModeChange={handleTimerModeChange}
                />
            )}

            {/* Bento Grid Layout */}
            <main className="bento-grid">
                {/* Camera - Large cell */}
                <section className="bento-cell bento-camera">
                    <CameraView
                        ref={webcamRef}
                        isFocused={isFocused}
                        status={status}
                    />
                </section>

                {/* Timer */}
                <section className="bento-cell bento-timer">
                    <FocusTimer
                        isFocused={isFocused}
                        onDistractionChange={setDistractionCount}
                        onDurationChange={setSessionDuration}
                        timerMode={timerMode}
                        onPomodoroComplete={handlePomodoroComplete}
                        onBreakComplete={handleBreakComplete}
                    />
                </section>

                {/* Daily Goal */}
                <section className="bento-cell bento-goal">
                    <DailyGoal
                        currentTime={getTodaysFocusTime()}
                        goalTime={savedData.dailyGoal}
                        onGoalReached={handleGoalReached}
                    />
                </section>

                {/* Export - next to Goal */}
                <section className="bento-cell bento-export">
                    <ExportData
                        sessions={savedData.sessions}
                        stats={{
                            totalFocusTime: savedData.totalFocusTime,
                            totalDistractions: savedData.totalDistractions,
                            streak: savedData.streak,
                        }}
                    />
                </section>

                {/* Stats - below Camera */}
                <section className="bento-cell bento-stats">
                    <StatsPanel
                        sessionDuration={sessionDuration}
                        distractionCount={distractionCount}
                        streak={savedData.streak}
                        productivityScore={getProductivityScore()}
                    />
                </section>

                {/* Session History - Full width */}
                <section className="bento-cell bento-history">
                    <SessionHistory
                        sessions={savedData.sessions}
                        todayFocusTime={getTodaysFocusTime()}
                    />
                </section>

                {/* Loading Indicator */}
                {!isModelLoaded && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Loading face detection models...</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <p>Look at the camera to start tracking your focus</p>
            </footer>
        </div>
    );
}

export default App;
