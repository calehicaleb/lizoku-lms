import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Question, QuestionType, User, Course, QuestionDifficulty } from '../../types';
import { Icon } from '../../components/icons';

type AdminQuestion = Question & { instructorName: string };

const AdminQuestionBankPage: React.FC = () => {
    const [questions, setQuestions] = useState<AdminQuestion[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
    const [instructorFilter, setInstructorFilter] = useState<string | 'all'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<QuestionDifficulty | 'all'>('all');
    const [topicFilter, setTopicFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState<string | 'all'>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [questionsData, instructorsData, coursesData] = await Promise.all([
                    api.getAllQuestionsForAdmin(),
                    api.getAllInstructors(),
                    api.getAllCourses(),
                ]);
                setQuestions(questionsData);
                setInstructors(instructorsData);
                setCourses(coursesData);
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
            const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
            const matchesCourse = courseFilter === 'all' || q.courseId === courseFilter;
            const matchesTopic = !topicFilter.trim() || (q.topics && q.topics.some(t => t.toLowerCase().includes(topicFilter.toLowerCase().trim())));
            return matchesSearch && matchesType && matchesInstructor && matchesDifficulty && matchesCourse && matchesTopic;
        });
    }, [questions, searchTerm, typeFilter, instructorFilter, difficultyFilter, topicFilter, courseFilter]);

    const getDifficultyStyles = (difficulty: QuestionDifficulty) => {
        switch(difficulty) {
            case QuestionDifficulty.Easy: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case QuestionDifficulty.Medium: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case QuestionDifficulty.Hard: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    const renderQuestionDetails = (q: Question) => {
        switch (q.type) {
            case QuestionType.MultipleChoice:
                return q.options.map((opt, i) => (
                    <div key={i} className={`flex items-center ${i === q.correctAnswerIndex ? 'font-bold text-green-700 dark:text-green-400' : ''}`}>
                        <Icon name={i === q.correctAnswerIndex ? 'CheckCircle' : 'ChevronDown'} className={`h-4 w-4 mr-2 flex-shrink-0 ${i === q.correctAnswerIndex ? '' : 'rotate-[-90deg] opacity-50'}`} />{opt}
                    </div>
                ));
            case QuestionType.TrueFalse: return <p className="text-green-700 dark:text-green-400 font-bold">Correct Answer: {q.correctAnswer ? 'True' : 'False'}</p>;
            case QuestionType.ShortAnswer: return <p className="text-green-700 dark:text-green-400 font-bold">Acceptable Answer(s): {q.acceptableAnswers.join(', ')}</p>;
            case QuestionType.MultipleSelect:
                return q.options.map((opt, i) => (
                    <div key={i} className={`flex items-center ${q.correctAnswerIndices.includes(i) ? 'font-bold text-green-700 dark:text-green-400' : ''}`}>
                        <Icon name={q.correctAnswerIndices.includes(i) ? 'CheckCircle' : 'ChevronDown'} className={`h-4 w-4 mr-2 flex-shrink-0 ${q.correctAnswerIndices.includes(i) ? '' : 'rotate-[-90deg] opacity-50'}`} />{opt}
                    </div>
                ));
            case QuestionType.FillBlank: return <p className="text-green-700 dark:text-green-400 font-bold">Acceptable Answer(s): {q.acceptableAnswers.join(', ')}</p>;
            default: return null;
        }
    };

    if (loading) return <div>Loading question bank...</div>;

    return (
        <div>
            <PageHeader title="System Question Bank" subtitle="View and audit all questions created by instructors." />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <input type="text" placeholder="Search question text..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="lg:col-span-3 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                        <option value="all">All Question Types</option>
                        {Object.values(QuestionType).map(type => (<option key={type} value={type}>{type.replace('-', ' ')}</option>))}
                    </select>
                    <select value={instructorFilter} onChange={e => setInstructorFilter(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Instructors</option>
                        {instructors.map(inst => (<option key={inst.id} value={inst.id}>{inst.name}</option>))}
                    </select>
                    <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value as any)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                        <option value="all">All Difficulties</option>
                        {Object.values(QuestionDifficulty).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                     <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input type="text" placeholder="Filter by topic..." value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="lg:col-span-2 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div className="space-y-4">
                    {filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
                        <div key={q.id} className="p-4 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                             <div className="flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{q.stem}</p>
                                    <div className="text-xs mt-1">
                                        <span className="font-semibold uppercase text-gray-400 dark:text-gray-500">{q.type.replace('-', ' ')}</span>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="text-gray-500 dark:text-gray-400">Created by: <span className="font-medium text-secondary dark:text-blue-400">{q.instructorName}</span></span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 space-x-4">
                                    <button className="text-gray-400 dark:text-gray-500 cursor-not-allowed font-medium text-sm">View Details</button>
                                </div>
                            </div>
                           <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 pl-4">{renderQuestionDetails(q)}</div>
                           <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getDifficultyStyles(q.difficulty)}`}>{q.difficulty}</span>
                                {q.courseId && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300"><Icon name="Book" className="inline h-3 w-3 mr-1" /> {courses.find(c=>c.id === q.courseId)?.title || '...'}</span>}
                                {q.topics.map(topic => ( <span key={topic} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">{topic}</span> ))}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed dark:border-gray-700">
                            <Icon name="Search" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Questions Found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No questions match your current filters, or no questions have been created in the system yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminQuestionBankPage;
