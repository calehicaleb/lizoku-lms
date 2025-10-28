
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import { Course, Module, ContentItem, ContentType, Question, Rubric } from '../../types';
import { Icon, IconName } from '../../components/icons';
import { Modal } from '../../components/ui/Modal';
import { generateCourseOutline } from '../../services/geminiService';
import { useAuth } from '../../contexts/AuthContext';

const CourseBuilderPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    
    // AI Generator State
    const [isGeneratorOpen, setGeneratorOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiDescription, setAiDescription] = useState('');
    const [generatorError, setGeneratorError] = useState('');
    const [numModules, setNumModules] = useState('8');
    const [allowedContentTypes, setAllowedContentTypes] = useState<Set<ContentType>>(() => new Set(Object.values(ContentType)));

    // Quiz/Assignment Assembly State
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
    const [instructorQuestions, setInstructorQuestions] = useState<Question[]>([]);
    const [instructorRubrics, setInstructorRubrics] = useState<Rubric[]>([]);
    const [itemFormData, setItemFormData] = useState<{
        selectedQuestionIds: Set<string>;
        timeLimit?: number;
        attemptsLimit?: number;
        randomizeQuestions?: boolean;
        rubricId?: string;
    }>({ selectedQuestionIds: new Set() });

    const questionsById = useMemo(() => 
        instructorQuestions.reduce((acc, q) => {
            acc[q.id] = q;
            return acc;
        }, {} as Record<string, Question>), 
    [instructorQuestions]);


    useEffect(() => {
        if (!courseId || !user) return;
        
        const fetchInitialData = async () => {
            try {
                const [courseData, questionsData, rubricsData] = await Promise.all([
                    api.getCourseDetails(courseId),
                    api.getQuestions(user.id),
                    api.getRubrics(user.id)
                ]);

                setCourse(courseData);
                if (courseData) {
                    setAiDescription(courseData.description);
                }
                setInstructorQuestions(questionsData);
                setInstructorRubrics(rubricsData);

            } catch (error) {
                console.error("Failed to fetch course data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [courseId, user]);
    
    const handleContentTypeToggle = (type: ContentType) => {
        setAllowedContentTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    const handleGenerateOutline = async () => {
        if (!course) return;

        if (allowedContentTypes.size === 0) {
            setGeneratorError("Please select at least one content type.");
            return;
        }

        const num = parseInt(numModules, 10);
        if (isNaN(num) || num < 1 || num > 20) {
            setGeneratorError("Number of modules must be between 1 and 20.");
            return;
        }

        setIsGenerating(true);
        setGeneratorError('');
        try {
            const generatedModules = await generateCourseOutline(
                course.title, 
                aiDescription,
                num,
                Array.from(allowedContentTypes)
            );
            
            const modulesWithIds = generatedModules.map((mod, modIndex) => ({
                ...mod,
                id: `ai-mod-${Date.now()}-${modIndex}`,
                items: mod.items.map((item, itemIndex) => ({
                    ...item,
                    id: `ai-item-${Date.now()}-${modIndex}-${itemIndex}`,
                }))
            }));

            setCourse(prevCourse => ({ ...prevCourse!, modules: modulesWithIds }));
            setGeneratorOpen(false);
        } catch (error) {
            console.error(error);
            setGeneratorError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenSettingsModal = (item: ContentItem) => {
        setCurrentItem(item);
        setItemFormData({
            selectedQuestionIds: new Set(item.questionIds || []),
            timeLimit: item.timeLimit,
            attemptsLimit: item.attemptsLimit,
            randomizeQuestions: item.randomizeQuestions || false,
            rubricId: item.rubricId || '',
        });
        setSettingsModalOpen(true);
    };

    const handleSaveItemSettings = async () => {
        if (!course || !currentItem) return;

        const updatedModules = course.modules?.map(module => ({
            ...module,
            items: module.items.map(item => 
                item.id === currentItem.id 
                ? { 
                    ...item, 
                    questionIds: Array.from(itemFormData.selectedQuestionIds),
                    timeLimit: itemFormData.timeLimit,
                    attemptsLimit: itemFormData.attemptsLimit,
                    randomizeQuestions: itemFormData.randomizeQuestions,
                    rubricId: itemFormData.rubricId || undefined,
                  }
                : item
            ),
        }));

        if (!updatedModules) return;

        try {
            const updatedCourse = await api.updateCourseModules(course.id, updatedModules);
            setCourse(updatedCourse);
            setSettingsModalOpen(false);
        } catch (error) {
            console.error("Failed to save item settings", error);
            alert("Could not save settings. Please try again.");
        }
    };
    
// FIX: Added 'Examination' to the icon map to resolve a type error.
    const contentIconMap: Record<ContentType, IconName> = {
        [ContentType.Lesson]: 'FileText',
        [ContentType.Quiz]: 'ClipboardCheck',
        [ContentType.Assignment]: 'PenSquare',
        [ContentType.Discussion]: 'MessageSquare',
        [ContentType.Resource]: 'Link',
        [ContentType.Examination]: 'ListChecks',
    };

    if (loading) return <div>Loading course builder...</div>;
    if (!course) return <div>Course not found.</div>;

    const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        // FIX: Safely handle checkbox changes by checking for the `checked` property on the target.
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;

        if (type === 'checkbox') {
            setItemFormData(prev => ({ ...prev, [name]: target.checked }));
        } else if (type === 'number') {
            const numValue = value === '' ? undefined : parseInt(value, 10);
            setItemFormData(prev => ({ ...prev, [name]: isNaN(numValue as any) ? undefined : numValue }));
        } else {
            setItemFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleQuizQuestionToggle = (questionId: string) => {
        setItemFormData(prev => {
            const newSet = new Set(prev.selectedQuestionIds);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return { ...prev, selectedQuestionIds: newSet };
        });
    };
    
    return (
        <div>
             <div className="mb-6">
                <Link to="/instructor/courses" className="text-sm text-secondary hover:underline mb-2 inline-block">&larr; Back to My Courses</Link>
                <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
                <p className="mt-1 text-gray-500">{course.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 my-6">
                <button 
                    onClick={() => setGeneratorOpen(true)}
                    className="w-full sm:w-auto bg-primary text-gray-800 font-bold py-3 px-5 rounded-lg shadow-sm hover:bg-primary-dark transition duration-300 flex items-center justify-center">
                    <Icon name="Sparkles" className="h-5 w-5 mr-2" />
                    Generate with AI
                </button>
                <button className="w-full sm:w-auto bg-white text-secondary font-bold py-3 px-5 rounded-lg shadow-sm border-2 border-dashed hover:bg-secondary-light transition duration-300">
                    + Add New Module
                </button>
            </div>
            
            <div className="space-y-6">
                 {course.modules?.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
                        <Icon name="BookOpen" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Your course outline is empty</h3>
                        <p className="mt-1 text-sm text-gray-500">Add a new module manually or use AI to generate a starting point.</p>
                    </div>
                ) : course.modules?.map(module => (
                    <div key={module.id} className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between items-center mb-4">
                             <div className="flex items-center">
                                <Icon name="GripVertical" className="h-5 w-5 text-gray-400 cursor-grab mr-2" />
                                <h3 className="text-xl font-bold text-gray-800">{module.title}</h3>
                            </div>
                            <button className="text-sm font-medium text-secondary hover:underline">Edit Module</button>
                        </div>
                        
                        <div className="space-y-2 pl-7">
                            {module.items.map(item => (
                                <div key={item.id} className="flex items-center bg-gray-50 p-3 rounded-md border hover:border-primary">
                                    <Icon name="GripVertical" className="h-5 w-5 text-gray-400 cursor-grab" />
                                    <Icon name={contentIconMap[item.type] || 'FileText'} className="h-5 w-5 text-gray-500 mx-3" />
                                    <span className="flex-grow text-gray-700">{item.title}</span>
                                    <span className="text-xs text-gray-400 capitalize mr-4">{item.type} {item.type === 'quiz' && `(${item.questionIds?.length || 0} Qs)`}</span>
                                    <button 
                                        onClick={() => (item.type === 'quiz' || item.type === 'assignment') ? handleOpenSettingsModal(item) : alert('Edit for this item type not implemented.')}
                                        className="text-xs font-medium text-secondary hover:underline">
                                        {(item.type === 'quiz' || item.type === 'assignment') ? 'Manage Settings' : 'Edit'}
                                    </button>
                                </div>
                            ))}
                              <button className="w-full text-left text-sm text-gray-500 hover:text-secondary p-3 border-2 border-dashed rounded-md mt-2">
                                + Add Content Item
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <Modal isOpen={isGeneratorOpen} onClose={() => setGeneratorOpen(false)} title="Generate Course Outline with AI">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Provide a brief description and set your preferences, and our AI will generate a structured outline for you.</p>
                    <div>
                        <label htmlFor="course-title-ai" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                        <input type="text" id="course-title-ai" value={course.title} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label htmlFor="course-desc-ai" className="block text-sm font-medium text-gray-700 mb-1">Course Description</label>
                        <textarea id="course-desc-ai" rows={3} value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., An introductory course covering the fundamentals of Python programming..." />
                    </div>
                    <div>
                        <label htmlFor="num-modules-ai" className="block text-sm font-medium text-gray-700 mb-1">Number of Modules</label>
                        <input
                            type="number"
                            id="num-modules-ai"
                            value={numModules}
                            onChange={(e) => setNumModules(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            min="1"
                            max="20"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Content Types</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-3 border rounded-md bg-gray-50">
                            {Object.values(ContentType).map(type => (
                                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={allowedContentTypes.has(type)}
                                        onChange={() => handleContentTypeToggle(type)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="text-sm capitalize text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {generatorError && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{generatorError}</p>}
                    <div className="pt-2 flex justify-end">
                        <button 
                            onClick={handleGenerateOutline} 
                            disabled={isGenerating || !aiDescription.trim() || allowedContentTypes.size === 0}
                            className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed">
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Icon name="Sparkles" className="h-5 w-5 mr-2" />
                                    Generate Outline
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} title={`Settings for: "${currentItem?.title}"`}>
                <div className="space-y-6">
                    {currentItem?.type === ContentType.Quiz && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Questions */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Questions</h3>
                                <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-2 border p-2 rounded-md">
                                    {instructorQuestions.length > 0 ? instructorQuestions.map(q => (
                                        <label key={q.id} className="flex items-start p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                                                checked={itemFormData.selectedQuestionIds.has(q.id)}
                                                onChange={() => handleQuizQuestionToggle(q.id)}
                                            />
                                            <div className="ml-3 text-sm">
                                                <p className="font-medium text-gray-900">{q.stem}</p>
                                                <p className="text-xs text-gray-500 capitalize">{q.type.replace('-', ' ')}</p>
                                            </div>
                                        </label>
                                    )) : <p className="text-sm text-gray-500">You haven't created any questions in your question bank yet.</p>}
                                </div>
                            </div>
                            {/* Right: Settings */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Settings</h3>
                                <div>
                                    <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                                    <input type="number" name="timeLimit" value={itemFormData.timeLimit ?? ''} onChange={handleItemFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" placeholder="e.g., 60" min="1" />
                                </div>
                                <div>
                                    <label htmlFor="attemptsLimit" className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                                    <input type="number" name="attemptsLimit" value={itemFormData.attemptsLimit ?? ''} onChange={handleItemFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" placeholder="e.g., 3" min="1" />
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" name="randomizeQuestions" checked={itemFormData.randomizeQuestions ?? false} onChange={handleItemFormChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                        <span className="ml-2 text-sm text-gray-700">Randomize Question Order</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {(currentItem?.type === ContentType.Assignment || currentItem?.type === ContentType.Quiz) && (
                         <div>
                            <h3 className="font-bold text-lg">Grading</h3>
                             <label htmlFor="rubricId" className="block text-sm font-medium text-gray-700 mb-1 mt-2">Attach Rubric</label>
                            <select name="rubricId" value={itemFormData.rubricId ?? ''} onChange={handleItemFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                                <option value="">None</option>
                                {instructorRubrics.map(rubric => (
                                    <option key={rubric.id} value={rubric.id}>{rubric.title}</option>
                                ))}
                            </select>
                         </div>
                    )}
                </div>
                 <div className="pt-4 mt-4 border-t flex justify-between items-center">
                     <p className="text-sm font-medium">{currentItem?.type === ContentType.Quiz ? `${itemFormData.selectedQuestionIds.size} questions selected` : ''}</p>
                    <div className="space-x-2">
                        <button type="button" onClick={() => setSettingsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="button" onClick={handleSaveItemSettings} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Save Settings</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CourseBuilderPage;
