import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { CourseSummary, OverdueItem, UpcomingDeadline, RecentActivity } from '../../types';
import { Icon, IconName } from '../../components/icons';
import { Link } from 'react-router-dom';


const UrgentItems: React.FC<{ items: OverdueItem[] }> = ({ items }) => (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-lg shadow-sm">
        <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-3 flex items-center">
            <Icon name="AlertTriangle" className="h-6 w-6 mr-2" /> Urgent & Overdue
        </h3>
        {items.length > 0 ? (
            <ul className="space-y-3">
                {items.map(item => (
                    <li key={item.id} className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
                        <div>
                            <p className="font-bold text-red-900 dark:text-red-200">{item.title}</p>
                            <p className="text-sm text-red-700 dark:text-red-300">{item.courseName}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm font-bold text-red-900 dark:text-red-200">Due {new Date(item.dueDate).toLocaleDateString()}</p>
                             <Link to={item.link} className="text-xs font-medium text-red-700 dark:text-red-300 hover:underline">View Item &rarr;</Link>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-red-700 dark:text-red-300">Nothing is overdue. Great job!</p>
        )}
    </div>
);

const LiveToday: React.FC<{ deadlines: UpcomingDeadline[] }> = ({ deadlines }) => {
    const liveSessions = deadlines.filter(d => d.type === 'live');
    if (liveSessions.length === 0) return null;

    return (
        <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-500 p-6 rounded-r-lg shadow-sm mb-8 animate-pulse-subtle">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-300 flex items-center">
                    <Icon name="Video" className="h-6 w-6 mr-2" /> Live Virtual Sessions
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveSessions.map(session => (
                    <div key={session.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between border dark:border-gray-700">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{session.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{session.courseName} &bull; Starting at {new Date(session.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <Link to={`/courses/${session.id.split('-')[0]}`} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-700 transition-colors text-sm">
                            Join Now
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OnSiteSchedule: React.FC<{ deadlines: UpcomingDeadline[] }> = ({ deadlines }) => {
    const physicalSessions = deadlines.filter(d => d.type === 'on-site');
    if (physicalSessions.length === 0) return null;

    return (
        <div className="bg-secondary-light/30 dark:bg-secondary/10 border border-secondary/20 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary dark:text-blue-300 flex items-center">
                    <Icon name="MapPin" className="h-6 w-6 mr-2" /> On-site Schedule (Hybrid)
                </h3>
                <span className="text-xs font-bold bg-secondary text-white px-2 py-1 rounded-full uppercase">Action Required</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {physicalSessions.map(session => (
                    <div key={session.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-start gap-4 border dark:border-gray-700">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase">{new Date(session.dueDate).toLocaleString('default', { month: 'short' })}</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{new Date(session.dueDate).getDate()}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{session.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{session.courseName}</p>
                            <p className="text-xs font-medium text-secondary dark:text-blue-400 mt-2 flex items-center">
                                <Icon name="Clock" className="h-3 w-3 mr-1" /> 
                                {new Date(session.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UpcomingDeadlines: React.FC<{ deadlines: UpcomingDeadline[] }> = ({ deadlines }) => {
    const deadlineIcons: Record<UpcomingDeadline['type'], IconName> = {
        quiz: 'ClipboardCheck',
        assignment: 'PenSquare',
        exam: 'ListChecks',
        'on-site': 'MapPin',
        'live': 'Video'
    };
    // Filter out on-site and live for this specific list as they have their own widgets
    const virtualDeadlines = deadlines.filter(d => d.type !== 'on-site' && d.type !== 'live');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Upcoming Deadlines</h3>
             {virtualDeadlines.length > 0 ? (
                <ul className="space-y-3">
                    {virtualDeadlines.map(item => (
                        <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex items-center">
                                <Icon name={deadlineIcons[item.type] || 'Clock'} className="h-5 w-5 text-secondary dark:text-blue-400 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{item.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.courseName}</p>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-secondary dark:text-blue-400">{new Date(item.dueDate).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming deadlines in the next 7 days.</p>
            )}
        </div>
    );
};

const RecentActivityFeed: React.FC<{ activities: RecentActivity[] }> = ({ activities }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h3>
         {activities.length > 0 ? (
            <ul className="space-y-4">
                {activities.map(act => (
                    <li key={act.id} className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-secondary-light dark:bg-secondary/20 flex items-center justify-center mr-4 mt-1">
                             <Icon name={act.icon} className="h-5 w-5 text-secondary dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{act.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{act.summary}</p>
                             <Link to={act.link} className="text-xs text-secondary dark:text-blue-400 hover:underline">{new Date(act.timestamp).toLocaleString()}</Link>
                        </div>
                    </li>
                ))}
            </ul>
         ) : (
             <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity to show.</p>
         )}
    </div>
);


const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [overdue, setOverdue] = useState<OverdueItem[]>([]);
    const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([]);
    const [activity, setActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [coursesData, overdueData, deadlinesData, activityData] = await Promise.all([
                    api.getStudentCourses(user.id),
                    api.getOverdueItems(user.id),
                    api.getUpcomingDeadlines(user.id),
                    api.getRecentActivity(user.id),
                ]);
                setCourses(coursesData);
                setOverdue(overdueData);
                setDeadlines(deadlinesData);
                setActivity(activityData);
            } catch (error) {
                console.error("Failed to fetch student dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);
    
    if (loading) return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <PageHeader title={`Welcome, ${user?.name.split(' ')[0]}!`} subtitle="Today is Friday, Dec 19, 2025" />
                <div className="mb-6 flex gap-2">
                    <span className="bg-primary text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Active Semester: Fall 2025</span>
                </div>
            </div>
            
            <LiveToday deadlines={deadlines} />

            {overdue.length > 0 && <UrgentItems items={overdue} />}

            <OnSiteSchedule deadlines={deadlines} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UpcomingDeadlines deadlines={deadlines} />
                <RecentActivityFeed activities={activity} />
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Continue Learning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                         <div key={course.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-32 bg-secondary-light dark:bg-secondary/20 flex items-center justify-center">
                                <Icon name="BookOpen" className="h-16 w-16 text-secondary dark:text-blue-400" />
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate">{course.title}</h4>
                                <div className="mt-3">
                                     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">{course.progress}% complete</p>
                                </div>
                                <Link to={`/courses/${course.id}`} className="mt-4 block w-full text-center bg-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-secondary-dark transition duration-300">
                                    Go to Course
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;