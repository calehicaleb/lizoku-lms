import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import * as api from '../../services/api';
import { Question, Submission, QuestionType, Rubric, Grade, QuizSubmission } from '../../types';
import { Icon } from '../icons';

interface ManualGraderProps {
    isOpen: boolean;
    onClose: (wasUpdated: boolean) => void;
    submissionId: string;
    studentName: string;
}

interface GraderData {
    submission: Submission;
    questions: Question[] | null;
    rubric: Rubric | null;
}

export const ManualGrader: React.FC<ManualGraderProps> = ({ isOpen, onClose, submissionId, studentName }) => {
    const [data, setData] = useState<GraderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [manualScores, setManualScores] = useState<Record<string, number>>({});
    const [criterionComments, setCriterionComments] = useState<Record<string, string>>({});
    const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset states when modal is closed
            setIsPreviewExpanded(false);
            setIsMaximized(false);
            return;
        };
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await api.getSubmissionDetails(submissionId);
                setData(result);
                // Initialize scores and comments
                const initialScores: Record<string, number> = {};
                const initialComments: Record<string, string> = {};
                if (result?.rubric) {
                    result.rubric.criteria.forEach(c => {
                        // Default to the best score
                        const highestLevel = result.rubric!.levels.reduce((max, level) => level.points > max.points ? level : max, result.rubric!.levels[0]);
                        initialScores[`criterion-${c.id}`] = highestLevel.points;
                    });
                } else {
                    result?.questions?.forEach(q => {
                        if (q.type === QuestionType.ShortAnswer) {
                            initialScores[q.id] = 1; // Default to full marks
                        }
                    });
                }
                setManualScores(initialScores);
                setCriterionComments(initialComments);
            } catch (error) {
                console.error("Failed to fetch submission details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [submissionId, isOpen]);

    const handleScoreChange = (id: string, score: number) => {
        setManualScores(prev => ({ ...prev, [id]: score }));
    };

    const handleCommentChange = (criterionId: string, comment: string) => {
        setCriterionComments(prev => ({ ...prev, [criterionId]: comment }));
    };

    const handleSaveGrade = async () => {
        if (!data) return;
        
        const { score, maxScore } = calculateRubricScore();
        const finalPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        
        const rubricFeedback: Grade['rubricFeedback'] = {};
        if (data.rubric) {
            data.rubric.criteria.forEach(c => {
                rubricFeedback[c.id] = {
                    points: manualScores[`criterion-${c.id}`] || 0,
                    comment: criterionComments[c.id] || ''
                };
            });
        }

        try {
            await api.gradeManualSubmission(submissionId, {
                score: finalPercentage,
                rubricFeedback: data.rubric ? rubricFeedback : undefined,
            });
            onClose(true); // Signal that an update occurred
        } catch (error) {
            console.error("Failed to save manual grade", error);
            alert("An error occurred while saving the grade.");
        }
    };
    
    const calculateRubricScore = () => {
        if (!data?.rubric) return { score: 0, maxScore: 0 };

        let score = 0;
        let maxScore = 0;
        data.rubric.criteria.forEach(c => {
            score += manualScores[`criterion-${c.id}`] || 0;
            maxScore += c.points;
        });
        return { score, maxScore };
    };

    const renderAnswer = (question: Question, answer: any) => {
        switch (question.type) {
            case QuestionType.MultipleChoice:
                const isCorrect = answer === question.correctAnswerIndex;
                return (
                    <div className={`p-2 rounded ${isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <p className="dark:text-gray-300"><strong>Student's Answer:</strong> {question.options[answer]}</p>
                        <p className="dark:text-gray-300"><strong>Correct Answer:</strong> {question.options[question.correctAnswerIndex]}</p>
                    </div>
                );
            case QuestionType.TrueFalse:
                const isTfCorrect = answer === question.correctAnswer;
                return (
                    <div className={`p-2 rounded ${isTfCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <p className="dark:text-gray-300"><strong>Student's Answer:</strong> {String(answer)}</p>
                        <p className="dark:text-gray-300"><strong>Correct Answer:</strong> {String(question.correctAnswer)}</p>
                    </div>
                );
            case QuestionType.ShortAnswer:
                return (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded">
                        <p className="dark:text-gray-300"><strong>Student's Answer:</strong></p>
                        <p className="italic pl-2 border-l-2 border-yellow-300 dark:border-yellow-600 dark:text-gray-200">"{String(answer)}"</p>
                    </div>
                );
            default: return <p className="p-2 bg-gray-100 dark:bg-gray-700 rounded dark:text-gray-300">This question was auto-graded.</p>;
        }
    };

    const renderRubricGrader = (rubric: Rubric) => {
        const sortedLevels = [...rubric.levels].sort((a,b) => b.points - a.points);
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="p-2 border dark:border-gray-600 font-medium text-left text-gray-700 dark:text-gray-300 w-1/4">Criteria</th>
                            {sortedLevels.map(level => (
                                 <th key={level.id} className="p-2 border dark:border-gray-600 font-medium text-center text-gray-700 dark:text-gray-300">{level.name} ({level.points} pts)</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rubric.criteria.map(criterion => (
                            <tr key={criterion.id} className="border-t dark:border-gray-600">
                                <td className="p-2 border dark:border-gray-600 align-top">
                                    <div className="flex items-start gap-2 font-medium text-gray-800 dark:text-gray-200">
                                        <span>{criterion.description} ({criterion.points} pts)</span>
                                        {criterion.longDescription && (
                                            <span title={criterion.longDescription} className="cursor-help text-gray-400">
                                                <Icon name="Info" className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                    <textarea
                                        value={criterionComments[criterion.id] || ''}
                                        onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                                        placeholder="Add feedback for this criterion..."
                                        rows={2}
                                        className="w-full text-xs mt-2 p-1 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </td>
                                 {sortedLevels.map(level => (
                                    <td key={level.id} className="p-1 border dark:border-gray-600 align-top">
                                        <button 
                                            onClick={() => handleScoreChange(`criterion-${criterion.id}`, level.points)}
                                            className={`w-full h-full p-2 rounded text-left transition-colors ${manualScores[`criterion-${criterion.id}`] === level.points ? 'bg-primary text-gray-800 ring-2 ring-primary-dark' : 'bg-gray-100 dark:bg-gray-700 hover:bg-primary/50 dark:hover:bg-primary/20'}`}
                                        >
                                            <p className="text-xs text-gray-600 dark:text-gray-300">{criterion.levelDescriptions?.[level.id]}</p>
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    
    const { score: rubricScore, maxScore: maxRubricScore } = calculateRubricScore();

    const isOfficeDoc = data?.submission.type === 'assignment' && (
        data.submission.file.name.endsWith('.docx') ||
        data.submission.file.name.endsWith('.doc') ||
        data.submission.file.name.endsWith('.pptx') ||
        data.submission.file.name.endsWith('.xlsx')
    );
    
    const isPdf = data?.submission.type === 'assignment' && data.submission.file.name.endsWith('.pdf');

    const viewerUrl = data?.submission.type === 'assignment'
        ? isOfficeDoc
            ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(data.submission.file.url)}`
            : isPdf
                ? data.submission.file.url
                : ''
        : '';

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onClose(false)}
            title={`Grade Submission for ${studentName}`}
            size="5xl"
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(p => !p)}
        >
            {loading && <p>Loading submission...</p>}
            {!loading && data && (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-hidden">
                        <div className={`h-full grid grid-cols-1 ${isPreviewExpanded ? 'lg:grid-cols-[1fr_min-content]' : 'lg:grid-cols-2'} gap-6`}>
                            {/* Column 1: Submission Preview */}
                            <div className="flex flex-col overflow-hidden">
                                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Submission Preview</h3>
                                    <div className="flex items-center gap-4">
                                        {data.submission.type === 'assignment' && (
                                            <a href={data.submission.file.url} download={data.submission.file.name} className="flex items-center gap-2 text-sm text-secondary dark:text-blue-400 hover:underline">
                                                <Icon name="FileText" className="h-4 w-4" />
                                                <span>Download File</span>
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => setIsPreviewExpanded(prev => !prev)} 
                                            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title={isPreviewExpanded ? "Show Grader" : "Expand Preview"}
                                        >
                                            <Icon name={!isPreviewExpanded ? "PanelRightClose" : "PanelLeftOpen"} className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0">
                                    {data.submission.type === 'assignment' ? (
                                        <>
                                            {isOfficeDoc || isPdf ? (
                                                <iframe
                                                    src={viewerUrl}
                                                    className="w-full h-full border dark:border-gray-600 rounded-md bg-white"
                                                    title="Document Preview"
                                                ></iframe>
                                            ) : (
                                                <div className="border rounded-md h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
                                                    <p className="text-gray-500 dark:text-gray-400">No preview available for this file type.</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="h-full overflow-y-auto pr-4 border dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-900/50">
                                            <div className="space-y-6">
                                                {data.submission.type === 'quiz' && data.questions && data.questions.map((q, index) => (
                                                    <div key={q.id} className="pb-4 border-b dark:border-gray-700 last:border-b-0">
                                                        <p className="font-bold text-gray-800 dark:text-gray-200">{index + 1}. {q.stem}</p>
                                                        <div className="mt-2">{renderAnswer(q, (data.submission as QuizSubmission).answers[q.id])}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Column 2: Grading Panel */}
                            <div className="flex flex-col overflow-hidden">
                                {isPreviewExpanded ? (
                                    <div className="flex flex-col items-center justify-start h-full pt-4">
                                        <button 
                                            onClick={() => setIsPreviewExpanded(false)} 
                                            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                            title="Show Grader"
                                        >
                                            <Icon name="PanelLeftOpen" className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-bold mb-2 flex-shrink-0 text-gray-800 dark:text-gray-200">Grading</h3>
                                        <div className="overflow-y-auto pr-2 -mr-2">
                                            {data.rubric ? renderRubricGrader(data.rubric) : <p className="text-gray-500">No rubric attached. Grade out of 100.</p>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="flex-shrink-0 pt-4 mt-4 border-t dark:border-gray-700 flex justify-between items-center">
                        {data?.rubric && !isPreviewExpanded && (
                            <div className="font-bold text-lg dark:text-gray-200">
                                Total Score: {rubricScore} / {maxRubricScore}
                            </div>
                        )}
                        <div className="flex-grow flex justify-end space-x-2">
                            <button onClick={() => onClose(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                            <button onClick={handleSaveGrade} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700">
                                Save Final Grade
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
