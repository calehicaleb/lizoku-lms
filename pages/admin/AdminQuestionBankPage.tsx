import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Question, QuestionType, User } from '../../types';
import { Icon } from '../../components/icons';

type AdminQuestion = Question & { instructorName: string };

const AdminQuestionBankPage: React.FC = () => {
    const [questions, setQuestions] = useState<AdminQuestion[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
    const [instructorFilter, setInstructorFilter] = useState<string | 'all'>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [questionsData, instructorsData] = await Promise.all([
                    api.getAllQuestionsForAdmin(),
                    api.getAllInstructors(),
                ]);
                setQuestions(questionsData);
                setInstructors(instructorsData);
            } catch (error) {
                console.error("Failed to fetch data for question bank", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = q.stem.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || q.type === typeFilter;
            const matchesInstructor = instructorFilter === 'all' || q.instructorId === instructorFilter;
            return matchesSearch && matchesType && matchesInstructor;
        });
    }, [questions, searchTerm, typeFilter, instructorFilter]);

    const renderQuestionDetails = (q: Question) => {
        switch (q.type) {
            case QuestionType.MultipleChoice:
                return (
                    <div className="mt-2 text-sm text-gray-600 pl-4">
                        {q.options.map((opt, i) => (
                            <div key={i} className={`flex items-center ${i === q.correctAnswerIndex ? 'font-bold text-green-700' : ''}`}>
                                <Icon name={i === q.correctAnswerIndex ? 'CheckCircle' : 'ChevronDown'} className={`h-4 w-4 mr-2 flex-shrink-0 ${i === q.correctAnswerIndex ? '' : 'rotate-[-90deg] opacity-50'}`} />
                                {opt}
                            </div>
                        ))}
                    </div>
                );
            case QuestionType.TrueFalse:
                return <p className="mt-2 text-sm text-green-700 pl-4 font-bold">Correct Answer: {q.correctAnswer ? 'True' : 'False'}</p>;
            case QuestionType.ShortAnswer:
                return <p className="mt-2 text-sm text-green-700 pl-4 font-bold">Acceptable Answer(s): {q.acceptableAnswers.join(', ')}</p>;
            case QuestionType.MultipleSelect:
                return (
                     <div className="mt-2 text-sm text-gray-600 pl-4">
                        {q.options.map((opt, i) => (
                            <div key={i} className={`flex items-center ${q.correctAnswerIndices.includes(i) ? 'font-bold text-green-700' : ''}`}>
                                <Icon name={q.correctAnswerIndices.includes(i) ? 'CheckCircle' : 'ChevronDown'} className={`h-4 w-4 mr-2 flex-shrink-0 ${q.correctAnswerIndices.includes(i) ? '' : 'rotate-[-90deg] opacity-50'}`} />
                                {opt}
                            </div>
                        ))}
                    </div>
                );
            case QuestionType.FillBlank:
                 return <p className="mt-2 text-sm text-green-700 pl-4 font-bold">Acceptable Answer(s): {q.acceptableAnswers.join(', ')}</p>;
            default:
                return null;
        }
    };

    if (loading) return <div>Loading question bank...</div>;

    return (
        <div>
            <PageHeader title="System Question Bank" subtitle="View and audit all questions created by instructors." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search question text..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="md:col-span-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                    >
                        <option value="all">All Question Types</option>
                        {Object.values(QuestionType).map(type => (
                            <option key={type} value={type}>{type.replace('-', ' ')}</option>
                        ))}
                    </select>
                    <select
                        value={instructorFilter}
                        onChange={e => setInstructorFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Instructors</option>
                        {instructors.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    {filteredQuestions.length > 0 ? filteredQuestions.map((q, index) => (
                        <div key={q.id} className="p-4 border rounded-md bg-gray-50">
                             <div className="flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <p className="font-semibold text-gray-800">{index + 1}. {q.stem}</p>
                                    <div className="text-xs mt-1">
                                        <span className="font-semibold uppercase text-gray-400">{q.type.replace('-', ' ')}</span>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="text-gray-500">Created by: <span className="font-medium text-secondary">{q.instructorName}</span></span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 space-x-4">
                                    {/* Admin view is read-only for now */}
                                    <button className="text-gray-400 cursor-not-allowed font-medium text-sm">Edit</button>
                                </div>
                            </div>
                           {renderQuestionDetails(q)}
                        </div>
                    )) : (
                        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
                            <Icon name="Search" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Questions Found</h3>
                            <p className="mt-1 text-sm text-gray-500">No questions match your current filters, or no questions have been created in the system yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminQuestionBankPage;
