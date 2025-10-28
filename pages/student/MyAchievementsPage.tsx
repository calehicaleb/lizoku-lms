import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Icon } from '../../components/icons';
import * as api from '../../services/api';
import { Achievement } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MyAchievementsPage: React.FC = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchAchievements = async () => {
            try {
                const data = await api.getStudentAchievements(user.id);
                setAchievements(data);
            } catch (error) {
                console.error("Failed to fetch achievements", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, [user]);

    if (loading) {
        return <div className="text-center p-8">Loading achievements...</div>;
    }

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    return (
        <div>
            <PageHeader title="My Achievements" subtitle="Track your milestones and accomplishments throughout your learning journey." />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Progress</h2>
                <div className="flex items-center gap-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div 
                            className="bg-primary h-4 rounded-full transition-all duration-500" 
                            style={{ width: totalCount > 0 ? `${(unlockedCount / totalCount) * 100}%` : '0%' }}
                        ></div>
                    </div>
                    <span className="font-bold text-lg text-primary-dark">{unlockedCount} / {totalCount}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You've unlocked {unlockedCount} of {totalCount} available achievements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map(ach => (
                    <div 
                        key={ach.id} 
                        className={`p-6 rounded-lg flex items-center gap-6 transition-all duration-300 ${
                            ach.unlocked 
                                ? 'bg-white dark:bg-gray-800 shadow-lg border-2 border-primary' 
                                : 'bg-gray-100 dark:bg-gray-700/50 opacity-60'
                        }`}
                    >
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${ach.unlocked ? 'bg-primary/20' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <Icon 
                                name={ach.icon} 
                                className={`h-8 w-8 ${ach.unlocked ? 'text-primary-dark' : 'text-gray-500'}`} 
                            />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${ach.unlocked ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{ach.title}</h3>
                            <p className={`text-sm ${ach.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{ach.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyAchievementsPage;
