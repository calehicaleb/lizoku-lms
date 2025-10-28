
import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { StatCardData, User, Announcement } from '../../types';
import { Icon } from '../../components/icons';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<StatCardData[]>([]);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, usersData, announcementData] = await Promise.all([
                    api.getAdminStats(),
                    api.getRecentUsers(5),
                    api.getLatestAnnouncement()
                ]);
                setStats(statsData);
                setRecentUsers(usersData);
                setLatestAnnouncement(announcementData);
            } catch (error) {
                console.error("Failed to fetch admin dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <PageHeader title="Admin Dashboard" subtitle="An overview of your LMS platform activity." />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => <StatCard key={stat.title} data={stat} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Sign-ups</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Role</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {recentUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">{user.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400 capitalize">{user.role}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                                user.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>{user.status}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.createdAt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Latest Announcement</h3>
                    <div className="space-y-4">
                         {latestAnnouncement ? (
                            <div className="p-4 bg-secondary-light dark:bg-secondary/20 rounded-lg">
                                <h4 className="font-bold text-secondary dark:text-blue-300">{latestAnnouncement.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{latestAnnouncement.content}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Posted on {latestAnnouncement.createdAt}</p>
                            </div>
                         ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No announcements yet.</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
