
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { CourseSummary, ContentType, Submission, Question } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/icons';
import { QuizReview } from '../../components/common/QuizReview';

interface GradeInfo {
    id: string;
    contentItemTitle: string;
    score: number | null;
    type: ContentType;
    submissionId?: string;
    isDisputed?: boolean;
}

const MyGradesPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [grades, setGrades] = useState<GradeInfo[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(false);

    // Regrade Modal State
    const [isDisputeOpen, setIsDisputeOpen] = useState(false);
    const [disputeGradeId, setDisputeGradeId] = useState<string | null>(null);
    const [disputeReason, setDisputeReason] = useState('');
    const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

    // Review Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewData, setReviewData] = useState<{ submission: Submission, questions: Question[] | null } | null>(null);

    useEffect(() => {
        if (!user) return;
        const fetchCourses = async () => {
            try {
                const data = await api.getStudentCourses(user.id);
                setCourses(data);
                if (data.length > 0) setSelectedCourseId(data[0].id);
            } catch (err) { console.error(err); } finally { setLoadingCourses(false); }
        };
        fetchCourses();
    }, [user]);

    const fetchGrades = async () => {
        if (!selectedCourseId || !user) return;
        setLoadingGrades(true);
        try {
            const data = await api.getStudentGradesForCourse(user.id, selectedCourseId);
            setGrades(data);
        } catch (err) { console.error(err); } finally { setLoadingGrades(false); }
    };

    useEffect(() => {
        fetchGrades();
    }, [selectedCourseId, user]);
    
    const handleRequestRegrade = (gradeId: string) => {
        setDisputeGradeId(gradeId);
        setDisputeReason('');
        setIsDisputeOpen(true);
    };

    const submitDispute = async () => {
        if (!user || !disputeGradeId || !disputeReason.trim()) return;
        setIsSubmittingDispute(true);
        try {
            await api.requestRegrade(disputeGradeId, user.id, disputeReason);
            alert("Dispute submitted. Your instructor has been notified.");
            setIsDisputeOpen(false);
            fetchGrades();
        } catch (err) {
            alert("Failed to submit request.");
        } finally {
            setIsSubmittingDispute(false);
        }
    };

    return (
        <div>
            <PageHeader title="Academic Performance" subtitle="Official grades and feedback for your course sessions." />
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                    <label className="font-medium">Select Session:</label>
                    <select
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className="max-w-sm px-3 py-2 border rounded-md dark:bg-gray-700"
                    >
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.semesterName})</option>)}
                    </select>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left">Assignment / Exam</th>
                                <th className="px-4 py-3 text-right">Score</th>
                                <th className="px-4 py-3 text-center">Status / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {grades.map((grade) => (
                                <tr key={grade.id}>
                                    <td className="px-4 py-4 font-medium">{grade.contentItemTitle}</td>
                                    <td className="px-4 py-4 text-right font-bold text-lg">{grade.score !== null ? `${grade.score}%` : '—'}</td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center gap-4">
                                            {grade.score !== null && !grade.isDisputed && (
                                                <button onClick={() => handleRequestRegrade(grade.id)} className="text-xs text-orange-600 hover:underline flex items-center gap-1">
                                                    <Icon name="AlertTriangle" className="h-3 w-3" /> Regrade Request
                                                </button>
                                            )}
                                            {grade.isDisputed && (
                                                <span className="text-xs font-bold text-orange-500 uppercase tracking-widest px-2 py-1 bg-orange-50 rounded">Dispute Pending</span>
                                            )}
                                            {grade.submissionId && grade.type === ContentType.Quiz && (
                                                <button className="text-secondary text-xs hover:underline">Review Attempt</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isDisputeOpen} onClose={() => setIsDisputeOpen(false)} title="Formal Regrade Request">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Please provide a valid pedagogical reason for requesting a regrade. This will be sent directly to your instructor for review.</p>
                    <textarea 
                        value={disputeReason}
                        onChange={e => setDisputeReason(e.target.value)}
                        placeholder="Enter your justification..."
                        className="w-full p-3 border rounded-md dark:bg-gray-700 h-32"
                    />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsDisputeOpen(false)} className="px-4 py-2 text-sm">Cancel</button>
                        <button onClick={submitDispute} disabled={isSubmittingDispute} className="px-4 py-2 bg-primary text-gray-900 font-bold rounded-md disabled:opacity-50">Submit Request</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MyGradesPage;
