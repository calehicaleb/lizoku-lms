
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Course, CourseStatus, Semester } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';

const emptyCourse: Partial<Course> = {
    title: '',
    description: '',
    semesterId: '',
};

const InstructorMyCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(emptyCourse);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [coursesData, semestersData] = await Promise.all([
                    api.getInstructorCourses(user.id),
                    api.getSemesters()
                ]);
                setCourses(coursesData);
                setSemesters(semestersData);
                if (semestersData.length > 0) {
                    setFormData(prev => ({ ...prev, semesterId: semestersData.find(s => s.status === 'active')?.id || semestersData[0].id }));
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const groupedCourses = useMemo(() => {
        return {
            active: courses.filter(c => c.status !== CourseStatus.Archived),
            archived: courses.filter(c => c.status === CourseStatus.Archived)
        };
    }, [courses]);

    const handleSave = async () => {
        if (!formData.title || !user) {
            alert('Course title is required.');
            return;
        }
        try {
            const courseData = { ...formData, instructorId: user.id, departmentId: 'd1' };
            const newCourse = await api.createCourse(courseData);
            setCourses(prev => [...prev, newCourse]);
            setIsModalOpen(false);
            navigate(`/instructor/courses/${newCourse.id}`);
        } catch (error) {
            alert("An error occurred.");
        }
    };

    const getStatusBadge = (status: CourseStatus) => {
        switch (status) {
            case CourseStatus.Published: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case CourseStatus.Archived: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        }
    };

    if (loading) return <div>Loading your sessions...</div>;

    const CourseGrid = ({ items }: { items: Course[] }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(course => (
                <div key={course.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                        <span className="text-xs font-bold text-secondary dark:text-blue-400 uppercase tracking-widest">{course.semesterName}</span>
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full capitalize ${getStatusBadge(course.status)}`}>{course.status}</span>
                    </div>
                    <div className="p-4 flex-grow">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{course.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                    </div>
                    <div className="p-4 pt-0">
                        <Link to={`/instructor/courses/${course.id}`} className="block w-full text-center bg-primary text-gray-800 font-bold py-2 rounded-md hover:bg-primary-dark transition duration-300">
                            {course.status === CourseStatus.Archived ? 'View Records' : 'Manage Session'}
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <PageHeader title="Teaching Sessions" subtitle="Manage active sessions and access historical records from previous semesters." />
            
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Icon name="BookOpen" className="text-primary" /> Active & Upcoming Sessions
                    </h3>
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="Book" className="h-5 w-5 mr-2" /> Start New Session
                    </button>
                </div>
                <CourseGrid items={groupedCourses.active} />
            </div>

            {groupedCourses.archived.length > 0 && (
                <div className="mt-12 border-t dark:border-gray-700 pt-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 opacity-60">
                        <Icon name="History" className="text-gray-400" /> Historical Archive
                    </h3>
                    <CourseGrid items={groupedCourses.archived} />
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start New Course Session" size="lg">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Course Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Semester / Term</label>
                        <select value={formData.semesterId} onChange={e => setFormData({ ...formData, semesterId: e.target.value })} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                            {semesters.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary rounded-md">Create Session</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InstructorMyCoursesPage;
