
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
// Fix: Import ContentItemDetails type.
import { Course, Module, ContentItem, ContentType, Question, Rubric, ContentItemDetails, CourseStatus, VersionHistoryEntry } from '../../types';
import { Icon, IconName } from '../../components/icons';
import { Modal } from '../../components/ui/Modal';
import { generateCourseOutline, generateSingleModule, generateContentItems } from '../../services/geminiService';
import { useAuth } from '../../contexts/AuthContext';
import { DiscussionBoard } from '../../components/common/DiscussionBoard';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { VideoQuizEditor } from '../../components/common/VideoQuizEditor';
import { OfflineSessionEditor } from '../../components/common/OfflineSessionEditor';
import { SurveyEditor } from '../../components/common/SurveyEditor';
import { SurveyResults } from '../../components/common/SurveyResults';
import { VersionHistoryModal } from '../../components/common/VersionHistoryModal';

interface AddModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseTitle: string;
    onModuleAdded: (newModule: Module) => void;
}

const AddModuleModal: React.FC<AddModuleModalProps> = ({ isOpen, onClose, courseTitle, onModuleAdded }) => {
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [manualTitle, setManualTitle] = useState('');
    const [aiTopic, setAiTopic] = useState('');
    const [aiDescription, setAiDescription] = useState('');
    const [aiContentTypes, setAiContentTypes] = useState<Set<ContentType>>(() => new Set(Object.values(ContentType)));
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    // New state for AI preview
    const [generatedModule, setGeneratedModule] = useState<Module | null>(null);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    
    // Fix: Added missing LiveSession icon mapping to satisfy the type requirement.
    const contentIconMap: Record<ContentType, IconName> = {
        [ContentType.Lesson]: 'FileText',
        [ContentType.Quiz]: 'ClipboardCheck',
        [ContentType.Assignment]: 'PenSquare',
        [ContentType.Discussion]: 'MessageSquare',
        [ContentType.Resource]: 'Link',
        [ContentType.Examination]: 'ListChecks',
        [ContentType.InteractiveVideo]: 'FileVideo',
        [ContentType.OfflineSession]: 'CalendarCheck',
        [ContentType.LiveSession]: 'Video',
        [ContentType.Survey]: 'Star',
        [ContentType.Leaderboard]: 'Trophy',
        [ContentType.Scorm]: 'Package',
    };

    const resetForm = () => {
        setManualTitle('');
        setAiTopic('');
        setAiDescription('');
        setError('');
        setAiContentTypes(new Set(Object.values(ContentType)));
        setActiveTab('manual');
        setGeneratedModule(null);
        setSelectedItemIds(new Set());
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(resetForm, 300);
        }
    }, [isOpen]);
    
    const handleManualAdd = () => {
        if (!manualTitle.trim()) {
            setError('Module title cannot be empty.');
            return;
        }
        onModuleAdded({
            id: '', // Parent will assign
            title: manualTitle,
            items: [],
        });
        resetForm();
    };

    const handleAiGenerate = async () => {
        if (!aiTopic.trim()) {
            setError("Please provide a module topic.");
            return;
        }
        if (aiContentTypes.size === 0) {
            setError("Please select at least one content type.");
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const generated = await generateSingleModule(courseTitle, aiTopic, aiDescription, Array.from(aiContentTypes));
            const moduleWithTempIds = {
                ...generated,
                items: generated.items.map((item, index) => ({ ...item, id: `temp-item-${index}` }))
            };
            setGeneratedModule(moduleWithTempIds);
            setSelectedItemIds(new Set(moduleWithTempIds.items.map(item => item.id)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleAddSelectedItems = () => {
        if (!generatedModule) return;
        const selectedItems = generatedModule.items.filter(item => selectedItemIds.has(item.id));
        onModuleAdded({
            ...generatedModule,
            items: selectedItems,
        });
        resetForm();
        onClose();
    };

    const handleItemSelectionToggle = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = (select: boolean) => {
        if (select && generatedModule) {
            setSelectedItemIds(new Set(generatedModule.items.map(item => item.id)));
        } else {
            setSelectedItemIds(new Set());
        }
    };

    const handleContentTypeToggle = (type: ContentType) => {
        setAiContentTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    const renderAiTab = () => {
        if (isGenerating) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Generating module...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Our AI is crafting your content. This may take a moment.</p>
                </div>
            );
        }
        if (generatedModule) {
            return (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg dark:text-gray-200">"{generatedModule.title}"</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Select the content items you want to include in this module.</p>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <span className="text-sm font-medium">{selectedItemIds.size} of {generatedModule.items.length} selected</span>
                        <div className="space-x-4">
                            <button onClick={() => handleSelectAll(true)} className="text-sm font-medium text-secondary dark:text-blue-400 hover:underline">Select All</button>
                            <button onClick={() => handleSelectAll(false)} className="text-sm font-medium text-secondary dark:text-blue-400 hover:underline">Deselect All</button>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto border dark:border-gray-600 rounded-md p-2">
                         {generatedModule.items.map(item => (
                             <label key={item.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                 <input type="checkbox" checked={selectedItemIds.has(item.id)} onChange={() => handleItemSelectionToggle(item.id)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-500 rounded"/>
                                 <Icon name={contentIconMap[item.type] || 'FileText'} className="h-5 w-5 text-gray-500 dark:text-gray-400 mx-3" />
                                 <span className="flex-grow text-gray-700 dark:text-gray-300">{item.title}</span>
                                 <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{item.type}</span>
                            </label>
                         ))}
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                        <button onClick={() => setGeneratedModule(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                           &larr; Back to Form
                        </button>
                        <button onClick={handleAddSelectedItems} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark">
                            Add Module with {selectedItemIds.size} Items
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                 <div>
                    <label htmlFor="ai-topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module Topic</label>
                    <input type="text" id="ai-topic" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., Introduction to Arrays" />
                </div>
                <div>
                    <label htmlFor="ai-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brief Description (Optional)</label>
                    <textarea id="ai-desc" rows={2} value={aiDescription} onChange={e => setAiDescription(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., Cover array declaration, indexing, and basic methods like push and pop." />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowed Content Types</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
                        {Object.values(ContentType).map(type => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={aiContentTypes.has(type)} onChange={() => handleContentTypeToggle(type)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-500 rounded"/>
                                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
                 <div className="pt-2 flex justify-end">
                    <button onClick={handleAiGenerate} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                       <Icon name="Sparkles" className="h-5 w-5 mr-2" /> Generate Module
                    </button>
                </div>
            </div>
        );
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Module" size="2xl">
            <div className="flex border-b dark:border-gray-700 mb-4">
                <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'manual' ? 'border-b-2 border-primary text-primary-dark dark:text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    Create Manually
                </button>
                <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'ai' ? 'border-b-2 border-primary text-primary-dark dark:text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    Generate with AI <Icon name="Sparkles" className="h-4 w-4" />
                </button>
            </div>
            
            {error && <p className="mb-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">{error}</p>}

            {activeTab === 'manual' && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="manual-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module Title</label>
                        <input
                            type="text"
                            id="manual-title"
                            value={manualTitle}
                            onChange={e => setManualTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g., Week 1: Introduction"
                        />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button onClick={handleManualAdd} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark">
                            Add Module
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'ai' && renderAiTab()}
        </Modal>
    );
};

interface AddContentItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseTitle: string;
    moduleTitle: string;
    onItemsAdded: (newItems: Omit<ContentItem, 'id'>[]) => void;
}

const AddContentItemModal: React.FC<AddContentItemModalProps> = ({ isOpen, onClose, courseTitle, moduleTitle, onItemsAdded }) => {
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [manualTitle, setManualTitle] = useState('');
    const [manualType, setManualType] = useState<ContentType>(ContentType.Lesson);
    
    const [aiTopic, setAiTopic] = useState('');
    const [aiContentTypes] = useState<Set<ContentType>>(() => new Set(Object.values(ContentType)));
    
    const [generatedItems, setGeneratedItems] = useState<ContentItem[] | null>(null);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

    // SCORM Upload State
    const [isScormUpload, setIsScormUpload] = useState(false);
    const [scormFile, setScormFile] = useState<File | null>(null);

    // Fix: Added missing LiveSession mapping.
    const contentIconMap: Record<ContentType, IconName> = {
        [ContentType.Lesson]: 'FileText',
        [ContentType.Quiz]: 'ClipboardCheck',
        [ContentType.Assignment]: 'PenSquare',
        [ContentType.Discussion]: 'MessageSquare',
        [ContentType.Resource]: 'Link',
        [ContentType.Examination]: 'ListChecks',
        [ContentType.InteractiveVideo]: 'FileVideo',
        [ContentType.OfflineSession]: 'CalendarCheck',
        [ContentType.LiveSession]: 'Video',
        [ContentType.Survey]: 'Star',
        [ContentType.Leaderboard]: 'Trophy',
        [ContentType.Scorm]: 'Package',
    };

    const resetForm = () => {
        setManualTitle('');
        setManualType(ContentType.Lesson);
        setAiTopic('');
        setError('');
        setActiveTab('manual');
        setGeneratedItems(null);
        setSelectedItemIds(new Set());
        setScormFile(null);
        setIsScormUpload(false);
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(resetForm, 300);
        }
    }, [isOpen]);

    const handleManualAdd = () => {
        if (!manualTitle.trim()) {
            setError('Content item title cannot be empty.');
            return;
        }
        
        const newItem: Omit<ContentItem, 'id'> = { title: manualTitle, type: manualType };
        
        if (manualType === ContentType.Scorm) {
            if (!scormFile) {
                setError('Please upload a SCORM zip package.');
                return;
            }
            newItem.scormDetails = {
                version: '1.2', // Default for mock
                launchFile: 'index.html',
                packageUrl: '#', // In real app, this is URL after upload
            };
        }

        onItemsAdded([newItem]);
        resetForm();
    };

    const handleAiGenerate = async () => {
        if (!aiTopic.trim()) {
            setError('Please provide a topic to generate content items.');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const items = await generateContentItems(courseTitle, moduleTitle, aiTopic, Array.from(aiContentTypes));
            const itemsWithTempIds = items.map((item, index) => ({ ...item, id: `temp-item-${index}` })) as ContentItem[];
            setGeneratedItems(itemsWithTempIds);
            setSelectedItemIds(new Set(itemsWithTempIds.map(i => i.id)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while generating items.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleAddSelectedItems = () => {
        if (!generatedItems) return;
        const selectedItems = generatedItems.filter(item => selectedItemIds.has(item.id));
        onItemsAdded(selectedItems);
        resetForm();
        onClose();
    };
    
    const handleItemSelectionToggle = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) newSet.delete(itemId);
            else newSet.add(itemId);
            return newSet;
        });
    };

    const handleSelectAll = (select: boolean) => {
        if (select && generatedItems) {
            setSelectedItemIds(new Set(generatedItems.map(item => item.id)));
        } else {
            setSelectedItemIds(new Set());
        }
    };
    
    const renderAiTab = () => {
        if (isGenerating) {
             return <div className="text-center p-8">Generating items...</div>;
        }
        if (generatedItems) {
            return (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Select the items you want to add to this module.</p>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <span className="text-sm font-medium">{selectedItemIds.size} of {generatedItems.length} selected</span>
                        <div className="space-x-4">
                            <button onClick={() => handleSelectAll(true)} className="text-sm font-medium text-secondary dark:text-blue-400 hover:underline">Select All</button>
                            <button onClick={() => handleSelectAll(false)} className="text-sm font-medium text-secondary dark:text-blue-400 hover:underline">Deselect All</button>
                        </div>
                    </div>
                     <div className="space-y-2 max-h-64 overflow-y-auto border dark:border-gray-600 rounded-md p-2">
                         {generatedItems.map(item => (
                             <label key={item.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                 <input type="checkbox" checked={selectedItemIds.has(item.id)} onChange={() => handleItemSelectionToggle(item.id)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-500 rounded"/>
                                 <Icon name={contentIconMap[item.type] || 'FileText'} className="h-5 w-5 text-gray-500 dark:text-gray-400 mx-3" />
                                 <span className="flex-grow text-gray-700 dark:text-gray-300">{item.title}</span>
                                 <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{item.type}</span>
                            </label>
                         ))}
                    </div>
                     <div className="pt-2 flex justify-between items-center">
                        <button onClick={() => setGeneratedItems(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                           &larr; Back
                        </button>
                        <button onClick={handleAddSelectedItems} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark">
                            Add {selectedItemIds.size} Items
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <div>
                    <label htmlFor="ai-item-topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic for Content Items</label>
                    <input type="text" id="ai-item-topic" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., Variables and Data Types"/>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The AI will generate a list of items related to this topic.</p>
                </div>
                <div className="pt-2 flex justify-end">
                    <button onClick={handleAiGenerate} disabled={isGenerating} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed">
                        {isGenerating ? 'Generating...' : <><Icon name="Sparkles" className="h-5 w-5 mr-2" /> Generate Items</>}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add to: ${moduleTitle}`} size="2xl">
            <div className="flex border-b dark:border-gray-700 mb-4">
                <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'manual' ? 'border-b-2 border-primary text-primary-dark dark:text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    Create Manually
                </button>
                <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'ai' ? 'border-b-2 border-primary text-primary-dark dark:text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    Generate with AI <Icon name="Sparkles" className="h-4 w-4" />
                </button>
            </div>

            {error && <p className="mb-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">{error}</p>}

            {activeTab === 'manual' && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="item-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Title</label>
                        <input type="text" id="item-title" value={manualTitle} onChange={e => setManualTitle(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., Introduction to Variables"/>
                    </div>
                    <div>
                        <label htmlFor="item-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Type</label>
                        <select 
                            id="item-type" 
                            value={manualType} 
                            onChange={e => {
                                const type = e.target.value as ContentType;
                                setManualType(type);
                                setIsScormUpload(type === ContentType.Scorm);
                            }} 
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md capitalize"
                        >
                            {Object.values(ContentType).map(type => (<option key={type} value={type}>{type}</option>))}
                        </select>
                    </div>

                    {isScormUpload && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-md border-dashed border-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload SCORM Package (.zip)</label>
                            <input 
                                type="file" 
                                accept=".zip" 
                                onChange={(e) => setScormFile(e.target.files ? e.target.files[0] : null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-gray-800 hover:file:bg-primary-dark"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Supports SCORM 1.2 and 2004.</p>
                        </div>
                    )}

                    <div className="pt-2 flex justify-end">
                        <button onClick={handleManualAdd} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark">Add Item</button>
                    </div>
                </div>
            )}
            {activeTab === 'ai' && renderAiTab()}
        </Modal>
    );
};

// Drag types for internal logic
interface DraggedItemState {
    id: string;
    type: 'module' | 'item';
    moduleId?: string; // If it's an item, which module it belongs to
}

const CourseBuilderPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    
    // AI Full Outline Generator State
    const [isGeneratorOpen, setGeneratorOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiDescription, setAiDescription] = useState('');
    const [generatorError, setGeneratorError] = useState('');
    const [numModules, setNumModules] = useState('8');
    const [allowedContentTypes, setAllowedContentTypes] = useState<Set<ContentType>>(() => new Set(Object.values(ContentType)));
    const [generatedOutline, setGeneratedOutline] = useState<Module[] | null>(null);
    const [selectedGeneratedIds, setSelectedGeneratedIds] = useState<Set<string>>(new Set());
    
    // Add Module Modal State
    const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);

    // Edit Module State
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [editModuleTitle, setEditModuleTitle] = useState('');

    // Add Content Item Modal State
    const [isAddContentItemModalOpen, setAddContentItemModalOpen] = useState(false);
    const [currentModuleForAddItem, setCurrentModuleForAddItem] = useState<Module | null>(null);

    // Discussion Modal State
    const [viewingDiscussion, setViewingDiscussion] = useState<ContentItem | null>(null);
    const [discussionPrompt, setDiscussionPrompt] = useState<ContentItemDetails | null>(null);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

    // Edit Content (Rich Text) Modal State
    const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [isSavingContent, setIsSavingContent] = useState(false);

    // Interactive Video Editor State
    const [editingVideoItem, setEditingVideoItem] = useState<ContentItem | null>(null);

    // Offline Session Editor State
    const [editingOfflineSession, setEditingOfflineSession] = useState<ContentItem | null>(null);

    // Survey Editor State
    const [editingSurveyItem, setEditingSurveyItem] = useState<ContentItem | null>(null);
    const [viewingSurveyResults, setViewingSurveyResults] = useState<ContentItem | null>(null);

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

    // Drag and Drop State
    const [draggedItem, setDraggedItem] = useState<DraggedItemState | null>(null);
    const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

    // Version History State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [history, setHistory] = useState<VersionHistoryEntry[]>([]);
    const [isRestoring, setIsRestoring] = useState(false);

    // Read Only State
    const isReadOnly = useMemo(() => course?.status === CourseStatus.PendingReview, [course]);

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

    useEffect(() => {
        if (viewingDiscussion) {
            setIsLoadingPrompt(true);
            api.getContentItemDetails(viewingDiscussion.id)
                .then(setDiscussionPrompt)
                .catch(error => {
                    console.error("Failed to load discussion prompt:", error);
                    setDiscussionPrompt({ id: viewingDiscussion.id, content: "<p>Could not load prompt.</p>" });
                })
                .finally(() => setIsLoadingPrompt(false));
        }
    }, [viewingDiscussion]);
    
    // Load content when editing modal opens
    useEffect(() => {
        if (editingContentItem) {
            setEditorContent('');
            api.getContentItemDetails(editingContentItem.id)
                .then(details => {
                    setEditorContent(details?.content || '');
                })
                .catch(err => {
                    console.error("Failed to load item content", err);
                    setEditorContent('<p>Error loading content.</p>');
                });
        }
    }, [editingContentItem]);

    // Fix: Added missing LiveSession icon mapping to satisfy the Record<ContentType, IconName> requirement.
    const contentIconMap: Record<ContentType, IconName> = {
        [ContentType.Lesson]: 'FileText',
        [ContentType.Quiz]: 'ClipboardCheck',
        [ContentType.Assignment]: 'PenSquare',
        [ContentType.Discussion]: 'MessageSquare',
        [ContentType.Resource]: 'Link',
        [ContentType.Examination]: 'ListChecks',
        [ContentType.InteractiveVideo]: 'FileVideo',
        [ContentType.OfflineSession]: 'CalendarCheck',
        [ContentType.LiveSession]: 'Video',
        [ContentType.Survey]: 'Star',
        [ContentType.Leaderboard]: 'Trophy',
        [ContentType.Scorm]: 'Package',
    };

    // --- Version History Logic ---
    const handleOpenHistory = async () => {
        if (!courseId) return;
        setIsHistoryModalOpen(true);
        try {
            const historyData = await api.getCourseHistory(courseId);
            setHistory(historyData);
        } catch (error) {
            console.error("Failed to load history", error);
        }
    };

    const handleRestoreVersion = async (versionId: string) => {
        if (!courseId) return;
        setIsRestoring(true);
        try {
            const restoredCourse = await api.restoreCourseVersion(courseId, versionId);
            setCourse(restoredCourse);
            setIsHistoryModalOpen(false);
            alert("Course restored successfully!");
        } catch (error) {
            console.error("Failed to restore version", error);
            alert("Failed to restore version. Please try again.");
        } finally {
            setIsRestoring(false);
        }
    };

    // --- Drag and Drop Handlers ---

    const handleDragStart = (e: React.DragEvent, id: string, type: 'module' | 'item', moduleId?: string) => {
        if (isReadOnly) {
            e.preventDefault();
            return;
        }
        e.stopPropagation(); // Prevent bubbling so dragging an item doesn't drag the module
        setDraggedItem({ id, type, moduleId });
        // Set drag effect
        e.dataTransfer.effectAllowed = 'move';
        // Add a class for visual feedback (optional, handled by react state for opacity)
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        if (isReadOnly) return;
        e.preventDefault(); // Necessary to allow dropping
        e.stopPropagation();
        
        if (!draggedItem) return;
        
        // Prevent dropping a module into an item, etc.
        // We only allow dropping modules onto other modules, and items onto items or modules
        setDragOverTargetId(targetId);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only clear if we are leaving the valid zone, simplified here to prevent flickering:
        // We handle reset on drop or end.
    };

    const handleDrop = async (e: React.DragEvent, targetId: string, targetType: 'module' | 'item', targetModuleId?: string) => {
        if (isReadOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOverTargetId(null);

        if (!draggedItem || !course) return;

        // Logic for reordering/moving
        let newModules = [...(course.modules || [])];

        if (draggedItem.type === 'module' && targetType === 'module') {
            // Reorder Modules
            const oldIndex = newModules.findIndex(m => m.id === draggedItem.id);
            const newIndex = newModules.findIndex(m => m.id === targetId);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const [removed] = newModules.splice(oldIndex, 1);
                newModules.splice(newIndex, 0, removed);
            }
        } else if (draggedItem.type === 'item') {
            // Find source module
            const sourceModuleIndex = newModules.findIndex(m => m.id === draggedItem.moduleId);
            if (sourceModuleIndex === -1) return;
            
            // Find target module
            // If dropped on a module header, targetModuleId is the targetId
            // If dropped on an item, targetModuleId is passed in
            const destModuleId = targetType === 'module' ? targetId : targetModuleId;
            const destModuleIndex = newModules.findIndex(m => m.id === destModuleId);
            
            if (destModuleIndex === -1) return;

            // Remove item from source
            const itemToMove = newModules[sourceModuleIndex].items.find(i => i.id === draggedItem.id);
            if (!itemToMove) return;
            
            newModules[sourceModuleIndex].items = newModules[sourceModuleIndex].items.filter(i => i.id !== draggedItem.id);

            // Add to destination
            if (targetType === 'module') {
                // Append to end of module
                newModules[destModuleIndex].items.push(itemToMove);
            } else {
                // Insert before/after target item
                const targetItemIndex = newModules[destModuleIndex].items.findIndex(i => i.id === targetId);
                // For simplicity, inserting before. Usually we calculate position relative to rect center.
                // Standard UI behavior: insert at index
                if (targetItemIndex !== -1) {
                    newModules[destModuleIndex].items.splice(targetItemIndex, 0, itemToMove);
                } else {
                    newModules[destModuleIndex].items.push(itemToMove);
                }
            }
        }

        // Optimistic Update
        setCourse({ ...course, modules: newModules });
        setDraggedItem(null);

        // API Call
        try {
            await api.updateCourseModules(course.id, newModules);
        } catch (error) {
            console.error("Failed to save reordered modules", error);
            alert("Failed to save the new order. Please refresh.");
        }
    };

    // --- End Drag and Drop Handlers ---

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
            const generatedModules = await generateCourseOutline(course.title, aiDescription, num, Array.from(allowedContentTypes));
            
            const allIds = new Set<string>();
            const outlineWithTempIds = generatedModules.map((mod, modIndex) => {
                const modId = `temp-mod-${modIndex}`;
                allIds.add(modId);
                return {
                    ...mod,
                    id: modId,
                    items: mod.items.map((item, itemIndex) => {
                        const itemId = `${modId}-item-${itemIndex}`;
                        allIds.add(itemId);
                        return { ...item, id: itemId };
                    })
                };
            });
            setGeneratedOutline(outlineWithTempIds);
            setSelectedGeneratedIds(allIds);
        } catch (error) {
            console.error(error);
            setGeneratorError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAcceptGeneratedOutline = async () => {
        if (!course || !generatedOutline || !window.confirm('This will replace your current course outline. Are you sure?')) return;
        
        const newModules = generatedOutline.filter(mod => selectedGeneratedIds.has(mod.id)).map(mod => ({
            ...mod,
            id: `mod-${Date.now()}-${Math.random()}`,
            items: mod.items.filter(item => selectedGeneratedIds.has(item.id)).map(item => ({
                ...item,
                id: `item-${Date.now()}-${Math.random()}`
            }))
        }));

        try {
            const updatedCourse = await api.updateCourseModules(course.id, newModules);
            setCourse(updatedCourse);
            setGeneratorOpen(false);
            setGeneratedOutline(null);
        } catch(error) {
            console.error("Failed to save new outline", error);
            setGeneratorError("Could not save the new outline. Please try again.");
        }
    };
    
    const handleGeneratedSelection = (id: string, isModule: boolean) => {
        setSelectedGeneratedIds(prev => {
            const newSet = new Set(prev);
            const module = generatedOutline?.find(m => m.id === (isModule ? id : id.split('-item-')[0]));

            if (newSet.has(id)) { // Deselecting
                newSet.delete(id);
                if (isModule && module) { // If deselecting a module, deselect its items
                    module.items.forEach(item => newSet.delete(item.id));
                }
            } else { // Selecting
                newSet.add(id);
                if (isModule && module) { // If selecting a module, select its items
                    module.items.forEach(item => newSet.add(item.id));
                }
            }
            return newSet;
        });
    };

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

    const handleOpenSettingsModal = (item: ContentItem) => {
        if (isReadOnly) return;
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
    
    const handleModuleAdded = async (newModule: Module) => {
        if (!course) return;
    
        const moduleWithIds: Module = {
            ...newModule,
            id: `mod-${Date.now()}`,
            items: newModule.items.map((item, index) => ({
                ...item,
                id: `item-${Date.now()}-${index}`
            }))
        };
        
        const updatedModules = [...(course.modules || []), moduleWithIds];
    
        try {
            const updatedCourse = await api.updateCourseModules(course.id, updatedModules);
            setCourse(updatedCourse);
            setIsAddModuleModalOpen(false);
        } catch (error) {
            console.error("Failed to add new module", error);
            alert("Could not add the new module. Please try again.");
        }
    };
    
    const handleOpenContentItemModal = (module: Module) => {
        if (isReadOnly) return;
        setCurrentModuleForAddItem(module);
        setAddContentItemModalOpen(true);
    };

    const handleItemsAdded = async (newItems: Omit<ContentItem, 'id'>[]) => {
        if (!course || !currentModuleForAddItem) return;

        const itemsWithIds: ContentItem[] = newItems.map((item, index) => ({
            ...item,
            id: `item-${Date.now()}-${index}`
        }));

        const updatedModules = course.modules?.map(module => {
            if (module.id === currentModuleForAddItem.id) {
                return {
                    ...module,
                    items: [...module.items, ...itemsWithIds]
                };
            }
            return module;
        });

        if (!updatedModules) return;
        
        try {
            const updatedCourse = await api.updateCourseModules(course.id, updatedModules);
            setCourse(updatedCourse);
            setAddContentItemModalOpen(false);
        } catch (error) {
            console.error("Failed to add new content items", error);
            alert("Could not add the new items. Please try again.");
        }
    };

    const handleSaveContent = async () => {
        if (!editingContentItem) return;
        setIsSavingContent(true);
        try {
            await api.updateContentItemDetails(editingContentItem.id, editorContent);
            setEditingContentItem(null); // Close modal
        } catch (error) {
            console.error("Failed to save content", error);
            alert("Failed to save content. Please try again.");
        } finally {
            setIsSavingContent(false);
        }
    };

    const handleSaveVideoItem = async (updatedItem: Omit<ContentItem, 'id'>) => {
        if (!course || !editingVideoItem) return;

        const updatedModules = course.modules?.map(module => ({
            ...module,
            items: module.items.map(item => 
                item.id === editingVideoItem.id 
                ? { ...item, ...updatedItem } 
                : item
            ),
        }));

        if (!updatedModules) return;

        try {
            const updatedCourse = await api.updateCourseModules(course.id, updatedModules);
            setCourse(updatedCourse);
            setEditingVideoItem(null);
        } catch (error) {
            console.error("Failed to save video item", error);
            alert("Could not save changes. Please try again.");
        }
    };

    const handleSaveOfflineSession = async (updatedItem: Omit<ContentItem, 'id'>) => {
        if (!course || !editingOfflineSession) return;

        const updatedModules = course.modules?.map(module => ({
            ...module,
            items: module.items.map(item => 
                item.id === editingOfflineSession.id 
                ? { ...item, ...updatedItem } 
                : item
            ),
        }));

        if (!updatedModules) return;

        try {
            const updatedCourse = await api.updateCourseModules(course.id, updatedModules);
            setCourse(updatedCourse);
            setEditingOfflineSession(null);
        } catch (error) {
            console.error("Failed to save offline session", error);
            alert("Could not save changes. Please try again.");
        }
    };

    const handleSaveSurveyItem = async (updatedItem: Omit<ContentItem, 'id'>) => {
        if (!course || !editingSurveyItem) return;

        const updatedModules = course.modules?.map(module => ({
            ...module,
            items: module.items.map(item => 
                item.id === editingSurveyItem.id 
                ? { ...item, ...updatedItem } 
                : item
            ),
        }));

        if (!updatedModules) return;

        try {
            const updatedCourse = await api.updateCourseModules(course.id, updatedModules);
            setCourse(updatedCourse);
            setEditingSurveyItem(null);
        } catch (error) {
            console.error("Failed to save survey", error);
            alert("Could not save changes. Please try again.");
        }
    };

    const handleOpenEditModule = (module: Module) => {
        if (isReadOnly) return;
        setEditingModule(module);
        setEditModuleTitle(module.title);
    };

    const handleUpdateModule = async () => {
        if (!course || !editingModule || !editModuleTitle.trim()) return;

        const updatedModules = course.modules?.map(m =>
            m.id === editingModule.id ? { ...m, title: editModuleTitle } : m
        );

        if (!updatedModules) return;

        try {
            const updatedCourse = await api.updateCourseModules(course.id, updatedModules);
            setCourse(updatedCourse);
            setEditingModule(null);
        } catch (error) {
            console.error("Failed to update module", error);
            alert("Failed to update module. Please try again.");
        }
    };

    const handleDeleteModule = async () => {
        if (!course || !editingModule) return;
        if (!window.confirm("Are you sure you want to delete this module and all its content?")) return;

        const updatedModules = course.modules?.filter(m => m.id !== editingModule.id);

        if (!updatedModules) return;

        try {
            const updatedCourse = await api.updateCourseModules(course.id, updatedModules);
            setCourse(updatedCourse);
            setEditingModule(null);
        } catch (error) {
            console.error("Failed to delete module", error);
            alert("Failed to delete module. Please try again.");
        }
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
                <Link to="/instructor/courses" className="text-sm text-secondary dark:text-blue-400 hover:underline mb-2 inline-block">&larr; Back to My Courses</Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{course.title}</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">{course.description}</p>
                    </div>
                    {isReadOnly && (
                        <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-md flex items-center">
                            <Icon name="Lock" className="h-5 w-5 mr-2" />
                            <span className="font-bold text-sm">Read Only: Pending Administrator Review. Editing is disabled until this course is approved.</span>
                        </div>
                    )}
                </div>
            </div>

            {!isReadOnly && (
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 my-6">
                    <button
                        onClick={handleOpenHistory}
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 px-5 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 flex items-center justify-center"
                        title="View Version History"
                    >
                        <Icon name="History" className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => { setGeneratedOutline(null); setGeneratorOpen(true); }}
                        className="w-full sm:w-auto bg-primary text-gray-800 font-bold py-3 px-5 rounded-lg shadow-sm hover:bg-primary-dark transition duration-300 flex items-center justify-center">
                        <Icon name="Sparkles" className="h-5 w-5 mr-2" />
                        Generate Full Outline with AI
                    </button>
                    <button 
                        onClick={() => setIsAddModuleModalOpen(true)}
                        className="w-full sm:w-auto bg-white dark:bg-gray-800 text-secondary dark:text-blue-400 font-bold py-3 px-5 rounded-lg shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-secondary-light dark:hover:bg-secondary/20 transition duration-300">
                        + Add New Module
                    </button>
                </div>
            )}
            
            <div className="space-y-6">
                 {course.modules?.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed dark:border-gray-700">
                        <Icon name="BookOpen" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Your course outline is empty</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a new module manually or use AI to generate a starting point.</p>
                    </div>
                ) : course.modules?.map(module => (
                    <div 
                        key={module.id} 
                        draggable={!isReadOnly}
                        onDragStart={(e) => handleDragStart(e, module.id, 'module')}
                        onDragOver={(e) => handleDragOver(e, module.id)}
                        onDrop={(e) => handleDrop(e, module.id, 'module')}
                        className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border transition-all duration-200 ${
                            draggedItem?.id === module.id ? 'opacity-50 border-dashed border-gray-400' : 
                            dragOverTargetId === module.id ? 'border-primary border-2 dark:border-primary' : 'dark:border-gray-700'
                        } ${isReadOnly ? '' : 'cursor-grab active:cursor-grabbing'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                             <div className="flex items-center">
                                {!isReadOnly && <Icon name="GripVertical" className="h-5 w-5 text-gray-400 mr-2" />}
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{module.title}</h3>
                            </div>
                            {!isReadOnly && (
                                <button onClick={() => handleOpenEditModule(module)} className="text-sm font-medium text-secondary dark:text-blue-400 hover:underline">Edit Module</button>
                            )}
                        </div>
                        
                        <div className="space-y-2 pl-7 min-h-[50px]" onDragOver={(e) => {
                            if (draggedItem?.type === 'item' && draggedItem.moduleId !== module.id) {
                                // Allow dropping items into empty module space
                                handleDragOver(e, module.id);
                            }
                        }} onDrop={(e) => {
                             if (draggedItem?.type === 'item') {
                                handleDrop(e, module.id, 'module');
                             }
                        }}>
                            {module.items.map(item => (
                                <div 
                                    key={item.id} 
                                    draggable={!isReadOnly}
                                    onDragStart={(e) => handleDragStart(e, item.id, 'item', module.id)}
                                    onDragOver={(e) => handleDragOver(e, item.id)}
                                    onDrop={(e) => handleDrop(e, item.id, 'item', module.id)}
                                    className={`flex items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border transition-all duration-200 ${
                                        draggedItem?.id === item.id ? 'opacity-50' : 
                                        dragOverTargetId === item.id ? 'border-primary border-dashed border-2' : 'dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    } ${isReadOnly ? '' : 'cursor-grab active:cursor-grabbing'}`}
                                >
                                    {!isReadOnly && <Icon name="GripVertical" className="h-5 w-5 text-gray-400" />}
                                    <Icon name={contentIconMap[item.type] || 'FileText'} className="h-5 w-5 text-gray-500 dark:text-gray-400 mx-3" />
                                    <span className="flex-grow text-gray-700 dark:text-gray-300">{item.title}</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 capitalize mr-4">{item.type} {item.type === 'quiz' && `(${item.questionIds?.length || 0} Qs)`}</span>
                                    
                                    {!isReadOnly ? (
                                        <>
                                            {item.type === ContentType.Discussion ? (
                                                <button onClick={() => setViewingDiscussion(item)} className="text-xs font-medium text-secondary dark:text-blue-400 hover:underline">
                                                    View Discussion
                                                </button>
                                            ) : (item.type === 'quiz' || item.type === 'assignment') ? (
                                                <button onClick={() => handleOpenSettingsModal(item)} className="text-xs font-medium text-secondary dark:text-blue-400 hover:underline">
                                                    Manage Settings
                                                </button>
                                            ) : (item.type === ContentType.Lesson || item.type === ContentType.Resource) ? (
                                                <button onClick={() => setEditingContentItem(item)} className="text-xs font-medium text-secondary dark:text-blue-400 hover:underline">
                                                    Edit Content
                                                </button>
                                            ) : (item.type === ContentType.InteractiveVideo) ? (
                                                <button onClick={() => setEditingVideoItem(item)} className="text-xs font-medium text-secondary dark:text-blue-400 hover:underline">
                                                    Edit Video
                                                </button>
                                            ) : (item.type === ContentType.OfflineSession) ? (
                                                <button onClick={() => setEditingOfflineSession(item)} className="text-xs font-medium text-secondary dark:text-blue-400 hover:underline">
                                                    Edit Session
                                                </button>
                                            ) : (item.type === ContentType.Survey) ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingSurveyItem(item)} className="text-xs font-medium text-secondary dark:text-blue-400 hover:underline">
                                                        Edit Survey
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button onClick={() => setViewingSurveyResults(item)} className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline">
                                                        View Results
                                                    </button>
                                                </div>
                                            ) : null}
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">View Only</span>
                                    )}
                                </div>
                            ))}
                              {!isReadOnly && (
                                <button onClick={() => handleOpenContentItemModal(module)} className="w-full text-left text-sm text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-blue-400 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md mt-2">
                                    + Add Content Item
                                </button>
                              )}
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Outline Generator Modal */}
            <Modal isOpen={isGeneratorOpen} onClose={() => setGeneratorOpen(false)} title="Generate Course Outline with AI" size="3xl">
                <div className="space-y-4">
                    {generatorError && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">{generatorError}</p>}
                    
                    {isGenerating ? ( <div className="text-center p-8">Generating outline...</div> ) : 
                     !generatedOutline ? (
                        <>
                            <div>
                                <label htmlFor="ai-desc-full" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Description</label>
                                <textarea id="ai-desc-full" rows={4} value={aiDescription} onChange={e => setAiDescription(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Provide a detailed description for the AI to generate a better outline." />
                            </div>
                            <div>
                                <label htmlFor="num-modules" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Modules</label>
                                <input type="number" id="num-modules" value={numModules} onChange={e => setNumModules(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" min="1" max="20" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowed Content Types</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                    {Object.values(ContentType).map(type => (
                                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" checked={allowedContentTypes.has(type)} onChange={() => handleContentTypeToggle(type)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-500 rounded"/>
                                            <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button onClick={handleGenerateOutline} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                                    <Icon name="Sparkles" className="h-5 w-5 mr-2" /> Generate Outline
                                </button>
                            </div>
                        </>
                    ) : (
                        <div>
                             <h3 className="font-bold text-lg dark:text-gray-200">Generated Outline</h3>
                             <p className="text-sm text-gray-600 dark:text-gray-400">Select the modules and items you want to include.</p>
                             <div className="space-y-2 mt-4 max-h-96 overflow-y-auto border dark:border-gray-600 rounded-md p-2">
                                {generatedOutline.map(mod => (
                                    <div key={mod.id}>
                                        <label className="flex items-center p-2 rounded-md bg-gray-100 dark:bg-gray-700 font-bold cursor-pointer">
                                            <input type="checkbox" checked={selectedGeneratedIds.has(mod.id)} onChange={() => handleGeneratedSelection(mod.id, true)} className="h-4 w-4 text-primary rounded" />
                                            <span className="ml-3">{mod.title}</span>
                                        </label>
                                        <div className="pl-8 mt-1 space-y-1">
                                            {mod.items.map(item => (
                                                <label key={item.id} className="flex items-center p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                                    <input type="checkbox" checked={selectedGeneratedIds.has(item.id)} onChange={() => handleGeneratedSelection(item.id, false)} className="h-4 w-4 text-primary rounded" />
                                                    <Icon name={contentIconMap[item.type]} className="h-4 w-4 mx-2 text-gray-500" />
                                                    <span className="text-sm">{item.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                             </div>
                            <div className="pt-4 mt-4 border-t dark:border-gray-700 flex justify-between items-center">
                                <button onClick={() => setGeneratedOutline(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    &larr; Back
                                </button>
                                <button onClick={handleAcceptGeneratedOutline} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark">
                                    Replace Outline with Selected
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
            
            <AddModuleModal isOpen={isAddModuleModalOpen} onClose={() => setIsAddModuleModalOpen(false)} courseTitle={course.title} onModuleAdded={handleModuleAdded} />

            {currentModuleForAddItem && (
                <AddContentItemModal 
                    isOpen={isAddContentItemModalOpen} 
                    onClose={() => setAddContentItemModalOpen(false)} 
                    courseTitle={course.title} 
                    moduleTitle={currentModuleForAddItem.title} 
                    onItemsAdded={handleItemsAdded} 
                />
            )}

            {viewingDiscussion && (
                <Modal isOpen={!!viewingDiscussion} onClose={() => setViewingDiscussion(null)} title={`Discussion: ${viewingDiscussion.title}`} size="5xl">
                    <div className="h-[75vh]">
                        <DiscussionBoard
                            discussionId={viewingDiscussion.id}
                            promptContent={discussionPrompt}
                            isLoadingPrompt={isLoadingPrompt}
                        />
                    </div>
                </Modal>
            )}

            {/* Edit Content Modal with Rich Text Editor */}
            {editingContentItem && (
                <Modal isOpen={!!editingContentItem} onClose={() => setEditingContentItem(null)} title={`Edit Content: ${editingContentItem.title}`} size="5xl">
                    <div className="flex flex-col h-[70vh]">
                        <div className="flex-grow mb-4">
                            <RichTextEditor 
                                initialContent={editorContent} 
                                onChange={setEditorContent} 
                                placeholder="Start writing your lesson content here..." 
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                            <button onClick={() => setEditingContentItem(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                Cancel
                            </button>
                            <button onClick={handleSaveContent} disabled={isSavingContent} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary rounded-md hover:bg-primary-dark disabled:bg-gray-300">
                                {isSavingContent ? 'Saving...' : 'Save Content'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Video Quiz Editor Modal */}
            {editingVideoItem && (
                <Modal isOpen={!!editingVideoItem} onClose={() => setEditingVideoItem(null)} title={`Edit Interactive Video: ${editingVideoItem.title}`} size="5xl">
                    <div className="h-[70vh]">
                        <VideoQuizEditor 
                            initialItem={editingVideoItem}
                            onSave={handleSaveVideoItem}
                            onCancel={() => setEditingVideoItem(null)}
                        />
                    </div>
                </Modal>
            )}

            {/* Offline Session Editor Modal */}
            {editingOfflineSession && (
                <Modal isOpen={!!editingOfflineSession} onClose={() => setEditingOfflineSession(null)} title={`Edit Offline Session: ${editingOfflineSession.title}`} size="3xl">
                    <div className="h-auto">
                        <OfflineSessionEditor 
                            initialItem={editingOfflineSession}
                            onSave={handleSaveOfflineSession}
                            onCancel={() => setEditingOfflineSession(null)}
                        />
                    </div>
                </Modal>
            )}

            {/* Survey Editor Modal */}
            {editingSurveyItem && (
                <Modal isOpen={!!editingSurveyItem} onClose={() => setEditingSurveyItem(null)} title={`Edit Survey: ${editingSurveyItem.title}`} size="4xl">
                    <div className="h-[70vh]">
                        <SurveyEditor 
                            initialItem={editingSurveyItem}
                            onSave={handleSaveSurveyItem}
                            onCancel={() => setEditingSurveyItem(null)}
                        />
                    </div>
                </Modal>
            )}

            {/* Survey Results Modal */}
            {viewingSurveyResults && (
                <Modal isOpen={!!viewingSurveyResults} onClose={() => setViewingSurveyResults(null)} title="Survey Results" size="5xl">
                    <div className="h-[70vh] overflow-y-auto">
                        <SurveyResults surveyId={viewingSurveyResults.id} />
                    </div>
                </Modal>
            )}
            
            {/* Edit Module Modal */}
            {editingModule && (
                <Modal isOpen={!!editingModule} onClose={() => setEditingModule(null)} title="Edit Module">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module Title</label>
                            <input
                                type="text"
                                value={editModuleTitle}
                                onChange={(e) => setEditModuleTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <button onClick={handleDeleteModule} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center">
                                <Icon name="X" className="h-4 w-4 mr-1" /> Delete Module
                            </button>
                            <div className="flex space-x-2">
                                <button onClick={() => setEditingModule(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                                <button onClick={handleUpdateModule} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary rounded-md hover:bg-primary-dark">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Settings Modal for Quiz/Assignment */}
            {currentItem && (
                <Modal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} title={`Settings for "${currentItem.title}"`} size="4xl">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {currentItem.type === 'quiz' && (
                             <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (minutes)</label>
                                        <input type="number" name="timeLimit" value={itemFormData.timeLimit || ''} onChange={handleItemFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" />
                                    </div>
                                    <div>
                                        <label htmlFor="attemptsLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attempts Allowed</label>
                                        <input type="number" name="attemptsLimit" value={itemFormData.attemptsLimit || ''} onChange={handleItemFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" />
                                    </div>
                                </div>
                                 <div className="flex items-center">
                                    <input type="checkbox" name="randomizeQuestions" checked={itemFormData.randomizeQuestions} onChange={handleItemFormChange} className="h-4 w-4 text-primary rounded" />
                                    <label htmlFor="randomizeQuestions" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Randomize question order</label>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2 dark:text-gray-100">Questions ({itemFormData.selectedQuestionIds.size} selected)</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto border dark:border-gray-600 p-2 rounded-md">
                                        {instructorQuestions.map(q => (
                                            <label key={q.id} className="flex items-start p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md cursor-pointer">
                                                <input type="checkbox" checked={itemFormData.selectedQuestionIds.has(q.id)} onChange={() => handleQuizQuestionToggle(q.id)} className="h-4 w-4 text-primary mt-1" />
                                                <div className="ml-3 text-sm">
                                                    <p className="font-medium text-gray-900 dark:text-gray-200">{q.stem}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{q.type.replace('-', ' ')}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {currentItem.type === 'assignment' && (
                            <div>
                                 <label htmlFor="rubricId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grading Rubric</label>
                                <select name="rubricId" value={itemFormData.rubricId || ''} onChange={handleItemFormChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md">
                                    <option value="">None (score out of 100)</option>
                                    {instructorRubrics.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="pt-4 mt-4 border-t dark:border-gray-700 flex justify-end">
                        <button onClick={handleSaveItemSettings} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark">Save Settings</button>
                    </div>
                </Modal>
            )}

            {/* Version History Modal */}
            <VersionHistoryModal 
                isOpen={isHistoryModalOpen} 
                onClose={() => setIsHistoryModalOpen(false)} 
                history={history} 
                onRestore={handleRestoreVersion}
                isRestoring={isRestoring}
            />
        </div>
    );
};

export default CourseBuilderPage;
