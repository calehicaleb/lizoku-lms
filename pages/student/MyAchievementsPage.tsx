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
        return <div className="text-center p-8">Loading your achievements...</div>;
    }

    return (
        <div>
            <PageHeader title="My Achievements" subtitle="Badges and honors you've earned on your learning journey." />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map(ach => (
                    <div 
                        key={ach.id}
                        className={`p-6 rounded-lg flex items-center space-x-4 transition-all duration-300 ${
                            ach.unlocked 
                                ? 'bg-white shadow-sm hover:shadow-md' 
                                : 'bg-gray-100 filter grayscale opacity-70'
                        }`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${ach.unlocked ? 'bg-primary/20 text-primary-dark' : 'bg-gray-300 text-gray-500'}`}>
                            <Icon name={ach.icon} className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${ach.unlocked ? 'text-gray-800' : 'text-gray-600'}`}>
                                {ach.title}
                            </h3>
                            <p className="text-sm text-gray-500">{ach.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyAchievementsPage;