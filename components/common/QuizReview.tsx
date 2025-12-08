
import React from 'react';
import { Question, QuestionType, QuizSubmission } from '../../types';
import { Icon } from '../icons';

interface QuizReviewProps {
    submission: QuizSubmission;
    questions: Question[];
}

export const QuizReview: React.FC<QuizReviewProps> = ({ submission, questions }) => {
    
    const renderAnswerFeedback = (question: Question) => {
        const studentAnswer = submission.answers[question.id];
        
        // Helper to determine if the answer was correct (basic auto-grading logic reuse)
        const isCorrect = (() => {
            if (question.type === QuestionType.MultipleChoice) return studentAnswer === question.correctAnswerIndex;
            if (question.type === QuestionType.TrueFalse) return studentAnswer === question.correctAnswer;
            if (question.type === QuestionType.ShortAnswer) return question.acceptableAnswers.some(a => a.toLowerCase() === String(studentAnswer).toLowerCase());
            if (question.type === QuestionType.FillBlank) return question.acceptableAnswers.some(a => a.toLowerCase() === String(studentAnswer).toLowerCase());
            if (question.type === QuestionType.MultipleSelect) {
                const ans = (studentAnswer as number[]) || [];
                const correct = question.correctAnswerIndices;
                if (ans.length !== correct.length) return false;
                return ans.every(i => correct.includes(i));
            }
            return false;
        })();

        switch (question.type) {
            case QuestionType.MultipleChoice:
                return (
                    <div className="space-y-2 mt-2">
                        {question.options.map((opt, idx) => {
                            const isSelected = studentAnswer === idx;
                            const isCorrectOption = question.correctAnswerIndex === idx;
                            let className = "p-3 rounded-md border flex items-center justify-between ";
                            
                            if (isSelected && isCorrectOption) className += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-200";
                            else if (isSelected && !isCorrectOption) className += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200";
                            else if (!isSelected && isCorrectOption) className += "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300";
                            else className += "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-70";

                            return (
                                <div key={idx} className={className}>
                                    <span className="flex items-center">
                                        {isSelected && <Icon name={isCorrectOption ? "CheckCircle" : "X"} className="w-4 h-4 mr-2" />}
                                        {opt}
                                    </span>
                                    {isCorrectOption && !isSelected && <span className="text-xs font-bold uppercase text-green-700 dark:text-green-300">(Correct Answer)</span>}
                                </div>
                            );
                        })}
                    </div>
                );
            case QuestionType.TrueFalse:
                return (
                    <div className="flex gap-4 mt-2">
                        {[true, false].map((val) => {
                            const isSelected = studentAnswer === val;
                            const isCorrectOption = question.correctAnswer === val;
                            let className = "px-4 py-2 rounded-md border font-medium flex items-center ";

                            if (isSelected && isCorrectOption) className += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-200";
                            else if (isSelected && !isCorrectOption) className += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200";
                            else if (!isSelected && isCorrectOption) className += "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300";
                            else className += "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-70";

                            return (
                                <div key={String(val)} className={className}>
                                    {val ? 'True' : 'False'}
                                    {isSelected && <Icon name={isCorrectOption ? "CheckCircle" : "X"} className="w-4 h-4 ml-2" />}
                                </div>
                            );
                        })}
                    </div>
                );
            case QuestionType.ShortAnswer:
            case QuestionType.FillBlank:
                return (
                    <div className="mt-2 space-y-2">
                        <div className={`p-3 rounded-md border ${isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/20' : 'bg-red-50 border-red-200 dark:bg-red-900/20'}`}>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Your Answer:</p>
                            <p className="text-gray-900 dark:text-gray-100">{String(studentAnswer || '')}</p>
                        </div>
                        {!isCorrect && (
                            <div className="p-3 rounded-md border bg-green-50 border-green-200 dark:bg-green-900/20">
                                <p className="text-sm font-semibold text-green-700 dark:text-green-300">Acceptable Answer(s):</p>
                                <p className="text-green-900 dark:text-green-100">{question.acceptableAnswers.join(', ')}</p>
                            </div>
                        )}
                    </div>
                );
            case QuestionType.MultipleSelect:
                return (
                    <div className="space-y-2 mt-2">
                        {question.options.map((opt, idx) => {
                            const ans = (studentAnswer as number[]) || [];
                            const isSelected = ans.includes(idx);
                            const isCorrectOption = question.correctAnswerIndices.includes(idx);
                            
                            let className = "p-3 rounded-md border flex items-center justify-between ";
                            
                            // Logic: 
                            // Selected & Correct -> Green
                            // Selected & Incorrect -> Red
                            // Not Selected & Correct -> Light Green (Missed)
                            
                            if (isSelected && isCorrectOption) className += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-200";
                            else if (isSelected && !isCorrectOption) className += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200";
                            else if (!isSelected && isCorrectOption) className += "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300";
                            else className += "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-70";

                            return (
                                <div key={idx} className={className}>
                                    <span className="flex items-center">
                                        <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${isSelected ? (isCorrectOption ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500') : 'border-gray-400'}`}>
                                            {isSelected && <Icon name={isCorrectOption ? "CheckCircle" : "X"} className="w-3 h-3 text-white" />}
                                        </div>
                                        {opt}
                                    </span>
                                    {isCorrectOption && !isSelected && <span className="text-xs font-bold uppercase text-green-700 dark:text-green-300">(Missed)</span>}
                                </div>
                            );
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            {questions.map((q, index) => (
                <div key={q.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                    <div className="flex items-start gap-3 mb-2">
                        <span className="font-bold text-gray-500 dark:text-gray-400 mt-0.5">{index + 1}.</span>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-lg">{q.stem}</p>
                            {renderAnswerFeedback(q)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
