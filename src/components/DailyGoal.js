import React from 'react';
import { Target, CheckCircle } from 'lucide-react';

/**
 * DailyGoal component - Shows progress towards daily focus goal
 */
const DailyGoal = ({ currentTime, goalTime = 7200, onGoalReached }) => {
    const progress = Math.min(100, (currentTime / goalTime) * 100);
    const isComplete = currentTime >= goalTime;

    // Format time for display
    const formatGoalTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    };

    // Notify when goal reached
    React.useEffect(() => {
        if (isComplete) {
            onGoalReached?.();
        }
    }, [isComplete, onGoalReached]);

    return (
        <div className={`daily-goal ${isComplete ? 'complete' : ''}`}>
            <div className="goal-header">
                <span className="goal-icon">
                    {isComplete ? <CheckCircle size={18} /> : <Target size={18} />}
                </span>
                <span className="goal-title">Daily Goal</span>
                <span className="goal-progress-text">
                    {formatGoalTime(currentTime)} / {formatGoalTime(goalTime)}
                </span>
            </div>

            <div className="goal-bar">
                <div
                    className="goal-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="goal-percentage">
                {Math.round(progress)}% {isComplete && '- Goal Reached!'}
            </div>
        </div>
    );
};

export default DailyGoal;
