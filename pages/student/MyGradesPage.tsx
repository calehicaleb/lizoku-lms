import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { CourseSummary } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/icons';

interface GradeInfo {
    contentItemTitle: string;
    score: number | null;
}

const MyGradesPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [grades, setGrades] = useState<GradeInfo[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchCourses = async () => {
            try {
                // FIX: Pass the student's ID to the API call.
                const data = await api.getStudentCourses(user.id);
                setCourses(data);
                if (data.length > 0) {
                    setSelectedCourseId(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch student courses", error);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [user]);

    useEffect(() => {
        if (!selectedCourseId || !user) return;
        
        const fetchGrades = async () => {
            setLoadingGrades(true);
            setGrades([]);
            try {
                const data = await api.getStudentGradesForCourse(user.id, selectedCourseId);
                setGrades(data);
            } catch (error) {
                console.error("Failed to fetch grades", error);
            } finally {
                setLoadingGrades(false);
            }
        };
        fetchGrades();
    }, [selectedCourseId, user]);
    
    const getGradeColor = (score: number | null) => {
        if (score === null) return 'text-gray-500 dark:text-gray-400';
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 80) return 'text-blue-600 dark:text-blue-400';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div>
            <PageHeader title="My Grades" subtitle="Check your academic performance for each course." />
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                    <label htmlFor="course-select" className="font-medium text-gray-700 dark:text-gray-300">Select Course:</label>
                    <select
                        id="course-select"
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className="w-full max-w-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loadingCourses}
                    >
                        {loadingCourses ? <option>Loading...</option> : courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                
                {loadingGrades && <div className="text-center py-8">Loading grades...</div>}
                
                {!loadingGrades && grades.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Assignment / Quiz</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {grades.map((grade, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">{grade.contentItemTitle}</td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-right font-bold ${getGradeColor(grade.score)}`}>
                                            {grade.score !== null ? `${grade.score}%` : 'Not Graded'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                 {!loadingGrades && courses.length > 0 && grades.length === 0 && (
                     <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed dark:border-gray-700">
                        <Icon name="PenSquare" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No Grades Yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no graded items for this course, or your submissions haven't been graded yet.</p>
                    </div>
                )}
                 {!loadingCourses && courses.length === 0 && (
                     <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed dark:border-gray-700">
                        <Icon name="BookOpen" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No Courses Found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You are not enrolled in any courses with gradable items.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyGradesPage;