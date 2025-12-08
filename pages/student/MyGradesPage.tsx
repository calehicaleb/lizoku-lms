
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { CourseSummary, ContentType, Submission, Question, Rubric } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/icons';
import { QuizReview } from '../../components/common/QuizReview';

interface GradeInfo {
    id: string;
    contentItemTitle: string;
    score: number | null;
    type: ContentType;
    submissionId?: string;
}

const MyGradesPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [grades, setGrades] = useState<GradeInfo[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(false);

    // Review Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewData, setReviewData] = useState<{ submission: Submission, questions: Question[] | null } | null>(null);
    const [loadingReview, setLoadingReview] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchCourses = async () => {
            try {
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
    
    const handleReviewClick = async (grade: GradeInfo) => {
        if (!grade.submissionId) return;
        if (grade.type !== ContentType.Quiz) {
            alert("Detailed review is currently only available for Quizzes.");
            return;
        }

        setLoadingReview(true);
        setIsReviewOpen(true);
        setReviewData(null);

        try {
            const data = await api.getSubmissionDetails(grade.submissionId);
            setReviewData(data);
        } catch (error) {
            console.error("Failed to load review", error);
            setIsReviewOpen(false);
            alert("Could not load submission details.");
        } finally {
            setLoadingReview(false);
        }
    };

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
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Score</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {grades.map((grade) => (
                                    <tr key={grade.id}>
                                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">{grade.contentItemTitle}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 capitalize">{grade.type}</td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-right font-bold ${getGradeColor(grade.score)}`}>
                                            {grade.score !== null ? `${grade.score}%` : 'Not Graded'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            {grade.submissionId && grade.type === ContentType.Quiz ? (
                                                <button 
                                                    onClick={() => handleReviewClick(grade)}
                                                    className="text-secondary dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    Review Attempt
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-600">-</span>
                                            )}
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

            <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Submission Review" size="4xl">
                {loadingReview ? (
                    <div className="p-8 text-center">Loading review...</div>
                ) : reviewData && reviewData.submission.type === 'quiz' && reviewData.questions ? (
                    <QuizReview 
                        submission={reviewData.submission as any} 
                        questions={reviewData.questions} 
                    />
                ) : (
                    <div className="p-8 text-center text-red-500">Failed to load review data.</div>
                )}
                <div className="mt-6 flex justify-end">
                    <button onClick={() => setIsReviewOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-medium">Close</button>
                </div>
            </Modal>
        </div>
    );
};

export default MyGradesPage;
