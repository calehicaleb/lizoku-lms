import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { CourseSummary } from '../../types';
import { Icon } from '../../components/icons';

const MyCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesData = await api.getStudentCourses();
                setCourses(coursesData);
            } catch (error) {
                console.error("Failed to fetch student courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div>Loading courses...</div>;

    return (
        <div>
            <PageHeader title="My Courses" subtitle="All your active and completed courses." />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-32 bg-secondary-light flex items-center justify-center">
                            <Icon name="BookOpen" className="h-16 w-16 text-secondary" />
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-gray-800 truncate">{course.title}</h4>
                            <div className="mt-3">
                                 <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-500 text-right mt-1">{course.progress}% complete</p>
                            </div>
                            <Link to={`/courses/${course.id}`} className="mt-4 block w-full text-center bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300">
                                Go to Course
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCoursesPage;