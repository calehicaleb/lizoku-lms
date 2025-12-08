
import React, { useState, useRef, useEffect } from 'react';
import { VideoInteraction, Question, QuestionType } from '../../types';
import { Icon } from '../icons';

interface VideoQuizPlayerProps {
    videoUrl: string;
    interactions: VideoInteraction[];
    onComplete?: () => void;
}

export const VideoQuizPlayer: React.FC<VideoQuizPlayerProps> = ({ videoUrl, interactions, onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeInteraction, setActiveInteraction] = useState<VideoInteraction | null>(null);
    const [completedInteractionIds, setCompletedInteractionIds] = useState<Set<string>>(new Set());
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    // Sort interactions by timestamp
    const sortedInteractions = React.useMemo(() => {
        return [...interactions].sort((a, b) => a.timestamp - b.timestamp);
    }, [interactions]);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const time = videoRef.current.currentTime;
        setCurrentTime(time);

        // Check for interactions
        // Trigger if we are within 0.5s of the timestamp AND it hasn't been shown yet
        const pendingInteraction = sortedInteractions.find(
            i => Math.abs(i.timestamp - time) < 0.5 && !completedInteractionIds.has(i.id)
        );

        if (pendingInteraction) {
            videoRef.current.pause();
            setIsPlaying(false);
            setActiveInteraction(pendingInteraction);
        }
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        if (activeInteraction) return; // Block play if interaction is active

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmitAnswer = () => {
        if (!activeInteraction || selectedAnswer === null) return;

        // Simple validation for Multiple Choice and True/False in video quizzes
        let isCorrect = false;
        if (activeInteraction.question.type === QuestionType.MultipleChoice) {
            isCorrect = selectedAnswer === activeInteraction.question.correctAnswerIndex;
        } else if (activeInteraction.question.type === QuestionType.TrueFalse) {
             // Mapping 0 to True, 1 to False for simple radio logic in UI
             const boolAnswer = selectedAnswer === 0;
             isCorrect = boolAnswer === activeInteraction.question.correctAnswer;
        }

        if (isCorrect) {
            setFeedback('correct');
            setTimeout(() => {
                setCompletedInteractionIds(prev => new Set(prev).add(activeInteraction.id));
                setActiveInteraction(null);
                setFeedback(null);
                setSelectedAnswer(null);
                if (videoRef.current) {
                    videoRef.current.play();
                    setIsPlaying(true);
                }
            }, 1500);
        } else {
            setFeedback('incorrect');
        }
    };

    const renderQuestion = (question: Question) => {
        if (question.type === QuestionType.MultipleChoice) {
            return (
                <div className="space-y-2">
                    {question.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedAnswer(idx)}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${
                                selectedAnswer === idx 
                                    ? 'bg-primary/20 border-primary text-primary-dark' 
                                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            );
        }
        if (question.type === QuestionType.TrueFalse) {
            return (
                <div className="flex gap-4">
                    <button
                        onClick={() => setSelectedAnswer(0)} // 0 for True
                        className={`flex-1 p-4 rounded-md border font-bold transition-colors ${
                            selectedAnswer === 0
                                ? 'bg-primary/20 border-primary text-primary-dark' 
                                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        True
                    </button>
                    <button
                        onClick={() => setSelectedAnswer(1)} // 1 for False
                        className={`flex-1 p-4 rounded-md border font-bold transition-colors ${
                            selectedAnswer === 1
                                ? 'bg-primary/20 border-primary text-primary-dark' 
                                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        False
                    </button>
                </div>
            );
        }
        return <p>Unsupported question type for video quiz.</p>;
    };

    return (
        <div className="flex flex-col h-full bg-black rounded-lg overflow-hidden relative group">
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls={!activeInteraction}
            />

            {/* Interaction Overlay */}
            {activeInteraction && (
                <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Icon name="HelpCircle" className="h-5 w-5 text-primary" />
                                Check Your Understanding
                            </h3>
                        </div>
                        
                        <p className="text-lg mb-6 text-gray-700 dark:text-gray-200 font-medium">
                            {activeInteraction.question.stem}
                        </p>

                        {renderQuestion(activeInteraction.question)}

                        {feedback && (
                            <div className={`mt-4 p-3 rounded-md text-center font-bold ${
                                feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {feedback === 'correct' ? 'Correct! Resuming video...' : 'Incorrect. Try again.'}
                            </div>
                        )}

                        {!feedback && (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={selectedAnswer === null}
                                className="w-full mt-6 bg-primary text-gray-900 font-bold py-3 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Submit Answer
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            {/* Timeline Markers */}
            <div className="absolute bottom-12 left-4 right-4 h-2 pointer-events-none hidden group-hover:block">
                {sortedInteractions.map(interaction => (
                    <div 
                        key={interaction.id}
                        className={`absolute top-0 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm ${
                            completedInteractionIds.has(interaction.id) ? 'bg-green-500' : 'bg-yellow-400'
                        }`}
                        style={{ left: `${(interaction.timestamp / duration) * 100}%` }}
                        title="Quiz Question"
                    ></div>
                ))}
            </div>
        </div>
    );
};
