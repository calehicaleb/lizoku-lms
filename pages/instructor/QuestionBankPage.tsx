import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Question, QuestionType, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, MultipleSelectQuestion, FillBlankQuestion, QuestionDifficulty, Course, Module, MediaItem, MediaType } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import { MediaLibrary } from '../../components/common/MediaLibrary';

// A helper type that replaces `topics: string[]` with `topics: string` for form handling
type WithStringTopics<T> = Omit<T, 'topics'> & { topics: string };

// The FormData will be one of the question types, but with topics as a string
type QuestionFormData = WithStringTopics<
    | Omit<MultipleChoiceQuestion, 'id' | 'instructorId'>
    | Omit<TrueFalseQuestion, 'id' | 'instructorId'>
    | Omit<ShortAnswerQuestion, 'id' | 'instructorId'>
    | Omit<MultipleSelectQuestion, 'id' | 'instructorId'>
    | Omit<FillBlankQuestion, 'id' | 'instructorId'>
>;


const getEmptyQuestion = (type: QuestionType): QuestionFormData => {
    const base = {
        stem: '',
        difficulty: QuestionDifficulty.Easy,
        topics: '', // Form uses a string, converted on save
        courseId: undefined,
        moduleId: undefined,
        isPublic: false,
        imageUrl: undefined,
    };

    switch (type) {
        // FIX: Explicitly type the returned object for each case to help TypeScript
        // correctly resolve the discriminated union and prevent "unknown property" errors.
        case QuestionType.TrueFalse: {
            const question: WithStringTopics<Omit<TrueFalseQuestion, 'id' | 'instructorId'>> = { type: QuestionType.TrueFalse, correctAnswer: true, ...base };
            return question;
        }
        case QuestionType.ShortAnswer: {
            const question: WithStringTopics<Omit<ShortAnswerQuestion, 'id' | 'instructorId'>> = { type: QuestionType.ShortAnswer, acceptableAnswers: [''], ...base };
            return question;
        }
        case QuestionType.MultipleSelect: {
            const question: WithStringTopics<Omit<MultipleSelectQuestion, 'id' | 'instructorId'>> = { type: QuestionType.MultipleSelect, options: ['', ''], correctAnswerIndices: [], ...base };
            return question;
        }
        case QuestionType.FillBlank: {
            const question: WithStringTopics<Omit<FillBlankQuestion, 'id' | 'instructorId'>> = { type: QuestionType.FillBlank, acceptableAnswers: [''], ...base };
            return question;
        }
        case QuestionType.MultipleChoice:
        default: {
            const question: WithStringTopics<Omit<MultipleChoiceQuestion, 'id' | 'instructorId'>> = { type: QuestionType.MultipleChoice, options: ['', ''], correctAnswerIndex: 0, ...base };
            return question;
        }
    }
};

