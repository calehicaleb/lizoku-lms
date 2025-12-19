
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Program, User, RegionalStat } from '../../types';
import { Icon } from '../../components/icons';
import { GroupedBarChart } from '../../components/common/Charts';

// Define types for report data
interface EnrollmentRecord {
    studentName: string;
    courseTitle: string;
    programName: string;
    programId: string;
    enrollmentDate: string;
}
interface CompletionRecord {
    courseTitle: string;
    completionRate: number;
}
interface ActivityRecord {
    instructorId: string;
    instructorName: string;
    coursesTaught: number;
    totalStudents: number;
}
interface GradeRecord {
    range: string;
    count: number;
}

const ReportingPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    // Data states
    const [enrollmentData, setEnrollmentData] = useState<EnrollmentRecord[]>([]);
    const [completionData, setCompletionData] = useState<CompletionRecord[]>([]);
    const [activityData, setActivityData] = useState<ActivityRecord[]>([]);
    const [gradeData, setGradeData] = useState<GradeRecord[]>([]);
    const [regionalStats, setRegionalStats] = useState<RegionalStat[]>([]);
    // Filter master data
    const [programs, setPrograms] = useState<Program[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);
    // Filter states
    const [programFilter, setProgramFilter] = useState('all');
    const [instructorFilter, setInstructorFilter] = useState('all');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [
                    enrollments,
                    completions,
                    activities,
                    grades,
                    programsData,
                    instructorsData,
                    regions
                ] = await Promise.all([
                    api.getEnrollmentReport(),
                    api.getCourseCompletionReport(),
                    api.getInstructorActivityReport(),
                    api.getGradeDistributionReport(),
                    api.getPrograms(),
                    api.getAllInstructors(),
                    api.getRegionalStats()
                ]);
                setEnrollmentData(enrollments);
                setCompletionData(completions);
                setActivityData(activities);
                setGradeData(grades);
                setPrograms(programsData);
                setInstructors(instructorsData);
                setRegionalStats(regions);
            } catch (error) {
                console.error("Failed to fetch reporting data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const filteredEnrollments = useMemo(() => {
        return enrollmentData.filter(e => programFilter === 'all' || e.programId === programFilter);
    }, [enrollmentData, programFilter]);

    const filteredActivities = useMemo(() => {
        return activityData.filter(a => instructorFilter === 'all' || a.instructorId === instructorFilter);
    }, [activityData, instructorFilter]);

    const handleExport = (reportName: string) => {
        alert(`Exporting ${reportName} data to CSV...`);
    };

    if (loading) return <div>Loading reports...</div>;

    const maxGradeCount = Math.max(...gradeData.map(g => g.count), 0);

    const hybridEngagementData = regionalStats.slice(0, 6).map(r => ({
        label: r.county,
        value1: r.completionRate, // Online completion
        value2: r.attendanceRate || 0, // Physical attendance
    }));

    return (
        <div>
            <PageHeader title="Reporting Dashboard" subtitle="Analyze platform-wide data and hybrid learning trends." />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hybrid Attendance vs Completion */}
                <div className="bg-white p-6 rounded-lg shadow-sm border dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hybrid Engagement by Region</h3>
                            <p className="text-sm text-gray-500">Comparison of Online Completion % vs On-site Attendance %</p>
                        </div>
                        <button onClick={() => handleExport('Hybrid Engagement')} className="text-sm text-secondary hover:underline flex items-center gap-1">
                            <Icon name="BarChart2" className="h-4 w-4" /> Export
                        </button>
                    </div>
                    <div className="h-64">
                        <GroupedBarChart 
                            data={hybridEngagementData} 
                            label1="Online Completion" 
                            label2="Physical Attendance" 
                            height={250} 
                        />
                    </div>
                </div>

                {/* Grade Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 border dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Grade Distribution</h3>
                        <button onClick={() => handleExport('Grade Distribution')} className="text-sm text-secondary hover:underline flex items-center gap-1">
                            <Icon name="FilePieChart" className="h-4 w-4" /> Export
                        </button>
                    </div>
                    <div className="space-y-3">
                        {gradeData.map(({ range, count }) => (
                            <div key={range} className="flex items-center">
                                <span className="w-16 text-sm text-gray-600 dark:text-gray-400">{range}</span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                                    <div 
                                        className="bg-primary h-6 rounded-full flex items-center justify-end px-2 text-sm font-bold text-primary-dark"
                                        style={{ width: maxGradeCount > 0 ? `${(count / maxGradeCount) * 100}%` : '0%' }}
                                    >
                                        {count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Completion */}
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 border dark:border-gray-700">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Course Completion Rates</h3>
                        <button onClick={() => handleExport('Course Completion')} className="text-sm text-secondary hover:underline flex items-center gap-1">
                            <Icon name="FilePieChart" className="h-4 w-4" /> Export
                        </button>
                    </div>
                     <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {completionData.map(({ courseTitle, completionRate }) => (
                            <div key={courseTitle}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{courseTitle}</span>
                                    <span className="text-sm font-medium text-secondary dark:text-blue-400">{completionRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Instructor Activity */}
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 border dark:border-gray-700">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Instructor Activity</h3>
                        <div className="flex items-center gap-2">
                            <select value={instructorFilter} onChange={e => setInstructorFilter(e.target.value)} className="text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                                <option value="all">All Instructors</option>
                                {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            <button onClick={() => handleExport('Instructor Activity')} className="text-sm text-secondary hover:underline flex items-center gap-1">
                                <Icon name="FilePieChart" className="h-4 w-4" /> Export
                            </button>
                        </div>
                    </div>
                     <div className="overflow-x-auto max-h-72">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Instructor</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Courses</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Students</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredActivities.map(act => (
                                    <tr key={act.instructorId}>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{act.instructorName}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{act.coursesTaught}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{act.totalStudents}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* User Enrollment Report */}
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 border dark:border-gray-700">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">User Enrollment Report</h3>
                        <div className="flex items-center gap-2">
                             <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                                <option value="all">All Programs</option>
                                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button onClick={() => handleExport('Enrollment')} className="text-sm text-secondary hover:underline flex items-center gap-1">
                                <Icon name="FilePieChart" className="h-4 w-4" /> Export
                            </button>
                        </div>
                    </div>
                     <div className="overflow-x-auto max-h-72">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Student</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Course</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Program</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredEnrollments.map((en, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{en.studentName}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{en.courseTitle}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{en.programName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportingPage;
