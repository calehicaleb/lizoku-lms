import React, { useState, useCallback, useEffect } from 'react';
import { ContentItem, AssignmentSubmission, Rubric } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { Icon } from '../icons';
import { RubricViewer } from './RubricViewer';

interface AssignmentUploaderProps {
    assignment: ContentItem;
    courseId: string;
    onSubmissionComplete: () => void;
}

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain', // .txt
];

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const AssignmentUploader: React.FC<AssignmentUploaderProps> = ({ assignment, courseId, onSubmissionComplete }) => {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [rubric, setRubric] = useState<Rubric | null>(null);

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        const fetchInitialData = async () => {
            try {
                const [submissionData, rubricData] = await Promise.all([
                    api.getAssignmentSubmissionForStudent(user.id, assignment.id),
                    assignment.rubricId ? api.getRubricById(assignment.rubricId) : Promise.resolve(null)
                ]);
                setSubmission(submissionData);
                setRubric(rubricData);
            } catch (err) {
                console.error("Failed to check for existing submission or rubric", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [user, assignment.id, assignment.rubricId]);

    const handleFileSelect = (file: File | null) => {
        setError('');
        if (file) {
            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                setError('Invalid file type. Please upload a Word, PDF, Excel, PowerPoint, or Text file.');
                return;
            }
            setSelectedFile(file);
        }
    };

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, []);

    const handleSubmit = async () => {
        if (!selectedFile || !user) return;
        setIsSubmitting(true);
        setError('');
        try {
            const newSubmission = await api.submitAssignment(user.id, courseId, assignment.id, {
                name: selectedFile.name,
                size: selectedFile.size,
            });
            setSubmission(newSubmission);
            onSubmissionComplete();
        } catch (err) {
            setError('Failed to submit your assignment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Checking submission status...</div>;
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{assignment.title}</h1>

            {assignment.instructions && (
                <div className="mt-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                    <h2 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Instructions</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{assignment.instructions}</p>
                </div>
            )}

            {rubric && (
                <div className="my-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Grading Rubric</h2>
                    <RubricViewer rubric={rubric} />
                </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 mt-8">Submit Your Work</h2>
            {submission ? (
                 <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-6 rounded-md shadow-sm">
                    <div className="flex">
                        <div className="py-1"><Icon name="CheckCircle" className="h-8 w-8 text-green-500 mr-4" /></div>
                        <div>
                            <p className="font-bold text-lg text-green-800 dark:text-green-200">Submitted!</p>
                            <p className="mt-2">You submitted <strong className="text-green-900 dark:text-green-100">{submission.file.name}</strong> on {new Date(submission.submittedAt).toLocaleString()}.</p>
                            <p className="text-sm mt-1">Your submission is now pending review by your instructor.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div 
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragging ? 'border-primary bg-primary/10 dark:bg-primary/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'}`}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                            accept={ALLOWED_MIME_TYPES.join(',')}
                        />
                        <Icon name="FileText" className="h-12 w-12 mx-auto text-gray-400" />
                        <label htmlFor="file-upload" className="mt-4 block font-semibold text-secondary dark:text-blue-400 hover:underline cursor-pointer">
                            Click to select a file
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">or drag and drop here</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT</p>
                    </div>

                    {error && <p className="mt-4 text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
                    
                    {selectedFile && !error && (
                        <div className="mt-4 p-4 bg-secondary-light dark:bg-secondary/20 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon name="FileText" className="h-6 w-6 text-secondary dark:text-blue-400" />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(selectedFile.size)}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedFile(null)} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                                <Icon name="X" className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    
                    <div className="mt-6 text-right">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedFile || isSubmitting}
                            className="bg-primary text-gray-800 font-bold py-3 px-6 rounded-md hover:bg-primary-dark transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center ml-auto"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Submitting...
                                </>
                            ) : (
                                "Submit Assignment"
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
