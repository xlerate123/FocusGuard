import React from 'react';
import { BarChart3, Clock, Eye, TrendingUp, Calendar } from 'lucide-react';

/**
 * SessionHistory component - Shows past focus sessions and analytics
 */
const SessionHistory = ({ sessions = [], todayFocusTime = 0 }) => {
    // Get last 7 days of data
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const daySessions = sessions.filter(
                s => new Date(s.startTime).toDateString() === dateStr
            );
            const totalTime = daySessions.reduce((acc, s) => acc + s.focusTime, 0);
            const totalDistractions = daySessions.reduce((acc, s) => acc + s.distractions, 0);

            days.push({
                day: dayName,
                date: dateStr,
                focusTime: totalTime,
                distractions: totalDistractions,
                sessions: daySessions.length,
            });
        }
        return days;
    };

    const weekData = getLast7Days();
    const maxFocusTime = Math.max(...weekData.map(d => d.focusTime), 3600); // Min 1 hour for scale

    // Calculate weekly stats
    const weeklyTotal = weekData.reduce((acc, d) => acc + d.focusTime, 0);
    const weeklyDistractions = weekData.reduce((acc, d) => acc + d.distractions, 0);
    const avgDaily = Math.round(weeklyTotal / 7);

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        const hours = Math.floor(seconds / 3600);
        const mins = Math.round((seconds % 3600) / 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <div className="session-history">
            <div className="history-header">
                <BarChart3 size={20} />
                <h3>Weekly Overview</h3>
            </div>

            {/* Weekly Chart */}
            <div className="weekly-chart">
                {weekData.map((day, idx) => (
                    <div key={idx} className="chart-bar-container">
                        <div
                            className="chart-bar"
                            style={{ height: `${(day.focusTime / maxFocusTime) * 100}%` }}
                            title={`${day.date}: ${formatTime(day.focusTime)}`}
                        >
                            {day.focusTime > 0 && (
                                <span className="bar-value">{formatTime(day.focusTime)}</span>
                            )}
                        </div>
                        <span className="chart-label">{day.day}</span>
                    </div>
                ))}
            </div>

            {/* Weekly Summary */}
            <div className="weekly-summary">
                <div className="summary-item">
                    <Clock size={16} />
                    <span className="summary-label">Weekly Total</span>
                    <span className="summary-value">{formatTime(weeklyTotal)}</span>
                </div>
                <div className="summary-item">
                    <Calendar size={16} />
                    <span className="summary-label">Daily Avg</span>
                    <span className="summary-value">{formatTime(avgDaily)}</span>
                </div>
                <div className="summary-item">
                    <Eye size={16} />
                    <span className="summary-label">Distractions</span>
                    <span className="summary-value">{weeklyDistractions}</span>
                </div>
            </div>
        </div>
    );
};

export default SessionHistory;
