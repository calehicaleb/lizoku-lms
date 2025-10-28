
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { UserSession, UserRole } from '../../types';
import { Icon } from '../../components/icons';

const SessionManagementPage: React.FC = () => {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await api.getActiveSessions();
                setSessions(data);
            } catch (error) {
                console.error("Failed to fetch active sessions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => roleFilter === 'all' || session.userRole === roleFilter);
    }, [sessions, roleFilter]);

    const handleTerminate = async (sessionId: string) => {
        if (window.confirm('Are you sure you want to force logout this user?')) {
            setActioningId(sessionId);
            try {
                const result = await api.terminateSession(sessionId);
                if (result.success) {
                    setSessions(prev => prev.filter(s => s.id !== sessionId));
                } else {
                    alert('Failed to terminate session.');
                }
            } catch (error) {
                console.error("Failed to terminate session", error);
                alert('An error occurred while terminating the session.');
            } finally {
                setActioningId(null);
            }
        }
    };

    if (loading) return <div>Loading active sessions...</div>;

    return (
        <div>
            <PageHeader title="Session Management" subtitle="Monitor and manage all active user sessions." />
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                     <select 
                        value={roleFilter} 
                        onChange={e => setRoleFilter(e.target.value as any)} 
                        className="w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Filter by All Roles</option>
                        {Object.values(UserRole).map(role => <option key={role} value={role} className="capitalize">{role}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">User</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Role</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Login Time</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Last Active</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">IP Address</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredSessions.map(session => (
                                <tr key={session.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={session.userAvatarUrl} alt={session.userName} className="h-8 w-8 rounded-full mr-3" />
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{session.userName}</span>
                                        </div>
                                    </td>
                                     <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400 capitalize">{session.userRole}</td>
                                     <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(session.loginTime).toLocaleString()}</td>
                                     <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(session.lastActiveTime).toLocaleString()}</td>
                                     <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{session.ipAddress}</td>
                                     <td className="px-4 py-3 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleTerminate(session.id)}
                                            disabled={actioningId === session.id}
                                            className="bg-red-600 text-white font-bold py-1 px-3 rounded-md hover:bg-red-700 text-xs disabled:bg-gray-400"
                                        >
                                            {actioningId === session.id ? '...' : 'Force Logout'}
                                        </button>
                                     </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredSessions.length === 0 && (
                        <div className="text-center py-16 px-6">
                            <Icon name="Users" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No Active Sessions</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are currently no active user sessions matching your filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionManagementPage;
