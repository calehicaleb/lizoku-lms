import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Examination, ExaminationStatus, User } from '../../types';
import { Icon } from '../../components/icons';

type AdminExamination = Examination & { instructorName: string };

const ExaminationsPage: React.FC = () => {
    const [examinations, setExaminations] = useState<AdminExamination[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState<ExaminationStatus | 'all'>('all');
    const [instructorFilter, setInstructorFilter] = useState<string | 'all'>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsData, instructorsData] = await Promise.all([
                    api.getAdminAllExaminations(),
                    api.getAllInstructors(),
                ]);
                setExaminations(examsData);
                setInstructors(instructorsData);
            } catch (error) {
                console.error("Failed to fetch examinations data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredExaminations = useMemo(() => {
        return examinations.filter(exam => {
            const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
            const matchesInstructor = instructorFilter === 'all' || exam.instructorId === instructorFilter;
            return matchesStatus && matchesInstructor;
        });
    }, [examinations, statusFilter, instructorFilter]);

    const handleDelete = async (examId: string) => {
        if (window.confirm('Are you sure you want to delete this examination? This action is permanent.')) {
            const result = await api.deleteExamination(examId);
            if (result.success) {
                setExaminations(prev => prev.filter(e => e.id !== examId));
            } else {
                alert('Failed to delete examination.');
            }
        }
    };

    const getStatusColor = (status: ExaminationStatus) => {
        switch (status) {
            case ExaminationStatus.Scheduled: return 'bg-blue-100 text-blue-800';
            case ExaminationStatus.Completed: return 'bg-green-100 text-green-800';
            case ExaminationStatus.Draft: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Loading examinations...</div>;

    return (
        <div>
            <PageHeader title="Examinations Management" subtitle="Oversee all examinations created across the platform." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Statuses</option>
                        {Object.values(ExaminationStatus).map(status => (
                            <option key={status} value={status} className="capitalize">{status}</option>
                        ))}
                    </select>
                    <select
                        value={instructorFilter}
                        onChange={e => setInstructorFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Instructors</option>
                        {instructors.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Exam Title</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Course</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Instructor</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Schedule</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExaminations.map(exam => (
                                <tr key={exam.id}>
                                    <td className="px-4 py-3 font-medium text-gray-900">{exam.title}</td>
                                    <td className="px-4 py-3 text-gray-500">{exam.courseTitle}</td>
                                    <td className="px-4 py-3 text-gray-500">{exam.instructorName}</td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(exam.scheduledStart).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(exam.status)}`}>
                                            {exam.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredExaminations.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No examinations match the current filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExaminationsPage;