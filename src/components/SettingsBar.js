import React from 'react';
import { Sun, Moon, Volume2, VolumeX, Timer, Clock } from 'lucide-react';

/**
 * SettingsBar component - Quick settings toggles
 */
const SettingsBar = ({
    theme = 'dark',
    onThemeToggle,
    soundEnabled = true,
    onSoundToggle,
    timerMode = 'stopwatch',
    onTimerModeChange
}) => {
    return (
        <div className="settings-bar">
            <button
                className={`settings-btn ${timerMode === 'stopwatch' ? 'active' : ''}`}
                onClick={() => onTimerModeChange?.('stopwatch')}
                title="Stopwatch Mode"
            >
                <Clock size={18} />
                <span>Stopwatch</span>
            </button>

            <button
                className={`settings-btn ${timerMode === 'pomodoro' ? 'active' : ''}`}
                onClick={() => onTimerModeChange?.('pomodoro')}
                title="Pomodoro Mode (25/5)"
            >
                <Timer size={18} />
                <span>Pomodoro</span>
            </button>

            <div className="settings-divider" />

            <button
                className="settings-btn icon-only"
                onClick={onSoundToggle}
                title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
                className="settings-btn icon-only"
                onClick={onThemeToggle}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
    );
};

export default SettingsBar;
