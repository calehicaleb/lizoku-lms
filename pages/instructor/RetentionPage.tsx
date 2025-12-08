
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Icon } from '../../components/icons';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { AtRiskStudent } from '../../types';

const RetentionPage: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<AtRiskStudent[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Nudge Modal State
    const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null);
    const [nudgeMessage, setNudgeMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const data = await api.getAtRiskStudents(user.id);
                setStudents(data);
            } catch (error) {
                console.error("Failed to load retention data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const stats = useMemo(() => {
        return {
            total: students.length,
            highRisk: students.filter(s => s.riskLevel === 'High').length,
            moderateRisk: students.filter(s => s.riskLevel === 'Moderate').length
        };
    }, [students]);

    const handleOpenNudge = (student: AtRiskStudent) => {
        setSelectedStudent(student);
        setNudgeMessage(`Hi ${student.name.split(' ')[0]},\n\nI noticed you've been having some trouble keeping up with the course material recently. Is there anything I can help you with?\n\nBest,\n${user?.name}`);
        setIsNudgeModalOpen(true);
    };

    const handleSendNudge = async () => {
        if (!selectedStudent) return;
        setIsSending(true);
        try {
            await api.sendNudge(selectedStudent.studentId, nudgeMessage);
            alert(`Nudge sent to ${selectedStudent.name}!`);
            setIsNudgeModalOpen(false);
        } catch (error) {
            alert("Failed to send nudge.");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return <div>Loading retention data...</div>;

    return (
        <div>
            <PageHeader title="Student Retention" subtitle="Identify and support students who may be falling behind." />

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-primary">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Total At-Risk</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</p>
                        </div>
                        <Icon name="Users" className="h-10 w-10 text-primary opacity-50" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">High Risk</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.highRisk}</p>
                        </div>
                        <Icon name="AlertTriangle" className="h-10 w-10 text-red-500 opacity-50" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Moderate Risk</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.moderateRisk}</p>
                        </div>
                        <Icon name="Info" className="h-10 w-10 text-yellow-500 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">At-Risk Students</h3>
                </div>
                
                {students.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Icon name="CheckCircle" className="h-12 w-12 mx-auto text-green-500 mb-3" />
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No students are currently at risk!</p>
                        <p>Great job keeping everyone on track.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Level</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Factors</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Grade</th>
                                    <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {students.map(student => (
                                    <tr key={student.studentId}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-full" src={student.avatarUrl} alt="" />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                student.riskLevel === 'High' 
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' 
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                            }`}>
                                                {student.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {student.riskFactors.map((factor, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                        {factor}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {new Date(student.lastLogin).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 dark:text-gray-200">
                                            {student.currentGradeAverage}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => handleOpenNudge(student)}
                                                className="text-white bg-secondary hover:bg-secondary-dark font-medium rounded-md text-xs px-3 py-2 transition-colors flex items-center justify-end ml-auto"
                                            >
                                                <Icon name="Send" className="h-3 w-3 mr-1" /> Nudge
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Nudge Modal */}
            <Modal isOpen={isNudgeModalOpen} onClose={() => setIsNudgeModalOpen(false)} title={`Send Nudge to ${selectedStudent?.name}`} size="lg">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Send a quick, supportive message to check in on this student. 
                        The message will be sent via email and in-app notification.
                    </p>
                    <div>
                        <label htmlFor="nudge-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                        <textarea
                            id="nudge-message"
                            rows={6}
                            value={nudgeMessage}
                            onChange={e => setNudgeMessage(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex justify-end pt-4 space-x-3">
                        <button 
                            onClick={() => setIsNudgeModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSendNudge}
                            disabled={isSending}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark text-gray-900 rounded-md disabled:opacity-50 flex items-center"
                        >
                            {isSending ? 'Sending...' : <><Icon name="Send" className="h-4 w-4 mr-2" /> Send Nudge</>}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RetentionPage;
