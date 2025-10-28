
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { Icon } from '../../components/icons';
import * as api from '../../services/api';
import { Examination, ExaminationStatus, Question, Course } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const getEmptyExam = (instructorId: string, courses: Course[]): Omit<Examination, 'id' | 'status' | 'courseTitle'> => ({
    instructorId,
    title: '',
    instructions: '',
    courseId: courses.length > 0 ? courses[0].id : '',
    scheduledStart: '',
    scheduledEnd: '',
    durationMinutes: 60,
    questionIds: [],
    shuffleQuestions: false,
});


const ExaminationsPage: React.FC = () => {
    const { user } = useAuth();
    const [examinations, setExaminations] = useState<Examination[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal and Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
    const [formData, setFormData] = useState<Omit<Examination, 'id' | 'status' | 'courseTitle'>>(() => user ? getEmptyExam(user.id, []) : {} as any);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
    
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [examsData, coursesData, questionsData] = await Promise.all([
                    api.getInstructorExaminations(user.id),
                    // FIX: Pass the instructor's ID to the API call.
                    api.getInstructorCourses(user.id),
                    api.getQuestions(user.id),
                ]);
                setExaminations(examsData);
                setCourses(coursesData);
                setQuestions(questionsData);
            } catch (error) {
                console.error("Failed to fetch examination data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleOpenModal = (exam: Examination | null = null) => {
        if (exam) {
            setSelectedExam(exam);
            setFormData({
                instructorId: exam.instructorId,
                title: exam.title,
                instructions: exam.instructions,
                courseId: exam.courseId,
                scheduledStart: exam.scheduledStart.substring(0, 16), // Format for datetime-local
                scheduledEnd: exam.scheduledEnd.substring(0, 16),
                durationMinutes: exam.durationMinutes,
                questionIds: exam.questionIds,
                shuffleQuestions: exam.shuffleQuestions,
            });
            setSelectedQuestionIds(new Set(exam.questionIds));
        } else {
            setSelectedExam(null);
            setFormData(user ? getEmptyExam(user.id, courses) : {} as any);
            setSelectedQuestionIds(new Set());
        }
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleQuestionToggle = (questionId: string) => {
        setSelectedQuestionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        if (!user || !formData.title || !formData.courseId || !formData.scheduledStart || !formData.scheduledEnd) {
            alert('Please fill all required fields.');
            return;
        }

        const payload = {
            ...formData,
            questionIds: Array.from(selectedQuestionIds),
            durationMinutes: Number(formData.durationMinutes),
            // Convert local datetime string to ISO string
            scheduledStart: new Date(formData.scheduledStart).toISOString(),
            scheduledEnd: new Date(formData.scheduledEnd).toISOString(),
        };

        try {
            if (selectedExam) {
                const updated = await api.updateExamination(selectedExam.id, payload);
                if (updated) {
                    setExaminations(examinations.map(e => e.id === updated.id ? updated : e));
                }
            } else {
                const created = await api.createExamination(payload);
                setExaminations([created, ...examinations]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save examination", error);
        }
    };
    
    const handleDelete = async (examId: string) => {
        if (window.confirm('Are you sure you want to delete this examination?')) {
            const result = await api.deleteExamination(examId);
            if (result.success) {
                setExaminations(examinations.filter(e => e.id !== examId));
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
            <PageHeader title="Examinations" subtitle="Create, schedule, and manage formal, timed assessments." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="ListChecks" className="h-5 w-5 mr-2" />
                        Create New Examination
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Title</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Course</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Schedule Window</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Duration</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {examinations.map(exam => (
                                <tr key={exam.id}>
                                    <td className="px-4 py-3 font-medium text-gray-900">{exam.title}</td>
                                    <td className="px-4 py-3 text-gray-500">{exam.courseTitle}</td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(exam.scheduledStart).toLocaleString()} - {new Date(exam.scheduledEnd).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-500">{exam.durationMinutes} min</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(exam.status)}`}>
                                            {exam.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-4">
                                        <button onClick={() => handleOpenModal(exam)} className="text-secondary hover:text-secondary-dark font-medium">Edit</button>
                                        <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedExam ? 'Edit Examination' : 'Create Examination'}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                             <input type="text" id="title" value={formData.title} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                             <select id="courseId" value={formData.courseId} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border rounded-md">
                                 {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                             <input type="number" id="durationMinutes" value={formData.durationMinutes} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border rounded-md" />
                        </div>
                        <div>
                             <label htmlFor="scheduledStart" className="block text-sm font-medium text-gray-700 mb-1">Schedule Start</label>
                             <input type="datetime-local" id="scheduledStart" value={formData.scheduledStart} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="scheduledEnd" className="block text-sm font-medium text-gray-700 mb-1">Schedule End</label>
                             <input type="datetime-local" id="scheduledEnd" value={formData.scheduledEnd} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border rounded-md" />
                        </div>
                         <div className="md:col-span-2">
                             <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                             <textarea id="instructions" value={formData.instructions} onChange={handleFormChange} rows={3} className="w-full px-3 py-2 bg-white border rounded-md" />
                        </div>
                         <div className="md:col-span-2 flex items-center">
                            <input type="checkbox" id="shuffleQuestions" checked={formData.shuffleQuestions} onChange={handleFormChange} className="h-4 w-4 text-primary rounded" />
                            <label htmlFor="shuffleQuestions" className="ml-2 block text-sm text-gray-900">Shuffle question order for each student</label>
                        </div>
                    </div>
                    {/* Question Selector */}
                     <div>
                        <h3 className="font-bold mb-2">Questions ({selectedQuestionIds.size} selected)</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                            {questions.map(q => (
                                <label key={q.id} className="flex items-start p-2 bg-gray-50 rounded-md cursor-pointer">
                                    <input type="checkbox" checked={selectedQuestionIds.has(q.id)} onChange={() => handleQuestionToggle(q.id)} className="h-4 w-4 text-primary mt-1" />
                                    <div className="ml-3 text-sm">
                                        <p className="font-medium text-gray-900">{q.stem}</p>
                                        <p className="text-xs text-gray-500 capitalize">{q.type.replace('-', ' ')}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className="pt-4 mt-4 border-t flex justify-end space-x-2">
                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border rounded-md">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border rounded-md">Save Examination</button>
                </div>
            </Modal>
        </div>
    );
};

export default ExaminationsPage;