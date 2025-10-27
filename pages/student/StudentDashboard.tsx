
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { CourseSummary } from '../../types';
import { Icon } from '../../components/icons';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
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
    
    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <PageHeader title={`Welcome, ${user?.name.split(' ')[0]}!`} subtitle="Here's a summary of your learning journey." />
            
            <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Continue Learning</h3>
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Deadlines</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium text-gray-800">Assignment 3</p>
                                <p className="text-sm text-gray-500">Intro to Computer Science</p>
                            </div>
                            <p className="text-sm font-bold text-red-600">Aug 5, 2024</p>
                        </li>
                        <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium text-gray-800">Quiz 2</p>
                                <p className="text-sm text-gray-500">Data Structures</p>
                            </div>
                            <p className="text-sm font-bold text-red-600">Aug 7, 2024</p>
                        </li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Grades</h3>
                     <ul className="space-y-3">
                        <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium text-gray-800">Assignment 2</p>
                                <p className="text-sm text-gray-500">Intro to Computer Science</p>
                            </div>
                            <p className="text-sm font-bold text-green-600">A- (92%)</p>
                        </li>
                        <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium text-gray-800">Project 1</p>
                                <p className="text-sm text-gray-500">Web Development</p>
                            </div>
                            <p className="text-sm font-bold text-green-600">A (96%)</p>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    );
};

export default StudentDashboard;
