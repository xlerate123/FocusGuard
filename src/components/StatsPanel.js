import React from 'react';
import { Clock, Eye, Target, TrendingUp, Flame } from 'lucide-react';

/**
 * StatsPanel component - Displays focus session statistics with icons
 */
const StatsPanel = ({ sessionDuration, distractionCount, streak = 0, productivityScore = 0 }) => {
    // Format seconds to readable time
    const formatDuration = (seconds) => {
        if (seconds < 60) {
            return `${seconds}s`;
        }
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}m ${secs}s`;
        }
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="stats-panel">
            <div className="stat-item">
                <span className="stat-icon">
                    <Clock size={24} strokeWidth={2} />
                </span>
                <div className="stat-content">
                    <span className="stat-value">{formatDuration(sessionDuration)}</span>
                    <span className="stat-label">Time Focused</span>
                </div>
            </div>

            <div className="stat-divider"></div>

            <div className="stat-item">
                <span className="stat-icon">
                    <Eye size={24} strokeWidth={2} />
                </span>
                <div className="stat-content">
                    <span className="stat-value">{distractionCount}</span>
                    <span className="stat-label">Distractions</span>
                </div>
            </div>

            <div className="stat-divider"></div>

            <div className="stat-item">
                <span className="stat-icon streak-icon">
                    <Flame size={24} strokeWidth={2} />
                </span>
                <div className="stat-content">
                    <span className="stat-value">{streak}</span>
                    <span className="stat-label">Day Streak</span>
                </div>
            </div>

            <div className="stat-divider"></div>

            <div className="stat-item">
                <span className="stat-icon score-icon">
                    <TrendingUp size={24} strokeWidth={2} />
                </span>
                <div className="stat-content">
                    <span className="stat-value">{productivityScore}%</span>
                    <span className="stat-label">Focus Score</span>
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;
