import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Course, ContentItem, Grade } from '../../types';
import { Icon } from '../../components/icons';
import { ManualGrader } from '../../components/common/ManualGrader';

interface StudentGradeData {
    studentId: string;
    studentName: string;
    grades: Record<string, Grade | null>;
}

interface GradebookData {
    gradableItems: ContentItem[];
    studentGrades: StudentGradeData[];
}

const GradebookPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [gradebookData, setGradebookData] = useState<GradebookData | null>(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(false);

    // Manual Grader Modal State
    const [isGraderOpen, setIsGraderOpen] = useState(false);
    const [gradingInfo, setGradingInfo] = useState<{ submissionId: string, studentName: string } | null>(null);

    const fetchGrades = async (courseId: string) => {
        if (!courseId) return;
        setLoadingGrades(true);
        setGradebookData(null);
        try {
            const data = await api.getCourseGrades(courseId);
            setGradebookData(data);
        } catch (error) {
            console.error("Failed to fetch gradebook data", error);
        } finally {
            setLoadingGrades(false);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await api.getInstructorCourses();
                setCourses(data);
                if (data.length > 0) {
                    setSelectedCourseId(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchGrades(selectedCourseId);
    }, [selectedCourseId]);
    
    const handleOpenGrader = (submissionId: string, studentName: string) => {
        setGradingInfo({ submissionId, studentName });
        setIsGraderOpen(true);
    };

    const handleGraderClose = (wasUpdated: boolean) => {
        setIsGraderOpen(false);
        setGradingInfo(null);
        if (wasUpdated) {
            // Refresh the gradebook data to show the new grade
            fetchGrades(selectedCourseId);
        }
    };

    const handleGradeSave = async (studentId: string, contentItemId: string, scoreStr: string) => {
        const score = scoreStr === '' ? null : parseInt(scoreStr, 10);
        if (isNaN(score as any) && score !== null) return;
        
        try {
            await api.updateGrade(studentId, selectedCourseId, contentItemId, score);
        } catch (error) {
            console.error("Failed to save grade", error);
            alert("Failed to save grade. Please refresh and try again.");
            fetchGrades(selectedCourseId); // Re-fetch to revert optimistic update on failure
        }
    };
    
    return (
        <div>
            <PageHeader title="Gradebook" subtitle="View and manage grades for your courses." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="mb-4 flex items-center gap-4">
                    <label htmlFor="course-select" className="font-medium text-gray-700">Select Course:</label>
                    <select
                        id="course-select"
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loadingCourses}
                    >
                        {loadingCourses ? <option>Loading...</option> : courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>

                {loadingGrades && <div className="text-center py-8">Loading gradebook...</div>}

                {!loadingGrades && gradebookData && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 border">Student Name</th>
                                    {gradebookData.gradableItems.map(item => (
                                        <th key={item.id} className="px-4 py-3 text-center font-medium text-gray-500 border w-40">
                                            {item.title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {gradebookData.studentGrades.map(sg => (
                                    <tr key={sg.studentId} className="border-t">
                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 border">{sg.studentName}</td>
                                        {gradebookData.gradableItems.map(item => {
                                            const grade = sg.grades[item.id];
                                            return (
                                                <td key={item.id} className="border p-0 text-center">
                                                    {grade?.status === 'pending review' && grade.submissionId ? (
                                                        <button 
                                                            onClick={() => handleOpenGrader(grade.submissionId!, sg.studentName)}
                                                            className="w-full h-full p-3 bg-yellow-100 text-yellow-800 font-bold hover:bg-yellow-200 transition-colors">
                                                            Review
                                                        </button>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            defaultValue={grade?.score ?? ''}
                                                            onBlur={e => handleGradeSave(sg.studentId, item.id, e.target.value)}
                                                            className="w-full h-full text-center p-3 bg-transparent focus:bg-yellow-100 focus:outline-none"
                                                            placeholder="-"
                                                            min="0"
                                                            max="100"
                                                        />
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {!loadingGrades && (!gradebookData || gradebookData.studentGrades.length === 0) && (
                     <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
                        <Icon name="Users" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No Students or Gradable Items</h3>
                        <p className="mt-1 text-sm text-gray-500">This course may have no students enrolled or no gradable items (quizzes, assignments) yet.</p>
                    </div>
                )}
            </div>

            {isGraderOpen && gradingInfo && (
                <ManualGrader 
                    isOpen={isGraderOpen} 
                    onClose={handleGraderClose} 
                    submissionId={gradingInfo.submissionId} 
                    studentName={gradingInfo.studentName} 
                />
            )}
        </div>
    );
};

export default GradebookPage;