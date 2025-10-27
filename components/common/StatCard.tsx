
import React from 'react';
import { StatCardData } from '../../types';
import { Icon } from '../icons';

interface StatCardProps {
    data: StatCardData;
}

const colorClasses: { [key: string]: string } = {
    primary: 'bg-primary/20 text-primary-dark',
    secondary: 'bg-secondary/20 text-secondary',
    success: 'bg-green-500/20 text-green-600',
    warning: 'bg-yellow-500/20 text-yellow-600',
    info: 'bg-sky-500/20 text-sky-600',
};

export const StatCard: React.FC<StatCardProps> = ({ data }) => {
    const { icon, title, value, color } = data;
    const bgColorClass = colorClasses[color] || colorClasses.primary;

    return (
        <div className="bg-white rounded-lg p-5 shadow-sm flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${bgColorClass}`}>
                {/* Fix: Removed 'as any' type assertion. The 'icon' prop is now correctly typed as IconName. */}
                <Icon name={icon} className="w-8 h-8" />
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                <p className="text-gray-500">{title}</p>
            </div>
        </div>
    );
};