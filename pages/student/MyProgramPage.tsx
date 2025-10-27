import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { StudentProgramDetails, CourseEnrollmentStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/icons';

const MyProgramPage: React.FC = () => {
    const { user } = useAuth();
    const [programDetails, setProgramDetails] = useState<StudentProgramDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        const fetchProgramDetails = async () => {
            try {
                const data = await api.getStudentProgramDetails(user.id);
                setProgramDetails(data);
            } catch (error) {
                console.error("Failed to fetch program details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgramDetails();
    }, [user]);

    const getStatusStyles = (status: CourseEnrollmentStatus) => {
        switch (status) {
            case 'completed':
                return {
                    icon: <Icon name="CheckCircle" className="h-5 w-5 text-green-500" />,
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-700 font-bold',
                };
            case 'in_progress':
                return {
                    icon: <Icon name="Clock" className="h-5 w-5 text-blue-500" />,
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-700',
                };
            case 'not_started':
            default:
                return {
                    icon: <Icon name="Book" className="h-5 w-5 text-gray-400" />,
                    bgColor: 'bg-gray-50',
                    textColor: 'text-gray-500',
                };
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading your program details...</div>;
    }

    if (!programDetails) {
        return (
            <div>
                <PageHeader title="My Program" subtitle="Your academic roadmap." />
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
                    <Icon name="GraduationCap" className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Program Assigned</h3>
                    <p className="mt-1 text-sm text-gray-500">You are not currently assigned to an academic program. Please contact an administrator.</p>
                </div>
            </div>
        );
    }
    
    const { program, progress, courses } = programDetails;

    return (
        <div>
            <PageHeader title={program.name} subtitle={program.departmentName} />

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Program Progress</h2>
                <div className="flex items-center gap-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                            className="bg-primary h-4 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="font-bold text-lg text-primary-dark">{progress}%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">You have completed {courses.filter(c => c.enrollmentStatus === 'completed').length} of {courses.length} required courses.</p>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Required Courses</h2>
                <div className="space-y-3">
                    {courses.map(course => {
                        const styles = getStatusStyles(course.enrollmentStatus);
                        return (
                            <div key={course.id} className={`p-4 rounded-lg flex items-center justify-between ${styles.bgColor}`}>
                                <div className="flex items-center">
                                    <div className="mr-4">
                                        {styles.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{course.title}</h3>
                                        <p className="text-sm text-gray-600">{course.instructorName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg ${styles.textColor}`}>
                                        {course.enrollmentStatus === 'completed' ? `${course.finalGrade}%` : course.enrollmentStatus.replace('_', ' ')}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">Status</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyProgramPage;