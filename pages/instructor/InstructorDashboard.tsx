
import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
// Fix: Use the richer Course type which now includes summary data.
import { StatCardData, Course } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';

const InstructorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<StatCardData[]>([]);
    // Fix: Changed state to use Course[] as the API now returns a merged object.
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                // FIX: Pass the instructor's ID to the API calls.
                const [statsData, coursesData] = await Promise.all([
                    api.getInstructorStats(user.id),
                    api.getInstructorCourses(user.id)
                ]);
                setStats(statsData);
                setCourses(coursesData);
            } catch (error) {
                console.error("Failed to fetch instructor dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <PageHeader title="Instructor Dashboard" subtitle="Manage your courses and students." />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => <StatCard key={stat.title} data={stat} />)}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">My Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-32 bg-secondary-light flex items-center justify-center">
                                <Icon name="Book" className="h-16 w-16 text-secondary" />
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-800 truncate">{course.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{course.students} Students</p>
                                <div className="mt-3">
                                     <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right mt-1">{course.progress}% progress</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;