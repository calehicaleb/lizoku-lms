
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as api from '../../services/api';
import { Question, QuestionType, Grade, ContentItem, QuizSubmission, Rubric } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../icons';
import { RubricViewer } from './RubricViewer';
import { QuizReview } from './QuizReview';

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
    const { id: contentItemId, questionIds = [], title: quizTitle, timeLimit, attemptsLimit, randomizeQuestions, instructions, rubricId } = quizItem;
    const { user } = useAuth();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionTypes, setQuestionTypes] = useState<string[]>([]);
    const [previousAttempts, setPreviousAttempts] = useState<QuizSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [rubric, setRubric] = useState<Rubric | null>(null);
    
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, Answer>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [finalGrade, setFinalGrade] = useState<Grade | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(timeLimit ? timeLimit * 60 : null);
    
    // New state for Review Mode
    const [isReviewing, setIsReviewing] = useState(false);
    const [latestSubmission, setLatestSubmission] = useState<QuizSubmission | null>(null);
    
    const timerRef = useRef<number | null>(null);
    
    const currentAttemptNumber = useMemo(() => previousAttempts.length + 1, [previousAttempts]);
    const canAttempt = useMemo(() => !attemptsLimit || currentAttemptNumber <= attemptsLimit, [currentAttemptNumber, attemptsLimit]);

    useEffect(() => {
        if (!user) return;
        
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const promises: [Promise<Question[]>, Promise<QuizSubmission[]>, Promise<Rubric | null>] = [
                     questionIds.length > 0 ? api.getQuestionsByIds(questionIds) : Promise.resolve([]),
                     api.getStudentSubmissionsForContent(user.id, contentItemId),
                     rubricId ? api.getRubricById(rubricId) : Promise.resolve(null)
                ];

                const [fetchedQuestions, submissions, fetchedRubric] = await Promise.all(promises);
                
                // This logic belongs here, before any randomization happens
                const types = [...new Set(fetchedQuestions.map(q => q.type.replace('-', ' ')))];
                setQuestionTypes(types);
                
                // Keep original order if not randomized or if we need them for review later (though review should match display)
                if (randomizeQuestions) {
                    setQuestions(shuffleArray(fetchedQuestions));
                } else {
                    setQuestions(fetchedQuestions);
                }
                setPreviousAttempts(submissions);
                setRubric(fetchedRubric);

            } catch (error) {
                console.error("Failed to fetch quiz data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [contentItemId, questionIds, randomizeQuestions, user, rubricId]);

    useEffect(() => {
        if (timeLeft === null || isSubmitted || !quizStarted) return;

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
    }, [timeLeft, isSubmitted, quizStarted]);

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
        if (!user || isSubmitted) return;

        setIsSubmitted(true);
        if (timerRef.current) window.clearInterval(timerRef.current);

        try {
            const resultGrade = await api.submitQuiz(user.id, courseId, contentItemId, answers);
            setFinalGrade(resultGrade);
            
            // Construct a local submission object for immediate review
            const submission: QuizSubmission = {
                id: resultGrade.submissionId || 'temp-sub',
                type: 'quiz',
                studentId: user.id,
                courseId: courseId,
                contentItemId: contentItemId,
                submittedAt: new Date().toISOString(),
                answers: answers,
                attemptNumber: currentAttemptNumber
            };
            setLatestSubmission(submission);
            
        } catch (error) {
            console.error("Failed to submit quiz", error);
            alert("An error occurred while submitting your quiz. Please try again.");
            setIsSubmitted(false); // Allow retry on failure
        }
    };
    
    // --- Render Functions ---
    
    const renderQuestion = (question: Question) => {
        if (question.type === QuestionType.MultipleChoice) {
            return (
                <div className="mt-4 space-y-3">
                    {question.options.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-secondary-light dark:hover:bg-secondary/20 transition-colors has-[:checked]:bg-primary has-[:checked]:border-primary dark:has-[:checked]:border-primary has-[:checked]:text-gray-800">
                            <input
                                type="radio"
                                name={question.id}
                                value={index}
                                checked={answers[question.id] === index}
                                onChange={() => handleAnswerSelect(question.id, index)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
                        </label>
                    ))}
                </div>
            );
        } else if (question.type === QuestionType.TrueFalse) {
             return (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[true, false].map(value => (
                            <label key={String(value)} className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-secondary-light dark:hover:bg-secondary/20 transition-colors has-[:checked]:bg-primary has-[:checked]:border-primary dark:has-[:checked]:border-primary has-[:checked]:text-gray-800">
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
                            className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
                            rows={4}
                            placeholder="Type your answer here..."
                        />
                    </div>
                );
        } else if (question.type === QuestionType.MultipleSelect) {
             return (
                <div className="mt-4 space-y-3">
                    {question.options.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-secondary-light dark:hover:bg-secondary/20 transition-colors has-[:checked]:bg-primary has-[:checked]:border-primary dark:has-[:checked]:border-primary has-[:checked]:text-gray-800">
                            <input
                                type="checkbox"
                                name={question.id}
                                value={index}
                                checked={(answers[question.id] as number[] || []).includes(index)}
                                onChange={() => handleMultipleSelect(question.id, index)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
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
                            <span className="dark:text-gray-300">{part}</span>
                            {index < parts.length - 1 && (
                                <input
                                    type="text"
                                    value={(answers[question.id] as string) || ''}
                                    onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                                    className="px-2 py-1 border-b-2 border-gray-300 dark:border-gray-500 focus:border-primary focus:outline-none bg-transparent w-40 dark:text-gray-200"
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
    
    if (questionIds.length === 0) {
        return (
            <div>
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{quizTitle}</h1>
                 <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed dark:border-gray-600">
                    <Icon name="ClipboardCheck" className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">Quiz Not Ready</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This quiz has no questions yet. Please check back later.</p>
                </div>
            </div>
        );
    }
    
    // Review Mode View
    if (isReviewing && latestSubmission) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Review: {quizTitle}</h1>
                    <button onClick={() => { setIsReviewing(false); setIsSubmitted(true); }} className="text-sm text-secondary dark:text-blue-400 hover:underline">
                        &larr; Back to Results
                    </button>
                </div>
                <QuizReview submission={latestSubmission} questions={questions} />
                <div className="mt-8 flex justify-center">
                    <button onClick={onComplete} className="bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-secondary-dark transition duration-300">
                        Finish Review
                    </button>
                </div>
            </div>
        );
    }
    
    if (isSubmitted) {
        return (
            <div className="text-center p-8">
                <Icon name={finalGrade?.status === 'graded' ? 'BadgeCheck' : 'Clock'} className={`mx-auto h-16 w-16 mb-4 ${finalGrade?.status === 'graded' ? 'text-green-500' : 'text-yellow-500'}`} />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quiz Submitted!</h2>
                {finalGrade?.status === 'graded' ? (
                    <>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Your score for "{quizTitle}" is:</p>
                        <p className="text-5xl font-bold text-primary my-4">{finalGrade.score}%</p>
                    </>
                ) : (
                    <>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">This quiz contains questions that require manual grading.</p>
                        <p className="text-gray-500 dark:text-gray-400">Your score will be available once your instructor has reviewed your submission.</p>
                    </>
                )}
                
                <div className="mt-8 space-x-4">
                    <button onClick={() => setIsReviewing(true)} className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-2 px-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300">
                        Review Answers
                    </button>
                    <button onClick={onComplete} className="bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-secondary-dark transition duration-300">
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }
    
    if (!quizStarted) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{quizTitle}</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Before you begin, please review the following information.</p>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Instructions</h2>
                    {instructions && <p className="mb-4 text-gray-700 dark:text-gray-300">{instructions}</p>}

                    {rubric && (
                        <div className="my-6">
                            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-2">Grading Rubric</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Some questions in this quiz may be graded manually using the following rubric.</p>
                            <RubricViewer rubric={rubric} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Details</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center text-gray-700 dark:text-gray-300"><Icon name="Clock" className="h-4 w-4 mr-2 text-secondary dark:text-blue-400"/>Time Limit: <span className="font-bold ml-1 text-gray-800 dark:text-gray-200">{timeLimit || 'None'} minutes</span></li>
                                <li className="flex items-center text-gray-700 dark:text-gray-300"><Icon name="History" className="h-4 w-4 mr-2 text-secondary dark:text-blue-400"/>Attempts: <span className="font-bold ml-1 text-gray-800 dark:text-gray-200">{attemptsLimit ? `${currentAttemptNumber} of ${attemptsLimit}` : 'Unlimited'}</span></li>
                                <li className="flex items-center text-gray-700 dark:text-gray-300"><Icon name="ListChecks" className="h-4 w-4 mr-2 text-secondary dark:text-blue-400"/>Number of Questions: <span className="font-bold ml-1 text-gray-800 dark:text-gray-200">{questions.length}</span></li>
                                <li className="flex items-center text-gray-700 dark:text-gray-300"><Icon name="FileText" className="h-4 w-4 mr-2 text-secondary dark:text-blue-400"/>Question Types: <span className="font-bold ml-1 capitalize text-gray-800 dark:text-gray-200">{questionTypes.join(', ') || 'N/A'}</span></li>
                            </ul>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md border-l-4 border-yellow-400 dark:border-yellow-500">
                            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Academic Integrity</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">This is an individual assessment. Do not collaborate with others. All submissions will be checked for plagiarism. By starting this quiz, you agree to uphold the institution's academic integrity policy.</p>
                        </div>
                    </div>
                    
                    <div className="text-center space-x-4">
                        <button 
                            onClick={() => setQuizStarted(true)}
                            disabled={!canAttempt}
                            className="bg-primary text-gray-800 font-bold py-3 px-8 rounded-md hover:bg-primary-dark transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {canAttempt ? `Start Attempt ${currentAttemptNumber}` : 'No Attempts Remaining'}
                        </button>
                        
                        {!canAttempt && previousAttempts.length > 0 && (
                             <button 
                                onClick={() => {
                                    // Use the latest submission for review
                                    const latest = previousAttempts.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
                                    setLatestSubmission(latest);
                                    setIsReviewing(true);
                                }}
                                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-8 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-300"
                            >
                                Review Previous Attempt
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div>
            <div className="flex justify-between items-start mb-1">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 ">{quizTitle}</h1>
                {timeLeft !== null && (
                     <div className="bg-red-100 text-red-700 font-bold text-lg py-2 px-4 rounded-md">
                        <Icon name="Clock" className="inline-block h-5 w-5 mr-2" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Question {currentQuestionIndex + 1} of {questions.length}</p>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{currentQuestion.stem}</p>
                {renderQuestion(currentQuestion)}
            </div>

            <div className="mt-6 flex justify-between items-center">
                <button 
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
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
