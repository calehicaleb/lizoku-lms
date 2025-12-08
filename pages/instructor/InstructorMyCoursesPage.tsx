
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Course, CourseStatus } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';

const emptyCourse: Pick<Course, 'title' | 'description'> = {
    title: '',
    description: '',
};

const InstructorMyCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(emptyCourse);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        const fetchCourses = async () => {
            try {
                // FIX: Pass the instructor's ID to the API call.
                const data = await api.getInstructorCourses(user.id);
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch instructor courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user]);

    const handleOpenModal = () => {
        setFormData(emptyCourse);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id.replace('course-', '')]: value }));
    };

    const handleSave = async () => {
        if (!formData.title || !user) {
            alert('Course title is required.');
            return;
        }

        try {
            const courseData = {
                ...formData,
                instructorId: user.id,
                departmentId: 'd1', // Default department for now
            };
            const newCourse = await api.createCourse(courseData);
            setCourses(prev => [...prev, newCourse]);
            handleCloseModal();
            navigate(`/instructor/courses/${newCourse.id}`);
        } catch (error) {
            console.error("Failed to create course", error);
            alert("An error occurred while creating the course.");
        }
    };

    const handleSubmitForReview = async (courseId: string) => {
        if (!window.confirm("Are you sure you want to submit this course for review? You won't be able to make changes while it's pending.")) {
            return;
        }
        
        setSubmittingId(courseId);
        try {
            // We use updateCourse to change status
            const updated = await api.updateCourse(courseId, { status: CourseStatus.PendingReview });
            if (updated) {
                setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
                // Optional: alert removed for smoother UX as the UI updates immediately
            }
        } catch (error) {
            console.error("Failed to submit course", error);
            alert("Failed to submit course.");
        } finally {
            setSubmittingId(null);
        }
    };

    const getStatusBadge = (status: CourseStatus) => {
        switch (status) {
            case CourseStatus.Published:
                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case CourseStatus.PendingReview:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case CourseStatus.Rejected:
                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case CourseStatus.Draft:
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    if (loading) return <div>Loading your courses...</div>;

    return (
        <div>
            <PageHeader title="My Courses" subtitle="Manage your assigned courses and build content." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="h-36 bg-secondary-light dark:bg-secondary/20 flex items-center justify-center">
                            <Icon name="BookOpen" className="h-16 w-16 text-secondary dark:text-blue-400" />
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg flex-1 pr-2">{course.title}</h4>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(course.status)}`}>
                                    {course.status.replace('_', ' ')}
                                </span>
                            </div>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-grow">{course.description}</p>
                            
                            <div className="mt-4 space-y-2">
                                <Link 
                                    to={`/instructor/courses/${course.id}`} 
                                    className={`block w-full text-center font-bold py-2 px-4 rounded-md transition duration-300 ${
                                        course.status === CourseStatus.PendingReview 
                                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' 
                                            : 'bg-primary text-gray-800 hover:bg-primary-dark'
                                    }`}
                                >
                                    {course.status === CourseStatus.PendingReview ? 'View Content (Read Only)' : 'Manage Content'}
                                </Link>
                                {(course.status === CourseStatus.Draft || course.status === CourseStatus.Rejected) && (
                                    <button 
                                        onClick={() => handleSubmitForReview(course.id)}
                                        disabled={submittingId === course.id}
                                        className="block w-full text-center bg-white dark:bg-gray-700 text-secondary dark:text-blue-400 border border-secondary dark:border-blue-400 font-bold py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {submittingId === course.id ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : 'Submit for Review'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                 <button onClick={handleOpenModal} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-secondary dark:hover:text-blue-400 transition-colors cursor-pointer min-h-[250px]">
                    <div className="text-center">
                        <Icon name="Book" className="h-12 w-12 mx-auto" />
                        <span className="mt-2 block font-medium">Create New Course</span>
                    </div>
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Course" size="lg">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div>
                        <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                        <input type="text" id="course-title" value={formData.title} onChange={handleFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div>
                        <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Description</label>
                        <textarea id="course-description" rows={3} value={formData.description} onChange={handleFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Create and Build</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InstructorMyCoursesPage;
