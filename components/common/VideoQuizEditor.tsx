
import React, { useState, useRef } from 'react';
import { ContentItem, ContentType, QuestionType, VideoInteraction, QuestionDifficulty } from '../../types';
import { Icon } from '../icons';
import { Modal } from '../ui/Modal';

interface VideoQuizEditorProps {
    initialItem?: ContentItem;
    onSave: (item: Omit<ContentItem, 'id'>) => void;
    onCancel: () => void;
}

export const VideoQuizEditor: React.FC<VideoQuizEditorProps> = ({ initialItem, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialItem?.title || '');
    const [videoUrl, setVideoUrl] = useState(initialItem?.videoUrl || '');
    const [interactions, setInteractions] = useState<VideoInteraction[]>(initialItem?.interactions || []);
    
    // Player State
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    // Question Modal State
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [editingInteractionId, setEditingInteractionId] = useState<string | null>(null);
    const [questionStem, setQuestionStem] = useState('');
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MultipleChoice);
    const [options, setOptions] = useState(['', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [tfCorrect, setTfCorrect] = useState(true);

    const handleAddInteraction = () => {
        if (!videoUrl) {
            alert("Please enter a video URL first.");
            return;
        }
        // Pause video to capture timestamp
        if (videoRef.current) videoRef.current.pause();
        
        setEditingInteractionId(null);
        setQuestionStem('');
        setQuestionType(QuestionType.MultipleChoice);
        setOptions(['', '']);
        setCorrectIndex(0);
        setTfCorrect(true);
        setIsQuestionModalOpen(true);
    };

    const handleSaveInteraction = () => {
        if (!questionStem.trim()) {
            alert("Question text is required.");
            return;
        }

        const questionBase = {
            id: `q-${Date.now()}`,
            instructorId: 'current',
            stem: questionStem,
            difficulty: QuestionDifficulty.Medium,
            topics: [],
            isPublic: false
        };

        let newQuestion: any;

        if (questionType === QuestionType.MultipleChoice) {
            newQuestion = {
                ...questionBase,
                type: QuestionType.MultipleChoice,
                options: options,
                correctAnswerIndex: correctIndex
            };
        } else {
            newQuestion = {
                ...questionBase,
                type: QuestionType.TrueFalse,
                correctAnswer: tfCorrect
            };
        }

        if (editingInteractionId) {
            setInteractions(prev => prev.map(i => i.id === editingInteractionId ? { ...i, question: newQuestion } : i));
        } else {
            const newInteraction: VideoInteraction = {
                id: `int-${Date.now()}`,
                timestamp: currentTime,
                question: newQuestion
            };
            setInteractions(prev => [...prev, newInteraction]);
        }
        setIsQuestionModalOpen(false);
    };

    const handleDeleteInteraction = (id: string) => {
        setInteractions(prev => prev.filter(i => i.id !== id));
    };

    const handleSaveItem = () => {
        if (!title.trim()) {
            alert("Title is required.");
            return;
        }
        if (!videoUrl.trim()) {
            alert("Video URL is required.");
            return;
        }

        onSave({
            title,
            type: ContentType.InteractiveVideo,
            videoUrl,
            interactions
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL (MP4)</label>
                <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="https://example.com/video.mp4" />
            </div>

            <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
                <div className="col-span-2 flex flex-col">
                    <div className="flex-1 bg-black rounded-lg overflow-hidden relative group">
                        {videoUrl ? (
                            <video 
                                ref={videoRef}
                                src={videoUrl}
                                className="w-full h-full object-contain"
                                controls
                                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Enter a URL to preview video
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="font-mono text-lg font-bold text-gray-800 dark:text-gray-100">
                            Current Time: {formatTime(currentTime)}
                        </span>
                        <button 
                            onClick={handleAddInteraction}
                            disabled={!videoUrl}
                            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark disabled:opacity-50"
                        >
                            + Add Question at {formatTime(currentTime)}
                        </button>
                    </div>
                </div>

                <div className="col-span-1 border-l dark:border-gray-700 pl-6 flex flex-col overflow-hidden">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Interactions ({interactions.length})</h3>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {interactions.sort((a,b) => a.timestamp - b.timestamp).map(interaction => (
                            <div key={interaction.id} className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex justify-between items-start">
                                    <span className="font-mono font-bold text-primary-dark">{formatTime(interaction.timestamp)}</span>
                                    <button onClick={() => handleDeleteInteraction(interaction.id)} className="text-red-500 hover:text-red-700">
                                        <Icon name="X" className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-sm font-medium mt-1 truncate">{interaction.question.stem}</p>
                                <p className="text-xs text-gray-500 capitalize">{interaction.question.type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                <button onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleSaveItem} className="px-4 py-2 bg-primary text-gray-800 font-bold rounded-md hover:bg-primary-dark">Save Interactive Video</button>
            </div>

            {/* Question Modal */}
            <Modal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} title="Add Question">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Question Type</label>
                        <select value={questionType} onChange={e => setQuestionType(e.target.value as QuestionType)} className="w-full border rounded-md p-2 dark:bg-gray-700">
                            <option value={QuestionType.MultipleChoice}>Multiple Choice</option>
                            <option value={QuestionType.TrueFalse}>True / False</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Question Text</label>
                        <input type="text" value={questionStem} onChange={e => setQuestionStem(e.target.value)} className="w-full border rounded-md p-2 dark:bg-gray-700" />
                    </div>
                    
                    {questionType === QuestionType.MultipleChoice && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Options</label>
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input 
                                        type="radio" 
                                        checked={correctIndex === idx} 
                                        onChange={() => setCorrectIndex(idx)} 
                                        className="mt-2"
                                    />
                                    <input 
                                        type="text" 
                                        value={opt} 
                                        onChange={e => {
                                            const newOpts = [...options];
                                            newOpts[idx] = e.target.value;
                                            setOptions(newOpts);
                                        }} 
                                        className="flex-1 border rounded-md p-2 dark:bg-gray-700" 
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                    {options.length > 2 && (
                                        <button onClick={() => setOptions(options.filter((_, i) => i !== idx))} className="text-red-500">
                                            <Icon name="X" className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={() => setOptions([...options, ''])} className="text-sm text-secondary hover:underline">+ Add Option</button>
                        </div>
                    )}

                    {questionType === QuestionType.TrueFalse && (
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input type="radio" checked={tfCorrect === true} onChange={() => setTfCorrect(true)} /> True
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" checked={tfCorrect === false} onChange={() => setTfCorrect(false)} /> False
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setIsQuestionModalOpen(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                        <button onClick={handleSaveInteraction} className="px-4 py-2 bg-primary rounded-md font-bold">Save Question</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
