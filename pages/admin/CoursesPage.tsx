import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Course, CourseStatus } from '../../types';
import { Icon } from '../../components/icons';
import { Link } from 'react-router-dom';

const emptyCourse: Partial<Course> = {
    title: '',
    description: '',
    departmentId: 'd1',
    instructorId: '2',
    status: CourseStatus.Draft,
};

const CoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState<Partial<Course>>(emptyCourse);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await api.getAllCourses();
                setCourses(data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchCourses();
    }, []);

    const handleUnlock = async (courseId: string) => {
        if (!window.confirm("WARNING: Unlocking this session will allow the instructor to change existing grades. Log this action?")) return;
        try {
            const success = await api.unlockSession(courseId);
            if (success) {
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: CourseStatus.Grading } : c));
                alert("Session unlocked for instructor correction.");
            }
        } catch (err) { alert("Action failed."); }
    };

    const getStatusBadge = (status: CourseStatus) => {
        switch (status) {
            case CourseStatus.Published: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case CourseStatus.Finalized: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case CourseStatus.Grading: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <PageHeader title="Course Registry" subtitle="Global view of all learning sessions and their grading status." />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left">Course</th>
                            <th className="px-4 py-3 text-left">Instructor</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {courses.map(course => (
                            <tr key={course.id}>
                                <td className="px-4 py-3 font-medium">{course.title}</td>
                                <td className="px-4 py-3 text-gray-500">{course.instructorName}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(course.status)}`}>
                                        {course.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-3">
                                        {course.status === CourseStatus.Finalized && (
                                            <button onClick={() => handleUnlock(course.id)} className="text-secondary flex items-center gap-1 hover:underline">
                                                {/* Fix: Changed Icon name from "Unlock" to valid name "Lock" as "Unlock" is not in the iconMap. */}
                                                <Icon name="Lock" className="h-4 w-4" /> Unlock
                                            </button>
                                        )}
                                        <Link to={`/admin/courses/${course.id}/preview`} className="text-gray-400 hover:text-gray-600">View</Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoursesPage;
