import React from 'react';
import { X, Clock, Eye, TrendingUp, Award } from 'lucide-react';

/**
 * SessionSummary component - Modal showing end-of-session stats
 */
const SessionSummary = ({
    isOpen,
    onClose,
    focusTime = 0,
    distractions = 0,
    productivityScore = 0,
    streak = 0
}) => {
    if (!isOpen) return null;

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds} seconds`;
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;
        }
        const hours = Math.floor(seconds / 3600);
        const mins = Math.round((seconds % 3600) / 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    };

    // Calculate grade based on productivity
    const getGrade = (score) => {
        if (score >= 90) return { letter: 'A+', color: '#00ff88' };
        if (score >= 80) return { letter: 'A', color: '#00ff88' };
        if (score >= 70) return { letter: 'B', color: '#00d4ff' };
        if (score >= 60) return { letter: 'C', color: '#ffa502' };
        if (score >= 50) return { letter: 'D', color: '#ff6b81' };
        return { letter: 'F', color: '#ff4757' };
    };

    const grade = getGrade(productivityScore);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="session-summary-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="summary-header">
                    <Award size={32} />
                    <h2>Session Complete!</h2>
                </div>

                <div className="summary-grade" style={{ '--grade-color': grade.color }}>
                    <span className="grade-letter">{grade.letter}</span>
                    <span className="grade-score">{productivityScore}%</span>
                </div>

                <div className="summary-stats">
                    <div className="summary-stat">
                        <Clock size={24} />
                        <span className="stat-value">{formatTime(focusTime)}</span>
                        <span className="stat-label">Focus Time</span>
                    </div>

                    <div className="summary-stat">
                        <Eye size={24} />
                        <span className="stat-value">{distractions}</span>
                        <span className="stat-label">Distractions</span>
                    </div>

                    <div className="summary-stat">
                        <TrendingUp size={24} />
                        <span className="stat-value">{streak} days</span>
                        <span className="stat-label">Focus Streak</span>
                    </div>
                </div>

                <button className="summary-close-btn" onClick={onClose}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default SessionSummary;
