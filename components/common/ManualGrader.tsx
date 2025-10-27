import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import * as api from '../../services/api';
import { Question, QuizSubmission, QuestionType, Rubric, RubricCriterion, RubricLevel } from '../../types';
import { Icon } from '../icons';

interface ManualGraderProps {
    isOpen: boolean;
    onClose: (wasUpdated: boolean) => void;
    submissionId: string;
    studentName: string;
}

interface GraderData {
    submission: QuizSubmission;
    questions: Question[];
    rubric: Rubric | null;
}

export const ManualGrader: React.FC<ManualGraderProps> = ({ isOpen, onClose, submissionId, studentName }) => {
    const [data, setData] = useState<GraderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [manualScores, setManualScores] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!isOpen) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await api.getSubmissionDetails(submissionId);
                setData(result);
                // Initialize scores
                const initialScores: Record<string, number> = {};
                if (result?.rubric) {
                    result.rubric.criteria.forEach(c => {
                        // Default to the best score
                        initialScores[`criterion-${c.id}`] = result.rubric!.levels[0].points;
                    });
                } else {
                    result?.questions.forEach(q => {
                        if (q.type === QuestionType.ShortAnswer) {
                            initialScores[q.id] = 1; // Default to full marks
                        }
                    });
                }
                setManualScores(initialScores);
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

    const handleSaveGrade = async () => {
        try {
            await api.gradeManualSubmission(submissionId, manualScores);
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
                    <div className={`p-2 rounded ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        <p><strong>Student's Answer:</strong> {question.options[answer]}</p>
                        <p><strong>Correct Answer:</strong> {question.options[question.correctAnswerIndex]}</p>
                    </div>
                );
            case QuestionType.TrueFalse:
                const isTfCorrect = answer === question.correctAnswer;
                return (
                    <div className={`p-2 rounded ${isTfCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        <p><strong>Student's Answer:</strong> {String(answer)}</p>
                        <p><strong>Correct Answer:</strong> {String(question.correctAnswer)}</p>
                    </div>
                );
            case QuestionType.ShortAnswer:
                return (
                    <div className="p-2 bg-yellow-50 rounded">
                        <p><strong>Student's Answer:</strong></p>
                        <p className="italic pl-2 border-l-2 border-yellow-300">"{String(answer)}"</p>
                    </div>
                );
            default: return <p className="p-2 bg-gray-100 rounded">This question was auto-graded.</p>;
        }
    };

    const renderRubricGrader = (rubric: Rubric) => (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border font-medium text-left">Criteria</th>
                        {rubric.levels.map(level => (
                             <th key={level.id} className="p-2 border font-medium text-center">{level.name} ({level.points} pts)</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rubric.criteria.map(criterion => (
                        <tr key={criterion.id} className="border-t">
                            <td className="p-2 border font-medium text-gray-800">{criterion.description}</td>
                             {rubric.levels.map(level => (
                                <td key={level.id} className="p-2 border text-center">
                                    <button 
                                        onClick={() => handleScoreChange(`criterion-${criterion.id}`, level.points)}
                                        className={`w-full h-full p-3 rounded transition-colors ${manualScores[`criterion-${criterion.id}`] === level.points ? 'bg-primary-dark ring-2 ring-primary-dark' : 'bg-primary/50 hover:bg-primary'}`}
                                    >
                                        &nbsp;
                                    </button>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const { score: rubricScore, maxScore: maxRubricScore } = calculateRubricScore();

    return (
        <Modal isOpen={isOpen} onClose={() => onClose(false)} title={`Grade Submission for ${studentName}`}>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                {loading && <p>Loading submission...</p>}
                {!loading && data && (
                    <div className="space-y-6">
                        {data.rubric ? renderRubricGrader(data.rubric) : (
                            data.questions.map((q, index) => (
                                <div key={q.id} className="pb-4 border-b last:border-b-0">
                                    <p className="font-bold text-gray-800">{index + 1}. {q.stem}</p>
                                    <div className="mt-2">
                                        {renderAnswer(q, data.submission.answers[q.id])}
                                    </div>
                                    {q.type === QuestionType.ShortAnswer && (
                                        <div className="mt-3 flex items-center justify-end space-x-2">
                                            <label htmlFor={`score-${q.id}`} className="text-sm font-medium">Score:</label>
                                            <select
                                                id={`score-${q.id}`}
                                                value={manualScores[q.id] ?? 1}
                                                onChange={e => handleScoreChange(q.id, parseInt(e.target.value, 10))}
                                                className="border-gray-300 rounded-md shadow-sm"
                                            >
                                                <option value="1">Correct (1 pt)</option>
                                                <option value="0">Incorrect (0 pts)</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            <div className="pt-4 mt-4 border-t flex justify-between items-center">
                {data?.rubric && (
                    <div className="font-bold text-lg">
                        Total Score: {rubricScore} / {maxRubricScore}
                    </div>
                )}
                <div className="flex-grow flex justify-end space-x-2">
                    <button onClick={() => onClose(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                    <button onClick={handleSaveGrade} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700">
                        Save Final Grade
                    </button>
                </div>
            </div>
        </Modal>
    );
};