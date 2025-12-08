import React, { useState } from 'react';
import { ContentItem, SurveyQuestionType } from '../../types';
import { Icon } from '../icons';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface SurveyTakerProps {
    survey: ContentItem;
    onComplete: () => void;
}

export const SurveyTaker: React.FC<SurveyTakerProps> = ({ survey, onComplete }) => {
    const { user } = useAuth();
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (!user) return;

        // Validate required fields
        const missing = survey.surveyQuestions?.filter(q => q.required && (answers[q.id] === undefined || answers[q.id] === ''));
        if (missing && missing.length > 0) {
            alert(`Please answer all required questions.`);
            return;
        }
        
        setIsSubmitting(true);
        try {
            await api.submitSurvey(user.id, survey.id, answers);
            setIsSubmitted(true);
        } catch (error) {
            console.error("Failed to submit survey", error);
            alert("Failed to submit survey. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Icon name="CheckCircle" className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Thank You!</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Your feedback has been recorded.</p>
                <button onClick={onComplete} className="mt-6 px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark">
                    Back to Course
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{survey.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Please complete this survey to help us improve the course.</p>

            <div className="space-y-8">
                {survey.surveyQuestions?.map((q, index) => (
                    <div key={q.id} className="border-b dark:border-gray-700 pb-6 last:border-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            {index + 1}. {q.text} {q.required && <span className="text-red-500">*</span>}
                        </p>
                        
                        {q.type === SurveyQuestionType.Rating && (
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                        key={star} 
                                        onClick={() => handleAnswerChange(q.id, star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Icon 
                                            name="Star" 
                                            className={`h-8 w-8 ${answers[q.id] >= star ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {q.type === SurveyQuestionType.YesNo && (
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name={q.id} 
                                        value="yes"
                                        checked={answers[q.id] === 'yes'} 
                                        onChange={() => handleAnswerChange(q.id, 'yes')}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">Yes</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name={q.id} 
                                        value="no"
                                        checked={answers[q.id] === 'no'} 
                                        onChange={() => handleAnswerChange(q.id, 'no')}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">No</span>
                                </label>
                            </div>
                        )}

                        {q.type === SurveyQuestionType.OpenEnded && (
                            <textarea 
                                value={answers[q.id] || ''}
                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Your answer..."
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-primary text-gray-900 font-bold rounded-md hover:bg-primary-dark shadow-md transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                </button>
            </div>
        </div>
    );
};