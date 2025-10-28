
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

    if (loading) return <div>Loading your courses...</div>;

    return (
        <div>
            <PageHeader title="My Courses" subtitle="Manage your assigned courses and build content." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="h-36 bg-secondary-light flex items-center justify-center">
                            <Icon name="BookOpen" className="h-16 w-16 text-secondary" />
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800 text-lg flex-1 pr-2">{course.title}</h4>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                    course.status === CourseStatus.Published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {course.status}
                                </span>
                            </div>
                             <p className="text-sm text-gray-500 mt-1 flex-grow">{course.description}</p>
                            <Link to={`/instructor/courses/${course.id}`} className="mt-4 block w-full text-center bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300">
                                Manage Course
                            </Link>
                        </div>
                    </div>
                ))}
                 <button onClick={handleOpenModal} className="border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-secondary transition-colors cursor-pointer min-h-[250px]">
                    <div className="text-center">
                        <Icon name="Book" className="h-12 w-12 mx-auto" />
                        <span className="mt-2 block font-medium">Create New Course</span>
                    </div>
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Course">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div>
                        <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                        <input type="text" id="course-title" value={formData.title} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div>
                        <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 mb-1">Course Description</label>
                        <textarea id="course-description" rows={3} value={formData.description} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Create and Build</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InstructorMyCoursesPage;