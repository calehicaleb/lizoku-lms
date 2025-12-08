
import React from 'react';
import { LeaderboardEntry } from '../../types';
import { Icon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';

interface CourseLeaderboardProps {
    entries: LeaderboardEntry[];
}

export const CourseLeaderboard: React.FC<CourseLeaderboardProps> = ({ entries }) => {
    const { user } = useAuth();
    const topThree = entries.slice(0, 3);
    const rest = entries.slice(3);
    const currentUserEntry = entries.find(e => e.studentId === user?.id);

    const getMedalColor = (rank: number) => {
        switch (rank) {
            case 1: return 'text-yellow-400'; // Gold
            case 2: return 'text-gray-400';   // Silver
            case 3: return 'text-orange-400'; // Bronze
            default: return 'text-gray-300';
        }
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
        if (trend === 'up') return <Icon name="ChevronDown" className="h-4 w-4 text-green-500 rotate-180" />; // Reusing ChevronDown rotated
        if (trend === 'down') return <Icon name="ChevronDown" className="h-4 w-4 text-red-500" />;
        return <span className="text-gray-400 text-xs font-bold">-</span>;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Course Leaderboard</h2>

            {/* Top 3 Podium */}
            <div className="flex justify-center items-end gap-4 mb-10">
                {/* 2nd Place */}
                {topThree[1] && (
                    <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <img src={topThree[1].avatarUrl} alt={topThree[1].name} className="w-16 h-16 rounded-full border-4 border-gray-300" />
                            <div className="absolute -bottom-2 -right-2 bg-gray-300 text-gray-800 font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">2</div>
                        </div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{topThree[1].name.split(' ')[0]}</p>
                        <p className="text-xs text-secondary font-bold">{topThree[1].points} XP</p>
                        <div className="w-20 h-24 bg-gray-200 dark:bg-gray-700 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                            <Icon name="Trophy" className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                    <div className="flex flex-col items-center z-10">
                        <div className="relative mb-2">
                            <Icon name="Star" className="absolute -top-6 left-1/2 transform -translate-x-1/2 h-6 w-6 text-yellow-400 fill-current animate-bounce" />
                            <img src={topThree[0].avatarUrl} alt={topThree[0].name} className="w-20 h-20 rounded-full border-4 border-yellow-400" />
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 font-bold w-8 h-8 flex items-center justify-center rounded-full">1</div>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{topThree[0].name.split(' ')[0]}</p>
                        <p className="text-sm text-secondary font-bold">{topThree[0].points} XP</p>
                        <div className="w-24 h-32 bg-yellow-100 dark:bg-yellow-900/40 rounded-t-lg mt-2 flex items-end justify-center pb-4 border-t-4 border-yellow-400">
                            <Icon name="Trophy" className="h-10 w-10 text-yellow-500" />
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                    <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <img src={topThree[2].avatarUrl} alt={topThree[2].name} className="w-16 h-16 rounded-full border-4 border-orange-300" />
                            <div className="absolute -bottom-2 -right-2 bg-orange-300 text-orange-900 font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">3</div>
                        </div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{topThree[2].name.split(' ')[0]}</p>
                        <p className="text-xs text-secondary font-bold">{topThree[2].points} XP</p>
                        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                            <Icon name="Trophy" className="h-8 w-8 text-orange-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* List View */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b dark:border-gray-700 flex text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="w-12 text-center">Rank</div>
                    <div className="flex-1">Student</div>
                    <div className="w-24 text-right">Points</div>
                    <div className="w-12 text-center">Trend</div>
                </div>
                <div className="divide-y dark:divide-gray-700">
                    {rest.map((entry) => (
                        <div key={entry.studentId} className={`flex items-center px-4 py-3 ${entry.studentId === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                            <div className="w-12 text-center font-bold text-gray-500 dark:text-gray-400">{entry.rank}</div>
                            <div className="flex-1 flex items-center">
                                <img src={entry.avatarUrl} alt={entry.name} className="w-8 h-8 rounded-full mr-3" />
                                <span className={`text-sm ${entry.studentId === user?.id ? 'font-bold text-primary-dark dark:text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {entry.name} {entry.studentId === user?.id && '(You)'}
                                </span>
                            </div>
                            <div className="w-24 text-right font-bold text-gray-800 dark:text-gray-100 text-sm">{entry.points}</div>
                            <div className="w-12 flex justify-center">{getTrendIcon(entry.trend)}</div>
                        </div>
                    ))}
                </div>
                {/* Sticky User Row if not in top list or visible list */}
                {currentUserEntry && currentUserEntry.rank > 3 && !rest.find(e => e.studentId === currentUserEntry.studentId) && (
                     <div className="border-t-2 border-primary bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex items-center shadow-inner">
                        <div className="w-12 text-center font-bold text-primary-dark dark:text-primary">{currentUserEntry.rank}</div>
                        <div className="flex-1 flex items-center">
                            <img src={currentUserEntry.avatarUrl} alt={currentUserEntry.name} className="w-8 h-8 rounded-full mr-3" />
                            <span className="text-sm font-bold text-primary-dark dark:text-primary">
                                {currentUserEntry.name} (You)
                            </span>
                        </div>
                        <div className="w-24 text-right font-bold text-primary-dark dark:text-primary text-sm">{currentUserEntry.points}</div>
                        <div className="w-12 flex justify-center">{getTrendIcon(currentUserEntry.trend)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
