import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Program, User } from '../../types';
import { Icon } from '../../components/icons';

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
                    instructorsData
                ] = await Promise.all([
                    api.getEnrollmentReport(),
                    api.getCourseCompletionReport(),
                    api.getInstructorActivityReport(),
                    api.getGradeDistributionReport(),
                    api.getPrograms(),
                    api.getAllInstructors(),
                ]);
                setEnrollmentData(enrollments);
                setCompletionData(completions);
                setActivityData(activities);
                setGradeData(grades);
                setPrograms(programsData);
                setInstructors(instructorsData);
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
        // In a real app, you would generate and download a CSV file here.
    };

    if (loading) return <div>Loading reports...</div>;

    const maxGradeCount = Math.max(...gradeData.map(g => g.count), 0);

    return (
        <div>
            <PageHeader title="Reporting Dashboard" subtitle="Analyze platform-wide data and trends." />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Grade Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Grade Distribution</h3>
                        <button onClick={() => handleExport('Grade Distribution')} className="text-sm text-secondary hover:underline flex items-center gap-1">
                            <Icon name="FilePieChart" className="h-4 w-4" /> Export
                        </button>
                    </div>
                    <div className="space-y-3">
                        {gradeData.map(({ range, count }) => (
                            <div key={range} className="flex items-center">
                                <span className="w-16 text-sm text-gray-600">{range}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-6">
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
                <div className="bg-white p-6 rounded-lg shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Course Completion Rates</h3>
                        <button onClick={() => handleExport('Course Completion')} className="text-sm text-secondary hover:underline flex items-center gap-1">
                            <Icon name="FilePieChart" className="h-4 w-4" /> Export
                        </button>
                    </div>
                     <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {completionData.map(({ courseTitle, completionRate }) => (
                            <div key={courseTitle}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">{courseTitle}</span>
                                    <span className="text-sm font-medium text-secondary">{completionRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Instructor Activity */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Instructor Activity</h3>
                        <div className="flex items-center gap-2">
                            <select value={instructorFilter} onChange={e => setInstructorFilter(e.target.value)} className="text-sm bg-white border-gray-300 rounded-md shadow-sm">
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
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Instructor</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Courses</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Students</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredActivities.map(act => (
                                    <tr key={act.instructorId}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{act.instructorName}</td>
                                        <td className="px-4 py-3 text-gray-500">{act.coursesTaught}</td>
                                        <td className="px-4 py-3 text-gray-500">{act.totalStudents}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* User Enrollment Report */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">User Enrollment Report</h3>
                        <div className="flex items-center gap-2">
                             <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="text-sm bg-white border-gray-300 rounded-md shadow-sm">
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
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Student</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Course</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Program</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEnrollments.map((en, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{en.studentName}</td>
                                        <td className="px-4 py-3 text-gray-500">{en.courseTitle}</td>
                                        <td className="px-4 py-3 text-gray-500">{en.programName}</td>
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