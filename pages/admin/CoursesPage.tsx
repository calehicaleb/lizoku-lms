import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Course, CourseStatus } from '../../types';
import { Icon } from '../../components/icons';

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
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleOpenModal = (course: Course | null = null) => {
        if (course) {
            setSelectedCourse(course);
            setFormData(course);
        } else {
            setSelectedCourse(null);
            setFormData(emptyCourse);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
        setFormData(emptyCourse);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id.replace('course-', '')]: value }));
    };

    const handleSave = async () => {
        if (!formData.title || !formData.instructorId || !formData.departmentId) {
            alert('Please fill all required fields.');
            return;
        }

        try {
            if (selectedCourse) {
                // Update logic
                const updatedCourse = await api.updateCourse(selectedCourse.id, formData as any);
                if (updatedCourse) {
                    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
                }
            } else {
                // Create logic
                const newCourse = await api.createCourse(formData as any);
                setCourses([...courses, newCourse]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save course", error);
            alert("An error occurred while saving the course.");
        }
    };
    
    const handleDelete = async (courseId: string) => {
        if (window.confirm('Are you sure you want to delete this course? This action is permanent.')) {
            try {
                const result = await api.deleteCourse(courseId);
                if (result.success) {
                    setCourses(courses.filter(c => c.id !== courseId));
                } else {
                     alert('Failed to delete the course.');
                }
            } catch (error) {
                console.error("Failed to delete course", error);
                alert("An error occurred while deleting the course.");
            }
        }
    };


    if (loading) return <div>Loading courses...</div>;

    return (
        <div>
            <PageHeader title="Course Management" subtitle="A comprehensive view of all courses on the platform." />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="Book" className="h-5 w-5 mr-2" />
                        Add Course
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Course Title</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Instructor</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Department</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">{course.title}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{course.instructorName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{course.departmentName}</td>
                                     <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                            course.status === CourseStatus.Published ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap space-x-4">
                                        <button onClick={() => handleOpenModal(course)} className="text-secondary dark:text-blue-400 hover:text-secondary-dark font-medium">Edit</button>
                                        <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedCourse ? 'Edit Course' : 'Add Course'}>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                        <input type="text" id="course-title" value={formData.title} onChange={handleFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea id="course-description" rows={3} value={formData.description} onChange={handleFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="course-departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                            <select id="course-departmentId" value={formData.departmentId} onChange={handleFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="d1">School of Computing</option>
                                <option value="d2">Business School</option>
                                <option value="d3">School of Design</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="course-instructorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor</label>
                             <select id="course-instructorId" value={formData.instructorId} onChange={handleFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="2">Instructor Sam</option>
                                <option value="6">Inactive Bob</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CoursesPage;