
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { MultiLineChart, GroupedBarChart } from '../../components/common/Charts';
import * as api from '../../services/api';
import { DepartmentBudget, BudgetRequest, FinancialTrend } from '../../types';
import { Icon } from '../../components/icons';

const BudgetingPage: React.FC = () => {
    const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
    const [requests, setRequests] = useState<BudgetRequest[]>([]);
    const [trends, setTrends] = useState<FinancialTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'requests'>('overview');
    
    // Edit state
    const [editingBudget, setEditingBudget] = useState<{ id: string, amount: number } | null>(null);

    const fetchData = async () => {
        try {
            const [budgetData, requestData, trendsData] = await Promise.all([
                api.getDepartmentBudgets(),
                api.getBudgetRequests(),
                api.getFinancialTrends()
            ]);
            setBudgets(budgetData);
            setRequests(requestData);
            setTrends(trendsData);
        } catch (error) {
            console.error("Failed to fetch financial data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalAllocated = budgets.reduce((acc, curr) => acc + curr.allocatedAmount, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spentAmount, 0);
    const totalRevenue = budgets.reduce((acc, curr) => acc + curr.generatedRevenue, 0);
    const netIncome = totalRevenue - totalSpent;
    const roi = totalSpent > 0 ? ((netIncome / totalSpent) * 100).toFixed(1) : '0';

    const handleBudgetUpdate = async (deptId: string) => {
        if (!editingBudget) return;
        await api.updateDepartmentBudget(deptId, editingBudget.amount);
        setBudgets(prev => prev.map(b => b.departmentId === deptId ? { ...b, allocatedAmount: editingBudget.amount } : b));
        setEditingBudget(null);
    };

    const handleApproveRequest = async (request: BudgetRequest) => {
        await api.approveBudgetRequest(request.id);
        fetchData(); // Refresh to update spent amounts
    };

    const handleRejectRequest = async (id: string) => {
        await api.rejectBudgetRequest(id);
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    };

    if (loading) return <div>Loading financial data...</div>;

    // Chart Data Preparation
    const trendChartData = {
        labels: trends.map(t => t.month),
        datasets: [
            { label: 'Revenue', data: trends.map(t => t.revenue), color: '#10B981' }, // Green
            { label: 'Expenses', data: trends.map(t => t.expenses), color: '#EF4444' }, // Red
        ]
    };

    const budgetUtilizationData = budgets.map(b => ({
        label: b.departmentName.replace('School of ', '').replace('Faculty of ', ''),
        value1: b.allocatedAmount,
        value2: b.spentAmount,
    }));

    return (
        <div>
            <PageHeader title="Financial Strategy" subtitle="Comprehensive tracking of revenue, expenses, and budget allocation." />

            {/* Dashboard Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="border-b dark:border-gray-700 px-6 pt-4">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                activeTab === 'overview'
                                    ? 'border-primary text-secondary dark:text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Financial Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                activeTab === 'analysis'
                                    ? 'border-primary text-secondary dark:text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Department Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                activeTab === 'requests'
                                    ? 'border-primary text-secondary dark:text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Budget Requests
                            {requests.filter(r => r.status === 'pending').length > 0 && (
                                <span className="ml-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {requests.filter(r => r.status === 'pending').length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard 
                                    data={{ icon: 'DollarSign', title: 'Total Revenue', value: `KSh ${totalRevenue.toLocaleString()}`, color: 'success' }} 
                                />
                                <StatCard 
                                    data={{ icon: 'Banknote', title: 'Total Expenses', value: `KSh ${totalSpent.toLocaleString()}`, color: 'warning' }} 
                                />
                                <StatCard 
                                    data={{ icon: 'PieChart' as any, title: 'Net Income', value: `KSh ${netIncome.toLocaleString()}`, color: netIncome >= 0 ? 'primary' : 'warning' }} 
                                />
                                <StatCard 
                                    data={{ icon: 'TrendingUp' as any, title: 'ROI', value: `${roi}%`, color: 'info' }} 
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Financial Trends Chart */}
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg border dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Financial Trends (6 Months)</h3>
                                    <div className="h-64 w-full">
                                        <MultiLineChart data={trendChartData} height={250} />
                                    </div>
                                </div>

                                {/* Budget Utilization Chart */}
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg border dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Budget Utilization by Dept</h3>
                                    <div className="h-64 w-full">
                                        <GroupedBarChart data={budgetUtilizationData} label1="Allocated" label2="Spent" height={250} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Department</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Revenue Generated</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 w-1/4">Budget Utilization</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Net Profit/Loss</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Allocated Budget</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {budgets.map(budget => {
                                        const isProfitable = budget.netIncome >= 0;
                                        const usagePercent = Math.min(100, Math.round((budget.spentAmount / budget.allocatedAmount) * 100));
                                        
                                        // Color logic for progress bar
                                        let barColor = 'bg-green-500';
                                        if (usagePercent > 90) barColor = 'bg-red-500';
                                        else if (usagePercent > 75) barColor = 'bg-yellow-500';

                                        return (
                                            <tr key={budget.departmentId}>
                                                <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{budget.departmentName}</td>
                                                <td className="px-4 py-4 text-right text-green-600 font-medium">KSh {budget.generatedRevenue.toLocaleString()}</td>
                                                <td className="px-4 py-4 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span>Spent: KSh {budget.spentAmount.toLocaleString()}</span>
                                                            <span className="font-bold">{usagePercent}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${usagePercent}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-4 text-right font-bold ${isProfitable ? 'text-blue-600' : 'text-red-600'}`}>
                                                    KSh {budget.netIncome.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-right text-gray-900 dark:text-gray-100 font-mono">
                                                    {editingBudget?.id === budget.departmentId ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <input 
                                                                type="number" 
                                                                value={editingBudget.amount} 
                                                                onChange={e => setEditingBudget({ ...editingBudget, amount: Number(e.target.value) })}
                                                                className="w-24 p-1 border rounded dark:bg-gray-700"
                                                            />
                                                            <button onClick={() => handleBudgetUpdate(budget.departmentId)} className="text-green-600"><Icon name="CheckCircle" className="h-5 w-5" /></button>
                                                            <button onClick={() => setEditingBudget(null)} className="text-red-600"><Icon name="X" className="h-5 w-5" /></button>
                                                        </div>
                                                    ) : (
                                                        `KSh ${budget.allocatedAmount.toLocaleString()}`
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button onClick={() => setEditingBudget({ id: budget.departmentId, amount: budget.allocatedAmount })} className="text-secondary hover:underline text-xs font-bold">Edit Budget</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {requests.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No funding requests found.</p>
                            ) : (
                                requests.map(req => {
                                    // Context: Find if the requesting department is profitable
                                    const dept = budgets.find(b => b.departmentName === req.departmentName);
                                    const isDeptProfitable = dept && dept.netIncome > 0;

                                    return (
                                        <div key={req.id} className="border dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-gray-700/30">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{req.title}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                                        req.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                        req.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>{req.status}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1"><strong>Reason:</strong> {req.justification}</p>
                                                <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center"><Icon name="User" className="h-3 w-3 mr-1" /> {req.requesterName}</span>
                                                    <span className="flex items-center">
                                                        <Icon name="Building" className="h-3 w-3 mr-1" /> 
                                                        {req.departmentName}
                                                        {isDeptProfitable ? 
                                                            <span className="ml-1 text-green-600 font-bold">(Profitable)</span> : 
                                                            <span className="ml-1 text-red-500 font-bold">(Loss Making)</span>
                                                        }
                                                    </span>
                                                    <span>{new Date(req.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2 min-w-[120px]">
                                                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">KSh {req.amount.toLocaleString()}</p>
                                                {req.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleApproveRequest(req)} className="bg-green-600 text-white p-2 rounded hover:bg-green-700" title="Approve">
                                                            <Icon name="CheckCircle" className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleRejectRequest(req.id)} className="bg-red-600 text-white p-2 rounded hover:bg-red-700" title="Reject">
                                                            <Icon name="X" className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetingPage;
