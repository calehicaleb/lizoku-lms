import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../../services/api';
import { Examination, Question, Grade, QuestionType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/icons';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

type Answer = string | number | boolean | number[];

const ExamTakerPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const { user } = useAuth();

    const [exam, setExam] = useState<Examination | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [examStarted, setExamStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, Answer>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [finalGrade, setFinalGrade] = useState<Grade | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    
    const timerRef = useRef<number | null>(null);

    // Fetch exam and question data
    useEffect(() => {
        if (!examId || !user) {
             setLoading(false);
             return;
        };

        const fetchExamData = async () => {
            try {
                const examDetails = await api.getExaminationDetails(examId);
                if (!examDetails) {
                    throw new Error("Examination not found.");
                }
                setExam(examDetails);
                setTimeLeft(examDetails.durationMinutes * 60);

                let fetchedQuestions = await api.getQuestionsByIds(examDetails.questionIds);
                if (examDetails.shuffleQuestions) {
                    fetchedQuestions = shuffleArray(fetchedQuestions);
                }
                setQuestions(fetchedQuestions);
            } catch (error) {
                console.error("Failed to load examination", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExamData();
    }, [examId, user]);

    const handleSubmit = useCallback(async () => {
        if (!user || !examId || isSubmitted) return;

        setIsSubmitted(true);
        if (timerRef.current) window.clearInterval(timerRef.current);

        try {
            const resultGrade = await api.submitExamination(user.id, examId, answers);
            setFinalGrade(resultGrade);
        } catch (error) {
            console.error("Failed to submit examination", error);
            alert("An error occurred while submitting. Please try again.");
            setIsSubmitted(false); // Allow retry
        }
    }, [user, examId, isSubmitted, answers]);
    
    // Timer effect
    useEffect(() => {
        if (!examStarted || timeLeft === null || isSubmitted) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev !== null && prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev !== null ? prev - 1 : null;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [examStarted, timeLeft, isSubmitted, handleSubmit]);


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
    
    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '...';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        let timeString = '';
        if (hours > 0) timeString += `${String(hours).padStart(2, '0')}:`;
        timeString += `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return timeString;
    };
    
    const renderQuestion = (question: Question) => {
        if (question.type === QuestionType.MultipleChoice) {
            return (
                <div className="mt-4 space-y-3">
                    {question.options.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-secondary-light dark:hover:bg-secondary/20 transition-colors has-[:checked]:bg-primary has-[:checked]:border-primary dark:has-[:checked]:border-primary has-[:checked]:text-gray-800">
                            <input type="radio" name={question.id} value={index} checked={answers[question.id] === index} onChange={() => handleAnswerSelect(question.id, index)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
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
                                 <input type="radio" name={question.id} checked={answers[question.id] === value} onChange={() => handleAnswerSelect(question.id, value)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                                <span className="ml-3 text-lg font-bold">{value ? 'True' : 'False'}</span>
                            </label>
                        ))}
                    </div>
                );
        } else if (question.type === QuestionType.ShortAnswer) {
             return (
                    <div className="mt-4">
                         <textarea value={(answers[question.id] as string) || ''} onChange={(e) => handleAnswerSelect(question.id, e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200" rows={4} placeholder="Type your answer here..."/>
                    </div>
                );
        } else if (question.type === QuestionType.MultipleSelect) {
             return (
                <div className="mt-4 space-y-3">
                    {question.options.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-secondary-light dark:hover:bg-secondary/20 transition-colors has-[:checked]:bg-primary has-[:checked]:border-primary dark:has-[:checked]:border-primary has-[:checked]:text-gray-800">
                            <input type="checkbox" name={question.id} value={index} checked={(answers[question.id] as number[] || []).includes(index)} onChange={() => handleMultipleSelect(question.id, index)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
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
                                <input type="text" value={(answers[question.id] as string) || ''} onChange={(e) => handleAnswerSelect(question.id, e.target.value)} className="px-2 py-1 border-b-2 border-gray-300 dark:border-gray-500 focus:border-primary focus:outline-none bg-transparent w-40 dark:text-gray-200"/>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            );
        } else {
             return <p>Unsupported question type.</p>;
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">Loading Examination...</div>;
    }
    
    if (!exam) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">Examination not found.</div>;
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-lg w-full">
                    <Icon name={finalGrade?.status === 'graded' ? 'BadgeCheck' : 'Clock'} className={`mx-auto h-16 w-16 mb-4 ${finalGrade?.status === 'graded' ? 'text-green-500' : 'text-yellow-500'}`} />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Examination Submitted!</h2>
                    {finalGrade?.status === 'graded' ? (
                        <>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Your score for "{exam.title}" is:</p>
                            <p className="text-5xl font-bold text-primary my-4">{finalGrade.score}%</p>
                        </>
                    ) : (
                        <>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">This exam contains questions that require manual grading.</p>
                            <p className="text-gray-500 dark:text-gray-400">Your score will be available once your instructor has reviewed your submission.</p>
                        </>
                    )}
                    <button onClick={() => window.close()} className="mt-6 bg-secondary text-white font-bold py-3 px-6 rounded-md hover:bg-secondary-dark transition duration-300">
                        Close Window & Return to Portal
                    </button>
                </div>
            </div>
        );
    }
    
    if (!examStarted) {
        return (
             <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-2xl w-full">
                    <Icon name="ListChecks" className="h-16 w-16 mx-auto text-secondary dark:text-blue-400 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{exam.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{exam.courseTitle}</p>
                    <div className="my-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600 text-left">
                        <h2 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Instructions</h2>
                        <p className="text-gray-600 dark:text-gray-300">{exam.instructions}</p>
                    </div>
                     <div className="my-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border-l-4 border-yellow-400 dark:border-yellow-500 text-left">
                        <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Academic Integrity</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">This is an individual assessment. Do not collaborate with others. By starting this exam, you agree to uphold the institution's academic integrity policy.</p>
                    </div>
                    <button onClick={() => setExamStarted(true)} className="w-full bg-primary text-gray-800 font-bold py-4 px-8 rounded-md hover:bg-primary-dark transition duration-300 text-lg">
                        Begin Examination ({exam.durationMinutes} minutes)
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate pr-4">{exam.title}</h1>
                    <div className="bg-red-100 text-red-700 font-bold text-lg py-2 px-4 rounded-md flex items-center">
                        <Icon name="Clock" className="inline-block h-5 w-5 mr-2" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </div>
                 <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
                    <div className="bg-primary h-1" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            </header>
            
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-3xl">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{currentQuestion.stem}</p>
                    {renderQuestion(currentQuestion)}

                     <div className="mt-8 flex justify-between items-center">
                        <button onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                            Previous
                        </button>
                        {isLastQuestion ? (
                             <button onClick={handleSubmit} className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700">
                                Submit Examination
                            </button>
                        ) : (
                            <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-secondary-dark">
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ExamTakerPage;
