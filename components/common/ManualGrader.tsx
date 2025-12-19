import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import * as api from '../../services/api';
// Fix: Added RubricCriterion to imports to resolve type issues in reduce functions
import { Question, Submission, QuestionType, Rubric, Grade, ContentItem, AssignmentSubmission, CourseStatus, RubricCriterion } from '../../types';
import { Icon } from '../icons';
import { suggestGradingFeedback } from '../../services/geminiService';

interface ManualGraderProps {
    isOpen: boolean;
    onClose: (wasUpdated: boolean) => void;
    submissionId: string;
    studentName: string;
}

interface GraderData {
    submission: Submission;
    grade: Grade;
    rubric: Rubric | null;
    item: ContentItem;
    courseStatus?: CourseStatus; // Added to handle locking
}

export const ManualGrader: React.FC<ManualGraderProps> = ({ isOpen, onClose, submissionId, studentName }) => {
    const [data, setData] = useState<GraderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [manualScores, setManualScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isMaximized, setIsMaximized] = useState(true);
    const [activeTab, setActiveTab] = useState<'rubric' | 'feedback' | 'ai'>('rubric');

    const isLocked = data?.courseStatus === CourseStatus.Finalized || data?.courseStatus === CourseStatus.Archived;

    useEffect(() => {
        if (!isOpen) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await api.getSubmissionDetails(submissionId);
                // Also fetch course to check lock status
                const course = await api.getCourseDetails(result.submission.courseId);
                setData({ ...result, courseStatus: course?.status });
                setFeedback(result.grade?.feedback || '');
                
                const initialScores: Record<string, number> = {};
                if (result?.rubric) {
                    result.rubric.criteria.forEach((c: any) => {
                        const existing = result.grade?.rubricFeedback?.[c.id]?.points;
                        initialScores[c.id] = existing !== undefined ? existing : 0;
                    });
                }
                setManualScores(initialScores);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchData();
    }, [submissionId, isOpen]);

    const handleSave = async () => {
        if (!data || isLocked) return;
        // Fix: Explicitly cast manualScores values to number array and simplified reduce to avoid left-hand side arithmetic type errors.
        const total = (Object.values(manualScores) as number[]).reduce((acc, curr) => acc + curr, 0);
        // Fix: Resolved arithmetic operation type error on line 66 by explicitly narrowing criteria to an array and using typed accumulator.
        const criteriaList: RubricCriterion[] = data.rubric?.criteria || [];
        const max = criteriaList.reduce((acc: number, curr: RubricCriterion) => acc + (curr.points || 0), 0) || 100;
        const percentage = Math.round((total / max) * 100);

        try {
            await api.gradeManualSubmission(submissionId, { score: percentage, feedback });
            onClose(true);
        } catch (err) { alert("Save failed"); }
    };

    if (!isOpen) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => onClose(false)} 
            title={`Marking Workspace: ${studentName}`} 
            size="5xl"
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
        >
            {loading ? (
                <div className="flex h-64 items-center justify-center animate-pulse text-gray-400">Loading submission environment...</div>
            ) : data && (
                <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 -m-6">
                    {isLocked && (
                        <div className="bg-blue-600 text-white text-center py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <Icon name="Lock" className="h-3 w-3" /> Historical Record: Read Only Mode
                        </div>
                    )}
                    
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-inner border dark:border-gray-700 overflow-y-auto p-12">
                                <div className="max-w-3xl mx-auto prose dark:prose-invert">
                                    {(data.submission as AssignmentSubmission).textContent ? (
                                        <div className="whitespace-pre-wrap leading-relaxed text-lg">
                                            {(data.submission as AssignmentSubmission).textContent}
                                        </div>
                                    ) : <p className="text-center text-gray-500">No text content available.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="w-96 bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col">
                            <div className="flex border-b dark:border-gray-700">
                                <button onClick={() => setActiveTab('rubric')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'rubric' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Rubric</button>
                                <button onClick={() => setActiveTab('feedback')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'feedback' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Feedback</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {activeTab === 'rubric' && data.rubric && (
                                    <div className="space-y-6">
                                        {data.rubric.criteria.map(crit => (
                                            <div key={crit.id} className="space-y-2">
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <span>{crit.description}</span>
                                                    <span className="text-primary-dark">{manualScores[crit.id] || 0} / {crit.points}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {data.rubric!.levels.map(lvl => (
                                                        <button 
                                                            disabled={isLocked}
                                                            key={lvl.id}
                                                            onClick={() => setManualScores(prev => ({...prev, [crit.id]: lvl.points}))}
                                                            className={`p-2 text-[10px] rounded border transition-all ${manualScores[crit.id] === lvl.points ? 'bg-primary border-primary text-gray-900 font-bold' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500'}`}
                                                        >
                                                            {lvl.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'feedback' && (
                                    <textarea 
                                        disabled={isLocked}
                                        value={feedback}
                                        onChange={e => setFeedback(e.target.value)}
                                        className="w-full h-64 p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                        placeholder="Enter marking notes..."
                                    />
                                )}
                            </div>

                            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-gray-500">Score</span>
                                    <span className="text-2xl font-black text-primary-dark">
                                        {/* Fix: Explicitly ensure result of reduction is treated as a number for UI display. */}
                                        {(Object.values(manualScores) as number[]).reduce((a: number, b: number) => a + b, 0)} pts
                                    </span>
                                </div>
                                <button 
                                    onClick={handleSave} 
                                    disabled={isLocked}
                                    className="w-full bg-primary text-gray-900 font-bold py-3 rounded-lg hover:bg-primary-dark shadow-md disabled:bg-gray-400"
                                >
                                    {isLocked ? 'Closed' : 'Submit Score'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
