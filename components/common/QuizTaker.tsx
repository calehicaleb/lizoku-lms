import React, { useState, useEffect, useRef } from 'react';
import * as api from '../../services/api';
import { Question, QuestionType, Grade, ContentItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../icons';

interface QuizTakerProps {
    courseId: string;
    quizItem: ContentItem;
    onComplete: () => void;
}

type Answer = string | number | boolean | number[];

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const QuizTaker: React.FC<QuizTakerProps> = ({ courseId, quizItem, onComplete }) => {
    // Fix: Destructure all needed properties from quizItem at the top and rename id.
    const { id: contentItemId, questionIds = [], title: quizTitle, timeLimit, randomizeQuestions } = quizItem;
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, Answer>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [finalGrade, setFinalGrade] = useState<Grade | null>(null);
    // Fix: Use the destructured timeLimit variable.
    const [timeLeft, setTimeLeft] = useState<number | null>(timeLimit ? timeLimit * 60 : null);
    
    // FIX: Changed NodeJS.Timeout to `number` which is the correct type for browser environments.
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (questionIds.length === 0) {
            setLoading(false);
            return;
        }
        const fetchQuestions = async () => {
            try {
                let data = await api.getQuestionsByIds(questionIds);
                if (randomizeQuestions) {
                    data = shuffleArray(data);
                }
                setQuestions(data);
            } catch (error) {
                console.error("Failed to fetch quiz questions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [questionIds, randomizeQuestions]);

    useEffect(() => {
        if (timeLeft === null || isSubmitted) return;

        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    if (timerRef.current) window.clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [timeLeft, isSubmitted]);

    const handleAnswerSelect = (questionId: string, answer: Answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleMultipleSelect = (questionId: string, optionIndex: number) => {
        const currentAnswers = (answers[questionId] as number[] || []);
        const newAnswers = new Set(currentAnswers);
        if (newAnswers.has(optionIndex)) {
            newAnswers.delete(optionIndex);
        } else {
            newAnswers.add(optionIndex);
        }
        handleAnswerSelect(questionId, Array.from(newAnswers));
    };

    const handleSubmit = async () => {
        if (!user) return; // Add a check to ensure user is defined.

        if (isSubmitted) return; // Prevent double submission
        setIsSubmitted(true);
        if (timerRef.current) window.clearInterval(timerRef.current);

        try {
            // Fix: Use the correctly named contentItemId from the top-level destructuring.
            const resultGrade = await api.submitQuiz(user.id, courseId, contentItemId, answers);
            setFinalGrade(resultGrade);
        } catch (error) {
            console.error("Failed to submit quiz", error);
            alert("An error occurred while submitting your quiz. Please try again.");
            setIsSubmitted(false); // Allow retry on failure
        }
    };
    
    const renderQuestion = (question: Question) => {
        // Fix: Added a type guard using 'in' operator to safely access 'options'.
        if (question.type === QuestionType.MultipleChoice && 'options' in question) {
            return (
                <div className="mt-4 space-y-3">
                    {question.options.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-secondary-light transition-colors has-[:checked]:bg-primary-dark has-[:checked]:border-primary-dark has-[:checked]:text-white">
                            <input
                                type="radio"
                                name={question.id}
                                value={index}
                                checked={answers[question.id] === index}
                                onChange={() => handleAnswerSelect(question.id, index)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="ml-3 text-gray-700">{option}</span>
                        </label>
                    ))}
                </div>
            );
        // Fix: Added a type guard using 'in' operator to safely access 'correctAnswer'.
        } else if (question.type === QuestionType.TrueFalse && 'correctAnswer' in question) {
             return (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[true, false].map(value => (
                            <label key={String(value)} className="flex items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-secondary-light transition-colors has-[:checked]:bg-primary-dark has-[:checked]:border-primary-dark has-[:checked]:text-white">
                                 <input
                                    type="radio"
                                    name={question.id}
                                    checked={answers[question.id] === value}
                                    onChange={() => handleAnswerSelect(question.id, value)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                />
                                <span className="ml-3 text-lg font-bold">{value ? 'True' : 'False'}</span>
                            </label>
                        ))}
                    </div>
                );
        } else if (question.type === QuestionType.ShortAnswer) {
             return (
                    <div className="mt-4">
                         <textarea
                            value={(answers[question.id] as string) || ''}
                            onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={4}
                            placeholder="Type your answer here..."
                        />
                    </div>
                );
        } else if (question.type === QuestionType.MultipleSelect) {
             return (
                <div className="mt-4 space-y-3">
                    {question.options.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-secondary-light transition-colors has-[:checked]:bg-primary-dark has-[:checked]:border-primary-dark has-[:checked]:text-white">
                            <input
                                type="checkbox"
                                name={question.id}
                                value={index}
                                checked={(answers[question.id] as number[] || []).includes(index)}
                                onChange={() => handleMultipleSelect(question.id, index)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <span className="ml-3 text-gray-700">{option}</span>
                        </label>
                    ))}
                </div>
            );
        } else if (question.type === QuestionType.FillBlank) {
            const parts = question.stem.split('___');
            return (
                <div className="mt-4 flex items-center flex-wrap gap-2 text-lg">
                    {parts.map((part, index) => (
                        <React.Fragment key={index}>
                            <span>{part}</span>
                            {index < parts.length - 1 && (
                                <input
                                    type="text"
                                    value={(answers[question.id] as string) || ''}
                                    onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                                    className="px-2 py-1 border-b-2 border-gray-300 focus:border-primary focus:outline-none bg-transparent w-40"
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            );
        } else {
             return <p>Unsupported question type.</p>;
        }
    };
    
    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) return <div className="text-center p-8">Loading Quiz...</div>;
    
    if (!questionIds || questionIds.length === 0) {
        return (
            <div>
                 <h1 className="text-3xl font-bold text-gray-800 mb-4">{quizTitle}</h1>
                 <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
                    <Icon name="ClipboardCheck" className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Quiz Not Ready</h3>
                    <p className="mt-1 text-sm text-gray-500">This quiz has no questions yet. Please check back later.</p>
                </div>
            </div>
        );
    }
    
    if (isSubmitted) {
        return (
            <div className="text-center p-8">
                <Icon name={finalGrade?.status === 'graded' ? 'BadgeCheck' : 'Clock'} className={`mx-auto h-16 w-16 mb-4 ${finalGrade?.status === 'graded' ? 'text-green-500' : 'text-yellow-500'}`} />
                <h2 className="text-2xl font-bold text-gray-800">Quiz Submitted!</h2>
                {finalGrade?.status === 'graded' ? (
                    <>
                        <p className="text-lg text-gray-600 mt-2">Your score for "{quizTitle}" is:</p>
                        <p className="text-5xl font-bold text-primary my-4">{finalGrade.score}%</p>
                    </>
                ) : (
                    <>
                        <p className="text-lg text-gray-600 mt-2">This quiz contains questions that require manual grading.</p>
                        <p className="text-gray-500">Your score will be available once your instructor has reviewed your submission.</p>
                    </>
                )}
                <button onClick={onComplete} className="mt-6 bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-secondary-dark transition duration-300">
                    Back to Course
                </button>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div>
            <div className="flex justify-between items-start mb-1">
                <h1 className="text-3xl font-bold text-gray-800 ">{quizTitle}</h1>
                {timeLeft !== null && (
                     <div className="bg-red-100 text-red-700 font-bold text-lg py-2 px-4 rounded-md">
                        <Icon name="Clock" className="inline-block h-5 w-5 mr-2" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>
            <p className="text-gray-500 mb-6">Question {currentQuestionIndex + 1} of {questions.length}</p>

            <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-lg font-semibold text-gray-800">{currentQuestion.stem}</p>
                {renderQuestion(currentQuestion)}
            </div>

            <div className="mt-6 flex justify-between items-center">
                <button 
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                    Previous
                </button>
                {isLastQuestion ? (
                     <button
                        onClick={handleSubmit}
                        disabled={answers[currentQuestion.id] === undefined}
                        className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark disabled:bg-gray-300"
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button 
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        disabled={answers[currentQuestion.id] === undefined}
                        className="bg-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-secondary-dark disabled:bg-gray-300"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};