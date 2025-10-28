import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { ActivityLog, ActivityActionType } from '../../types';
import { Icon } from '../../components/icons';

const ActivityLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<ActivityActionType | 'all'>('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await api.getActivityLogs();
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch activity logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const logDate = new Date(log.timestamp);
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end) : null;

            if (startDate) startDate.setHours(0, 0, 0, 0); // Start of day
            if (endDate) endDate.setHours(23, 59, 59, 999); // End of day

            const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  log.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAction = actionFilter === 'all' || log.action === actionFilter;
            const matchesDate = (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);

            return matchesSearch && matchesAction && matchesDate;
        });
    }, [logs, searchTerm, actionFilter, dateRange]);

    const getActionIcon = (action: ActivityActionType): React.ReactNode => {
        const iconProps = { className: "h-4 w-4" };
        switch (action) {
            case 'login': return <Icon name="KeyRound" {...iconProps} />;
            case 'create': return <Icon name="PenSquare" {...iconProps} />;
            case 'update': return <Icon name="Wrench" {...iconProps} />;
            case 'delete': return <Icon name="X" {...iconProps} />;
            default: return <Icon name="History" {...iconProps} />;
        }
    };
    
    const getActionColor = (action: ActivityActionType): string => {
        switch (action) {
            case 'login': return 'bg-sky-100 text-sky-800';
            case 'create': return 'bg-green-100 text-green-800';
            case 'update': return 'bg-yellow-100 text-yellow-800';
            case 'delete': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Loading activity logs...</div>;

    return (
        <div>
            <PageHeader title="Activity Logs" subtitle="Track important events and actions across the platform." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <input 
                        type="text"
                        placeholder="Search user or action..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="lg:col-span-2 w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select 
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md capitalize focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Actions</option>
                        {Object.values(ActivityActionType).map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-2">
                         <input 
                            type="date"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                         <span className="text-gray-500">-</span>
                        <input 
                            type="date"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">User</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Action</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Description</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={log.userAvatarUrl} alt={log.userName} className="h-8 w-8 rounded-full mr-3" />
                                            <span className="font-medium text-gray-900">{log.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full capitalize ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{log.description}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredLogs.length === 0 && (
                        <div className="text-center py-16 px-6">
                            <Icon name="ListChecks" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Logs Found</h3>
                            <p className="mt-1 text-sm text-gray-500">No activity logs match your current filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogsPage;