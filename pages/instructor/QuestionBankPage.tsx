import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Question, QuestionType, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, MultipleSelectQuestion, FillBlankQuestion } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';

type FormData = Omit<Question, 'id' | 'instructorId'>;

// Fix: Removed explicit FormData return type to allow for correct type inference of the returned object literal union.
const getEmptyQuestion = (type: QuestionType) => {
    switch (type) {
        case QuestionType.TrueFalse:
            return { type, stem: '', correctAnswer: true };
        case QuestionType.ShortAnswer:
            return { type, stem: '', acceptableAnswers: [''] };
        case QuestionType.MultipleSelect:
            return { type, stem: '', options: ['', ''], correctAnswerIndices: [] };
        case QuestionType.FillBlank:
            return { type, stem: '', acceptableAnswers: [''] };
        case QuestionType.MultipleChoice:
        default:
            return { type: QuestionType.MultipleChoice, stem: '', options: ['', ''], correctAnswerIndex: 0 };
    }
};

const QuestionBankPage: React.FC = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [formData, setFormData] = useState<FormData>(getEmptyQuestion(QuestionType.MultipleChoice));

    useEffect(() => {
        if (!user) return;
        const fetchQuestions = async () => {
            try {
                const data = await api.getQuestions(user.id);
                setQuestions(data);
            } catch (error) {
                console.error("Failed to fetch questions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [user]);

    const handleOpenModal = (question: Question | null = null) => {
        if (question) {
            setSelectedQuestion(question);
            setFormData(question);
        } else {
            setSelectedQuestion(null);
            setFormData(getEmptyQuestion(QuestionType.MultipleChoice));
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedQuestion(null);
        setFormData(getEmptyQuestion(QuestionType.MultipleChoice));
    };
    
    const handleSave = async () => {
        if (!formData.stem.trim() || !user) {
            alert('Question text cannot be empty.');
            return;
        }
        // Add more specific validation per type if needed
        
        try {
            if (selectedQuestion) {
                const updated = await api.updateQuestion(selectedQuestion.id, formData);
                if (updated) {
                    setQuestions(questions.map(q => q.id === updated.id ? updated : q));
                }
            } else {
                const created = await api.createQuestion({ ...formData, instructorId: user.id });
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

    const renderFormFields = () => {
        switch (formData.type) {
            // FIX: Use 'in' operator as a type guard to allow TypeScript to correctly narrow the formData type.
            case QuestionType.MultipleChoice: {
                if ('options' in formData) {
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                        <div className="space-y-2">
                            {formData.options.map((opt, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input type="radio" name="correctAnswer" checked={formData.correctAnswerIndex === index} onChange={() => setFormData({ ...formData, correctAnswerIndex: index })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                                    <input type="text" value={opt} onChange={e => {
                                        const newOptions = [...formData.options];
                                        newOptions[index] = e.target.value;
                                        setFormData({ ...formData, options: newOptions });
                                    }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder={`Option ${index + 1}`} />
                                     <button type="button" onClick={() => {
                                         if (formData.options.length > 2) {
                                            const newOptions = formData.options.filter((_, i) => i !== index);
                                            setFormData({ ...formData, options: newOptions, correctAnswerIndex: 0 });
                                         }
                                     }} className="text-gray-400 hover:text-red-600" disabled={formData.options.length <= 2}>
                                         <Icon name="X" className="h-4 w-4" />
                                     </button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={() => setFormData({ ...formData, options: [...formData.options, ''] })} className="mt-2 text-sm text-secondary hover:underline">
                            + Add Option
                        </button>
                    </div>
                );
                }
                return null;
            }
            // FIX: Use 'in' operator as a type guard to allow TypeScript to correctly narrow the formData type.
            case QuestionType.TrueFalse: {
                if ('correctAnswer' in formData) {
                return (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center"><input type="radio" name="tfAnswer" checked={formData.correctAnswer === true} onChange={() => setFormData({ ...formData, correctAnswer: true })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" /> <span className="ml-2">True</span></label>
                            <label className="flex items-center"><input type="radio" name="tfAnswer" checked={formData.correctAnswer === false} onChange={() => setFormData({ ...formData, correctAnswer: false })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" /> <span className="ml-2">False</span></label>
                        </div>
                    </div>
                );
                }
                return null;
            }
            // FIX: Use 'in' operator as a type guard to allow TypeScript to correctly narrow the formData type.
             case QuestionType.ShortAnswer: {
                if ('acceptableAnswers' in formData) {
                 return (
                     <div>
                        <label htmlFor="acceptableAnswers" className="block text-sm font-medium text-gray-700 mb-1">Acceptable Answer(s)</label>
                        <input type="text" id="acceptableAnswers" value={formData.acceptableAnswers.join(',')} onChange={(e) => setFormData({ ...formData, acceptableAnswers: e.target.value.split(',').map(s => s.trim()) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                         <p className="text-xs text-gray-500 mt-1">Separate multiple correct answers with a comma. For manually graded essays, this can be left blank.</p>
                    </div>
                 );
                }
                return null;
            }
            // FIX: Use 'in' operator as a type guard to allow TypeScript to correctly narrow the formData type.
            case QuestionType.MultipleSelect: {
                if ('correctAnswerIndices' in formData) {
                const handleCorrectAnswerChange = (index: number) => {
                    const newIndices = new Set(formData.correctAnswerIndices);
                    if (newIndices.has(index)) {
                        newIndices.delete(index);
                    } else {
                        newIndices.add(index);
                    }
                    setFormData({ ...formData, correctAnswerIndices: Array.from(newIndices) });
                };
                 return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Options (select all correct answers)</label>
                        <div className="space-y-2">
                            {formData.options.map((opt, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input type="checkbox" checked={formData.correctAnswerIndices.includes(index)} onChange={() => handleCorrectAnswerChange(index)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                    <input type="text" value={opt} onChange={e => {
                                        const newOptions = [...formData.options];
                                        newOptions[index] = e.target.value;
                                        setFormData({ ...formData, options: newOptions });
                                    }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder={`Option ${index + 1}`} />
                                     <button type="button" onClick={() => {
                                         if (formData.options.length > 2) {
                                            const newOptions = formData.options.filter((_, i) => i !== index);
                                            const newIndices = formData.correctAnswerIndices.filter(i => i !== index);
                                            setFormData({ ...formData, options: newOptions, correctAnswerIndices: newIndices });
                                         }
                                     }} className="text-gray-400 hover:text-red-600" disabled={formData.options.length <= 2}>
                                         <Icon name="X" className="h-4 w-4" />
                                     </button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={() => setFormData({ ...formData, options: [...formData.options, ''] })} className="mt-2 text-sm text-secondary hover:underline">
                            + Add Option
                        </button>
                    </div>
                );
                }
                return null;
            }
            // FIX: Use 'in' operator as a type guard to allow TypeScript to correctly narrow the formData type.
            case QuestionType.FillBlank: {
                if ('acceptableAnswers' in formData) {
                return (
                     <div>
                        <label htmlFor="acceptableAnswersFB" className="block text-sm font-medium text-gray-700 mb-1">Acceptable Answer(s)</label>
                        <input type="text" id="acceptableAnswersFB" value={formData.acceptableAnswers.join(',')} onChange={(e) => setFormData({ ...formData, acceptableAnswers: e.target.value.split(',').map(s => s.trim()) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                         <p className="text-xs text-gray-500 mt-1">Separate multiple correct answers with a comma. Case-insensitive.</p>
                         <p className="text-xs text-gray-500 mt-1">Use three underscores `___` in the question text to indicate the blank.</p>
                    </div>
                );
                }
                return null;
            }
            default: return null;
        }
    };


    if (loading) return <div>Loading question bank...</div>;

    return (
        <div>
            <PageHeader title="Question Bank" subtitle="Create, manage, and reuse questions for your quizzes and exams." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="FileText" className="h-5 w-5 mr-2" />
                        Add Question
                    </button>
                </div>

                <div className="space-y-4">
                    {questions.length > 0 ? questions.map((q, index) => (
                        <div key={q.id} className="p-4 border rounded-md bg-gray-50">
                             <div className="flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <p className="font-semibold text-gray-800">{index + 1}. {q.stem}</p>
                                    <span className="text-xs font-semibold uppercase text-gray-400">{q.type.replace('-', ' ')}</span>
                                </div>
                                <div className="flex-shrink-0 space-x-4">
                                    <button onClick={() => handleOpenModal(q)} className="text-secondary hover:text-secondary-dark font-medium text-sm">Edit</button>
                                    <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                                </div>
                            </div>
                           {renderQuestionDetails(q)}
                        </div>
                    )) : (
                        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
                            <Icon name="FileText" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Your Question Bank is Empty</h3>
                            <p className="mt-1 text-sm text-gray-500">Click "Add Question" to start building your assessment library.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedQuestion ? 'Edit Question' : 'Add New Question'}>
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                    {!selectedQuestion && (
                         <div>
                            <label htmlFor="question-type" className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                            <select id="question-type" value={formData.type} onChange={e => setFormData(getEmptyQuestion(e.target.value as QuestionType))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                                <option value={QuestionType.MultipleChoice}>Multiple Choice</option>
                                <option value={QuestionType.MultipleSelect}>Multiple Select</option>
                                <option value={QuestionType.TrueFalse}>True / False</option>
                                <option value={QuestionType.ShortAnswer}>Short Answer (Manual Grade)</option>
                                <option value={QuestionType.FillBlank}>Fill in the Blank</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="stem" className="block text-sm font-medium text-gray-700 mb-1">Question Text (Stem)</label>
                        <textarea id="stem" value={formData.stem} onChange={e => setFormData(prev => ({ ...prev, stem: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    {renderFormFields()}
                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Save Question</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default QuestionBankPage;