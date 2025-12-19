
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Course, CourseStatus, Department, DeliveryMode } from '../../types';
import { Icon } from '../../components/icons';

const ExploreCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [deliveryFilter, setDeliveryFilter] = useState<DeliveryMode | 'all'>('all');
    const [enrollmentMessage, setEnrollmentMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesData, departmentsData] = await Promise.all([
                    api.getAllCourses(),
                    api.getDepartments(),
                ]);
                setCourses(coursesData.filter(c => c.status === CourseStatus.Published));
                setDepartments(departmentsData);
            } catch (error) {
                console.error("Failed to fetch course data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  course.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = departmentFilter === 'all' || course.departmentId === departmentFilter;
            const matchesDelivery = deliveryFilter === 'all' || course.deliveryMode === deliveryFilter;
            return matchesSearch && matchesDept && matchesDelivery;
        });
    }, [courses, searchTerm, departmentFilter, deliveryFilter]);
    
    const handleEnroll = (courseTitle: string) => {
        setEnrollmentMessage(`Successfully enrolled in "${courseTitle}"!`);
        setTimeout(() => setEnrollmentMessage(''), 4000);
    };

    const getDeliveryBadge = (mode: DeliveryMode) => {
        switch (mode) {
            case DeliveryMode.Hybrid:
                return 'bg-secondary text-white';
            case DeliveryMode.OnSite:
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case DeliveryMode.Online:
            default:
                return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    if (loading) return <div>Loading course catalog...</div>;

    return (
        <div>
            <PageHeader title="Explore Courses" subtitle="Discover new learning opportunities in our catalog." />

            {enrollmentMessage && (
                <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 mb-6 rounded-md shadow-sm" role="alert">
                    <p className="font-bold">Success</p>
                    <p>{enrollmentMessage}</p>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 relative">
                        <input
                            type="text"
                            placeholder="Search for courses..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                        />
                        <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="md:col-span-3">
                         <select
                            value={departmentFilter}
                            onChange={e => setDepartmentFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                         <select
                            value={deliveryFilter}
                            onChange={e => setDeliveryFilter(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Any Delivery Mode</option>
                            {Object.values(DeliveryMode).map(mode => (
                                <option key={mode} value={mode} className="capitalize">{mode}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                        <div key={course.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                             <div className="h-40 bg-secondary-light dark:bg-secondary/20 flex items-center justify-center relative">
                                <Icon name="BookOpen" className="h-20 w-20 text-secondary dark:text-blue-400" />
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getDeliveryBadge(course.deliveryMode)}`}>
                                    {course.deliveryMode}
                                </div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{course.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    by {course.instructorName} in <span className="font-medium">{course.departmentName}</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex-grow line-clamp-3">{course.description}</p>
                                <button onClick={() => handleEnroll(course.title)} className="mt-4 block w-full text-center bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                     <div className="md:col-span-2 lg:col-span-3 text-center py-16 px-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Icon name="Search" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No Courses Found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExploreCoursesPage;
