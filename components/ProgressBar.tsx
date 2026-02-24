
import React from 'react';

interface ProgressBarProps {
    progress: number;
    color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = 'bg-primary' }) => {
    const safeProgress = isNaN(progress) ? 0 : progress;
    const progressPercentage = Math.max(0, Math.min(100, safeProgress));
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
                className={`${color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
    );
};
