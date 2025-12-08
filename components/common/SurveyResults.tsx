import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { SurveySummary, SurveyQuestionType } from '../../types';
import { BarChart, DonutChart } from './Charts';
import { Icon } from '../icons';

interface SurveyResultsProps {
    surveyId: string;
}

export const SurveyResults: React.FC<SurveyResultsProps> = ({ surveyId }) => {
    const [data, setData] = useState<SurveySummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api.getSurveyResults(surveyId);
                setData(result);
            } catch (error) {
                console.error("Failed to load survey results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [surveyId]);

    if (loading) return <div className="text-center p-8">Loading results...</div>;
    if (!data) return <div className="text-center p-8">No results available.</div>;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-8 border-b dark:border-gray-700 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400">Feedback Report</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-primary-dark dark:text-primary">{data.totalRespondents}</p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Respondents</p>
                </div>
            </div>

            <div className="space-y-12">
                {data.results.map((q, index) => (
                    <div key={q.questionId} className="border-b dark:border-gray-700 pb-8 last:border-0">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4 flex items-start gap-2">
                            <span className="text-gray-400 text-sm mt-1">{index + 1}.</span> 
                            {q.questionText}
                        </h3>

                        {q.type === SurveyQuestionType.Rating && q.ratingDistribution && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-4xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                                        {q.averageRating} <Icon name="Star" className="h-8 w-8 fill-current" />
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Average Rating</p>
                                </div>
                                <div className="md:col-span-2 h-48">
                                    <BarChart 
                                        data={[
                                            { label: '1 Star', value: q.ratingDistribution[1] },
                                            { label: '2 Stars', value: q.ratingDistribution[2] },
                                            { label: '3 Stars', value: q.ratingDistribution[3] },
                                            { label: '4 Stars', value: q.ratingDistribution[4] },
                                            { label: '5 Stars', value: q.ratingDistribution[5] },
                                        ]} 
                                        height={180}
                                    />
                                </div>
                            </div>
                        )}

                        {q.type === SurveyQuestionType.YesNo && q.yesNoDistribution && (
                            <div className="flex justify-center h-48">
                                <DonutChart 
                                    data={[
                                        { label: 'Yes', value: q.yesNoDistribution.yes, color: '#10B981' },
                                        { label: 'No', value: q.yesNoDistribution.no, color: '#EF4444' },
                                    ]}
                                    height={180}
                                />
                            </div>
                        )}

                        {q.type === SurveyQuestionType.OpenEnded && q.textResponses && (
                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                                {q.textResponses.length > 0 ? (
                                    q.textResponses.map((response, i) => (
                                        <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-600 shadow-sm text-gray-700 dark:text-gray-300 text-sm">
                                            "{response}"
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No text responses yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};