const QuestionBankPage: React.FC = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [publicQuestions, setPublicQuestions] = useState<(Question & { instructorName: string })[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [formData, setFormData] = useState<QuestionFormData>(getEmptyQuestion(QuestionType.MultipleChoice));
    const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<QuestionDifficulty | 'all'>('all');
    const [topicFilter, setTopicFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState<string | 'all'>('all');
    
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchQuestions = async () => {
            try {
                const [myQuestionsData, publicQuestionsData, coursesData] = await Promise.all([
                    api.getQuestions(user.id),
                    api.getPublicQuestionsFromOthers(user.id),
                    api.getInstructorCourses(user.id)
                ]);
                setQuestions(myQuestionsData);
                setPublicQuestions(publicQuestionsData);
                setCourses(coursesData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [user]);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = q.stem.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
            const matchesCourse = courseFilter === 'all' || q.courseId === courseFilter;
            const matchesTopic = !topicFilter.trim() || q.topics.some(t => t.toLowerCase().includes(topicFilter.toLowerCase().trim()));
            return matchesSearch && matchesDifficulty && matchesCourse && matchesTopic;
        });
    }, [questions, searchTerm, difficultyFilter, topicFilter, courseFilter]);
    
    const filteredPublicQuestions = useMemo(() => {
        return publicQuestions.filter(q => {
            const matchesSearch = q.stem.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
            const matchesCourse = courseFilter === 'all' || q.courseId === courseFilter;
            const matchesTopic = !topicFilter.trim() || q.topics.some(t => t.toLowerCase().includes(topicFilter.toLowerCase().trim()));
            return matchesSearch && matchesDifficulty && matchesCourse && matchesTopic;
        });
    }, [publicQuestions, searchTerm, difficultyFilter, topicFilter, courseFilter]);

    const handleOpenModal = (question: Question | null = null) => {
        if (question) {
            setSelectedQuestion(question);
            const formReadyQuestion: QuestionFormData = {
                ...question,
                topics: question.topics.join(', '), // Convert array to string for input
            };
            setFormData(formReadyQuestion);
        } else {
            setSelectedQuestion(null);
            const emptyQ = getEmptyQuestion(QuestionType.MultipleChoice);
            setFormData({
                ...emptyQ,
                courseId: courses.length > 0 ? courses[0].id : undefined,
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleSave = async () => {
        if (!formData.stem.trim() || !user) {
            alert('Question text cannot be empty.');
            return;
        }

        const finalFormData = {
            ...formData,
            topics: formData.topics.split(',').map((t: string) => t.trim()).filter(Boolean),
        };
        
        try {
            if (selectedQuestion) {
                const updated = await api.updateQuestion(selectedQuestion.id, finalFormData as Omit<Question, 'id'|'instructorId'>);
                if (updated) {
                    setQuestions(questions.map(q => q.id === updated.id ? updated : q));
                }
            } else {
                const created = await api.createQuestion({ ...finalFormData, instructorId: user.id });
                setQuestions([created, ...questions]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save question", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this question? It will be removed from any quizzes using it.')) {
            const result = await api.deleteQuestion(id);
            if (result.success) {
                setQuestions(questions.filter(q => q.id !== id));
            } else {
                alert('Failed to delete question.');
            }
        }
    };

    const handleImageSelect = (item: MediaItem) => {
        if (item.type === MediaType.Image) {
            setFormData(prev => ({ ...prev, imageUrl: item.url }));
            setIsMediaLibraryOpen(false);
        } else {
            alert('Please select an image file.');
        }
    };

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

    const renderFormFields = () => {
        const currentData = formData;
        switch (currentData.type) {
            case QuestionType.MultipleChoice:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Options</label>
                        <div className="space-y-2">
                            {/* FIX: Cast `currentData` to `any` before spreading to avoid discriminated union update errors. */}
                            {(currentData as any).options.map((opt: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input type="radio" name="correctAnswer" checked={(currentData as any).correctAnswerIndex === index} onChange={() => setFormData({ ...(currentData as any), correctAnswerIndex: index })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                                    <input type="text" value={opt} onChange={e => {
                                        const newOptions = [...(currentData as any).options];
                                        newOptions[index] = e.target.value;
                                        setFormData({ ...(currentData as any), options: newOptions });
                                    }} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder={`Option ${index + 1}`} />
                                     <button type="button" onClick={() => {
                                         if ((currentData as any).options.length > 2) {
                                            const newOptions = (currentData as any).options.filter((_: any, i: number) => i !== index);
                                            setFormData({ ...(currentData as any), options: newOptions, correctAnswerIndex: 0 });
                                         }
                                     }} className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500" disabled={(currentData as any).options.length <= 2}>
                                         <Icon name="X" className="h-4 w-4" />
                                     </button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={() => setFormData({ ...(currentData as any), options: [...(currentData as any).options, ''] })} className="mt-2 text-sm text-secondary dark:text-blue-400 hover:underline">
                            + Add Option
                        </button>
                    </div>
                );
            case QuestionType.TrueFalse:
                return (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct Answer</label>
                        <div className="flex space-x-4">
                            {/* FIX: Cast `currentData` to `any` before spreading to avoid discriminated union update errors. */}
                            <label className="flex items-center"><input type="radio" name="tfAnswer" checked={(currentData as any).correctAnswer === true} onChange={() => setFormData({ ...(currentData as any), correctAnswer: true })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" /> <span className="ml-2">True</span></label>
                            <label className="flex items-center"><input type="radio" name="tfAnswer" checked={(currentData as any).correctAnswer === false} onChange={() => setFormData({ ...(currentData as any), correctAnswer: false })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" /> <span className="ml-2">False</span></label>
                        </div>
                    </div>
                );
             case QuestionType.ShortAnswer:
                 return (
                     <div>
                        <label htmlFor="acceptableAnswers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acceptable Answer(s)</label>
                        {/* FIX: Cast `currentData` to `any` before spreading to avoid discriminated union update errors. */}
                        <input type="text" id="acceptableAnswers" value={(currentData as any).acceptableAnswers.join(',')} onChange={(e) => setFormData({ ...(currentData as any), acceptableAnswers: e.target.value.split(',').map(s => s.trim()) })} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple correct answers with a comma. For manually graded essays, this can be left blank.</p>
                    </div>
                 );
            case QuestionType.MultipleSelect:
                const handleCorrectAnswerChange = (index: number) => {
                    {/* FIX: Cast `currentData` to `any` before spreading to avoid discriminated union update errors. */}
                    const newIndices = new Set((currentData as any).correctAnswerIndices);
                    if (newIndices.has(index)) {
                        newIndices.delete(index);
                    } else {
                        newIndices.add(index);
                    }
                    setFormData({ ...(currentData as any), correctAnswerIndices: Array.from(newIndices) });
                };
                 return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Options (select all correct answers)</label>
                        <div className="space-y-2">
                            {/* FIX: Cast `currentData` to `any` before spreading to avoid discriminated union update errors. */}
                            {(currentData as any).options.map((opt: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input type="checkbox" checked={(currentData as any).correctAnswerIndices.includes(index)} onChange={() => handleCorrectAnswerChange(index)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                    <input type="text" value={opt} onChange={e => {
                                        const newOptions = [...(currentData as any).options];
                                        newOptions[index] = e.target.value;
                                        setFormData({ ...(currentData as any), options: newOptions });
                                    }} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder={`Option ${index + 1}`} />
                                     <button type="button" onClick={() => {
                                         if ((currentData as any).options.length > 2) {
                                            const newOptions = (currentData as any).options.filter((_: any, i: number) => i !== index);
                                            const newIndices = (currentData as any).correctAnswerIndices.filter((i: number) => i !== index);
                                            setFormData({ ...(currentData as any), options: newOptions, correctAnswerIndices: newIndices });
                                         }
                                     }} className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500" disabled={(currentData as any).options.length <= 2}>
                                         <Icon name="X" className="h-4 w-4" />
                                     </button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={() => setFormData({ ...(currentData as any), options: [...(currentData as any).options, ''] })} className="mt-2 text-sm text-secondary dark:text-blue-400 hover:underline">
                            + Add Option
                        </button>
                    </div>
                );
            case QuestionType.FillBlank:
                return (
                     <div>
                        <label htmlFor="acceptableAnswersFB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acceptable Answer(s)</label>
                        {/* FIX: Cast `currentData` to `any` before spreading to avoid discriminated union update errors. */}
                        <input type="text" id="acceptableAnswersFB" value={(currentData as any).acceptableAnswers.join(',')} onChange={(e) => setFormData({ ...(currentData as any), acceptableAnswers: e.target.value.split(',').map(s => s.trim()) })} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple correct answers with a comma. Case-insensitive.</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use three underscores `___` in the question text to indicate the blank.</p>
                    </div>
                );
            default: return null;
        }
    };


    if (loading) return <div>Loading question bank...</div>;

    const QuestionList = ({ items }: { items: (Question | (Question & { instructorName: string }))[] }) => (
        items.length > 0 ? items.map((q) => (
            <div key={q.id} className="p-4 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4 flex items-start">
                        {/* FIX: Replaced the `title` prop on the `Icon` component with a wrapping `<span>` that has a `title` attribute. This achieves the desired tooltip effect without causing a type error, as the custom `Icon` component does not define a `title` prop. */}
                        {activeTab === 'my' && <span title={q.isPublic ? 'Public' : 'Private'}><Icon name={q.isPublic ? 'Globe' : 'Lock'} className={`h-5 w-5 mr-3 mt-1 flex-shrink-0 ${q.isPublic ? 'text-blue-500' : 'text-gray-400'}`} /></span>}
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{q.stem}</p>
                            {q.imageUrl && (
                                <div className="mt-2">
                                    <img src={q.imageUrl} alt="Question attachment" className="max-h-32 w-auto rounded-md border dark:border-gray-600 object-contain" />
                                </div>
                            )}
                             <div className="text-xs mt-1">
                                <span className="font-semibold uppercase text-gray-400 dark:text-gray-500">{q.type.replace('-', ' ')}</span>
                                {activeTab === 'public' && 'instructorName' in q && (
                                    <>
                                        <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                                        <span className="text-gray-500 dark:text-gray-400">Author: <span className="font-medium text-secondary dark:text-blue-400">{q.instructorName}</span></span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {activeTab === 'my' && (
                        <div className="flex-shrink-0 space-x-4">
                            <button onClick={() => handleOpenModal(q)} className="text-secondary dark:text-blue-400 hover:text-secondary-dark dark:hover:text-blue-300 font-medium text-sm">Edit</button>
                            <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                        </div>
                    )}
                </div>
               <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 pl-8">{renderQuestionDetails(q)}</div>
               <div className="mt-3 flex items-center gap-2 flex-wrap pl-8">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getDifficultyStyles(q.difficulty)}`}>{q.difficulty}</span>
                    {q.courseId && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300"><Icon name="Book" className="inline h-3 w-3 mr-1" /> {courses.find(c=>c.id === q.courseId)?.title || '...'}</span>}
                    {q.topics.map(topic => ( <span key={topic} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">{topic}</span> ))}
                </div>
            </div>
        )) : (
            <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed dark:border-gray-700">
                <Icon name={activeTab === 'my' ? "FileText" : "Globe"} className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Questions Found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {activeTab === 'my' 
                        ? 'Try adjusting your filters or click "Add Question" to start building your library.'
                        : 'No other instructors have shared questions publicly yet, or none match your filters.'
                    }
                </p>
            </div>
        )
    );

    return (
        <div>
            <PageHeader title="Question Bank" subtitle="Create, manage, and reuse questions for your quizzes and exams." />
            
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'my' ? 'border-primary text-secondary dark:text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        My Questions
                    </button>
                    <button
                        onClick={() => setActiveTab('public')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'public' ? 'border-primary text-secondary dark:text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        Public Bank
                    </button>
                </nav>
            </div>


            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input type="text" placeholder="Search question text..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="lg:col-span-2 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value as any)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                        <option value="all">All Difficulties</option>
                        {Object.values(QuestionDifficulty).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input type="text" placeholder="Filter by topic..." value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="lg:col-span-4 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                {activeTab === 'my' && (
                    <div className="flex justify-end mb-4">
                        <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                            <Icon name="FileText" className="h-5 w-5 mr-2" />
                            Add Question
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {activeTab === 'my' && <QuestionList items={filteredQuestions} />}
                    {activeTab === 'public' && <QuestionList items={filteredPublicQuestions} />}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedQuestion ? 'Edit Question' : 'Add New Question'}>
                <form className="space-y-4 max-h-[70vh] overflow-y-auto pr-2" onSubmit={e => e.preventDefault()}>
                    {!selectedQuestion && (
                         <div>
                            <label htmlFor="question-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Type</label>
                            <select id="question-type" value={formData.type} onChange={e => setFormData(getEmptyQuestion(e.target.value as QuestionType))} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                                <option value={QuestionType.MultipleChoice}>Multiple Choice</option>
                                <option value={QuestionType.MultipleSelect}>Multiple Select</option>
                                <option value={QuestionType.TrueFalse}>True / False</option>
                                <option value={QuestionType.ShortAnswer}>Short Answer</option>
                                <option value={QuestionType.FillBlank}>Fill in the Blank</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="stem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text (Stem)</label>
                        <textarea id="stem" value={formData.stem} onChange={e => setFormData(prev => ({ ...prev, stem: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Optional Image</label>
                        {formData.imageUrl && (
                            <div className="mb-2 relative w-fit">
                                <img src={formData.imageUrl} alt="Question preview" className="max-h-40 w-auto rounded-md border dark:border-gray-600" />
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrl: undefined }))} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75 focus:outline-none ring-2 ring-white">
                                    <Icon name="X" className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                         <button type="button" onClick={() => setIsMediaLibraryOpen(true)} className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <Icon name="BookOpen" className="h-4 w-4 mr-2" /> Choose from Library
                        </button>
                    </div>

                    {renderFormFields()}

                    <div className="border-t dark:border-gray-700 pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                                <select id="difficulty" value={formData.difficulty} onChange={e => setFormData(prev => ({...prev, difficulty: e.target.value as QuestionDifficulty}))} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md capitalize">
                                    {Object.values(QuestionDifficulty).map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="topics" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topics</label>
                                <input type="text" id="topics" value={formData.topics} onChange={e => setFormData(prev => ({...prev, topics: e.target.value}))} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., syntax, loops" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated list of topics.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course (Optional)</label>
                                <select id="courseId" value={formData.courseId || ''} onChange={e => setFormData(prev => ({...prev, courseId: e.target.value, moduleId: ''}))} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    <option value="">None</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module (Optional)</label>
                                <select id="moduleId" value={formData.moduleId || ''} onChange={e => setFormData(prev => ({...prev, moduleId: e.target.value}))} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" disabled={!formData.courseId}>
                                    <option value="">None</option>
                                    {courses.find(c => c.id === formData.courseId)?.modules?.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                </select>
                            </div>
                        </div>
                         <div className="pt-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={formData.isPublic ?? false}
                                    onChange={e => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-500 rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Share this question publicly with other instructors</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Save Question</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isMediaLibraryOpen} onClose={() => setIsMediaLibraryOpen(false)} title="Select Image from Library">
                <div className="h-[60vh]">
                    <MediaLibrary onSelectItem={handleImageSelect} filterByType={MediaType.Image} />
                </div>
            </Modal>
        </div>
    );
};

export default QuestionBankPage;