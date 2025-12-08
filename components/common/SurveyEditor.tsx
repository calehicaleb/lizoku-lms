
import React, { useState } from 'react';
import { ContentItem, ContentType, SurveyQuestion, SurveyQuestionType } from '../../types';
import { Icon } from '../icons';

interface SurveyEditorProps {
    initialItem?: ContentItem;
    onSave: (item: Omit<ContentItem, 'id'>) => void;
    onCancel: () => void;
}

export const SurveyEditor: React.FC<SurveyEditorProps> = ({ initialItem, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialItem?.title || '');
    const [questions, setQuestions] = useState<SurveyQuestion[]>(initialItem?.surveyQuestions || []);

    const addQuestion = () => {
        const newQuestion: SurveyQuestion = {
            id: `sq-${Date.now()}`,
            text: '',
            type: SurveyQuestionType.Rating,
            required: true,
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, field: keyof SurveyQuestion, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert("Title is required.");
            return;
        }
        if (questions.length === 0) {
            alert("Please add at least one question.");
            return;
        }
        
        onSave({
            title,
            type: ContentType.Survey,
            surveyQuestions: questions,
        });
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Create Course Survey</h2>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Survey Title</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="e.g., Mid-Semester Feedback"
                />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                {questions.map((q, index) => (
                    <div key={q.id} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-bold text-gray-500 dark:text-gray-400">Question {index + 1}</span>
                            <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700">
                                <Icon name="X" className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                value={q.text} 
                                onChange={e => updateQuestion(q.id, 'text', e.target.value)} 
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Enter question text..."
                            />
                            <div className="flex gap-4">
                                <select 
                                    value={q.type} 
                                    onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                                    className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value={SurveyQuestionType.Rating}>Star Rating (1-5)</option>
                                    <option value={SurveyQuestionType.OpenEnded}>Open Text</option>
                                    <option value={SurveyQuestionType.YesNo}>Yes / No</option>
                                </select>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={q.required} 
                                        onChange={e => updateQuestion(q.id, 'required', e.target.checked)}
                                        className="h-4 w-4 text-primary rounded"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between border-t dark:border-gray-700 pt-4">
                <button onClick={addQuestion} className="text-primary-dark dark:text-primary font-bold hover:underline flex items-center">
                    + Add Question
                </button>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-gray-800 font-bold rounded-md hover:bg-primary-dark">Save Survey</button>
                </div>
            </div>
        </div>
    );
};
