
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { BarChart, DonutChart } from '../../components/common/Charts';
import * as api from '../../services/api';
import { RegionalStat } from '../../types';
import { Icon } from '../../components/icons';

const GeospatialPage: React.FC = () => {
    const [stats, setStats] = useState<RegionalStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getRegionalStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch geospatial data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalUsers = stats.reduce((acc, curr) => acc + curr.userCount, 0);
    const totalActive = stats.reduce((acc, curr) => acc + curr.activeLearners, 0);
    const avgCompletion = Math.round(stats.reduce((acc, curr) => acc + curr.completionRate, 0) / (stats.length || 1));

    const topRegions = [...stats].sort((a, b) => b.userCount - a.userCount).slice(0, 5);
    
    // Categorize counties by activity level for Donut Chart
    const activityLevels = {
        high: stats.filter(s => s.activeLearners > 200).length,
        medium: stats.filter(s => s.activeLearners > 50 && s.activeLearners <= 200).length,
        low: stats.filter(s => s.activeLearners <= 50).length
    };

    const topRegionsChartData = topRegions.map(r => ({ label: r.county, value: r.userCount }));
    
    const activityChartData = [
        { label: 'High Activity', value: activityLevels.high, color: '#10B981' },
        { label: 'Moderate', value: activityLevels.medium, color: '#FBBF24' },
        { label: 'Low/Underserved', value: activityLevels.low, color: '#EF4444' }
    ];

    const getHeatmapColor = (users: number) => {
        if (users > 500) return 'bg-green-600 dark:bg-green-500';
        if (users > 200) return 'bg-green-400 dark:bg-green-600';
        if (users > 100) return 'bg-yellow-300 dark:bg-yellow-600';
        if (users > 50) return 'bg-orange-300 dark:bg-orange-600';
        return 'bg-gray-200 dark:bg-gray-700';
    };

    const filteredStats = stats.filter(s => s.county.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div>Loading geospatial data...</div>;

    return (
        <div>
            <PageHeader title="Regional Impact Analysis" subtitle="Visualize training adoption and activity across Kenya's counties." />

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard data={{ icon: 'MapPin', title: 'Total Counties Reached', value: `${stats.length} / 47`, color: 'primary' }} />
                <StatCard data={{ icon: 'Users', title: 'Total Active Learners', value: totalActive.toLocaleString(), color: 'success' }} />
                <StatCard data={{ icon: 'CheckCircle', title: 'Avg. Completion Rate', value: `${avgCompletion}%`, color: 'info' }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Visual Heatmap Grid */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">County Activity Heatmap</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Color intensity represents the number of registered users per county.</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {stats.map(stat => (
                            <div key={stat.county} className="relative group cursor-help">
                                <div className={`h-12 w-full rounded-md flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200 transition-transform hover:scale-105 ${getHeatmapColor(stat.userCount)}`}>
                                    {stat.county.substring(0, 3).toUpperCase()}
                                </div>
                                {/* Tooltip */}
                                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-md py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                                    <p className="font-bold text-base mb-1">{stat.county}</p>
                                    <p>Users: {stat.userCount}</p>
                                    <p>Active: {stat.activeLearners}</p>
                                    <p>Completion: {stat.completionRate}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400 justify-center">
                        <div className="flex items-center"><div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 mr-1 rounded"></div> Low</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-orange-300 dark:bg-orange-600 mr-1 rounded"></div> Moderate</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-green-600 dark:bg-green-500 mr-1 rounded"></div> High</div>
                    </div>
                </div>

                {/* Charts Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase">Top 5 Regions</h3>
                        <div className="h-40">
                            <BarChart data={topRegionsChartData} height={160} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase">Regional Distribution</h3>
                        <div className="h-40">
                            <DonutChart data={activityChartData} height={160} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">County Data Breakdown</h3>
                    <div className="relative">
                        <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search county..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">County</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Registered Users</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Active Learners</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Activity Rate</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Completion %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredStats.map(stat => (
                                <tr key={stat.county} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{stat.county}</td>
                                    <td className="px-4 py-3 text-right">{stat.userCount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">{stat.activeLearners.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">{Math.round((stat.activeLearners / stat.userCount) * 100)}%</td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">{stat.completionRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GeospatialPage;
