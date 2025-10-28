import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { Course, ContentItem, ContentType, ContentItemDetails } from '../../types';
import { Icon, IconName } from '../../components/icons';
import { DiscussionBoard } from '../../components/common/DiscussionBoard';
import { QuizTaker } from '../../components/common/QuizTaker';
import { useAuth } from '../../contexts/AuthContext';
import { AssignmentUploader } from '../../components/common/AssignmentUploader';

const CourseViewerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
    const [itemContent, setItemContent] = useState<ContentItemDetails | null>(null);
    const [itemLoading, setItemLoading] = useState(false);

    useEffect(() => {
        if (!courseId) return;
        const fetchCourse = async () => {
            try {
                const data = await api.getCourseDetails(courseId);
                setCourse(data);
                if (data?.modules && data.modules.length > 0 && data.modules[0].items.length > 0) {
                    setSelectedItem(data.modules[0].items[0]);
                }
            } catch (error) {
                console.error("Failed to fetch course details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (selectedItem) {
            // Only skip content fetching for components that handle their own full-screen state
            if (selectedItem.type === ContentType.Quiz || selectedItem.type === ContentType.Examination || (selectedItem.type === ContentType.Assignment && selectedItem.requiresFileUpload)) {
                setItemContent(null);
            } else {
                // Fetch content for Lessons, Resources, and now Discussions prompts
                const fetchContent = async () => {
                    setItemLoading(true);
                    try {
                        const data = await api.getContentItemDetails(selectedItem.id);
                        setItemContent(data);
                    } catch (error) {
                        console.error("Failed to load content:", error);
                        setItemContent({ id: selectedItem.id, content: "<p>Could not load content for this item.</p>" });
                    } finally {
                        setItemLoading(false);
                    }
                };
                fetchContent();
            }
        } else {
            setItemContent(null);
        }
    }, [selectedItem]);


    const allItems = useMemo(() => {
        return course?.modules?.flatMap(m => m.items) || [];
    }, [course]);

    const { currentIndex, prevItem, nextItem } = useMemo(() => {
        if (!selectedItem || allItems.length === 0) {
            return { currentIndex: -1, prevItem: null, nextItem: null };
        }
        const currentIndex = allItems.findIndex(item => item.id === selectedItem.id);
        const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
        const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;
        return { currentIndex, prevItem, nextItem };
    }, [selectedItem, allItems]);


    const contentIconMap: Record<ContentType, IconName> = {
        [ContentType.Lesson]: 'FileText',
        [ContentType.Quiz]: 'ClipboardCheck',
        [ContentType.Assignment]: 'PenSquare',
        [ContentType.Discussion]: 'MessageSquare',
        [ContentType.Resource]: 'Link',
        [ContentType.Examination]: 'ListChecks',
    };

    const handleQuizComplete = () => {
        alert("Quiz completed! Your grade has been saved.");
    };

    const handleMessageInstructor = () => {
        if (!user || !course) return;
        navigate('/my-messages/new', {
            state: {
                prefill: {
                    participantIds: [course.instructorId],
                    subject: `Question about: ${course.title}`,
                },
            },
        });
    };

    const renderContent = () => {
        if (!selectedItem) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                    <Icon name="BookOpen" className="h-16 w-16 mb-4" />
                    <h2 className="text-xl font-medium">Welcome to {course?.title}</h2>
                    <p>Select an item from the sidebar to begin learning.</p>
                </div>
            );
        }

        if (selectedItem.type === ContentType.Discussion) {
            return <DiscussionBoard discussionId={selectedItem.id} promptContent={itemContent} isLoadingPrompt={itemLoading} />;
        }

        if (selectedItem.type === ContentType.Quiz) {
            return <QuizTaker 
                        courseId={courseId!}
                        quizItem={selectedItem}
                        onComplete={handleQuizComplete} 
                    />;
        }

        if (selectedItem.type === ContentType.Examination) {
            return (
                <div className="p-4">
                    <div className="flex items-center mb-4">
                        <Icon name="ListChecks" className="h-8 w-8 text-secondary dark:text-blue-400 mr-4" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedItem.type}</p>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{selectedItem.title}</h1>
                        </div>
                    </div>
                    <div className="mt-6 bg-secondary-light/50 dark:bg-secondary/20 border-l-4 border-secondary p-6 rounded-r-lg">
                        <h3 className="text-xl font-bold text-secondary dark:text-blue-300 mb-2">Formal Examination</h3>
                        <p className="text-gray-700 dark:text-gray-300">This is a formal, timed examination. It will open in a new, full-screen browser tab to provide a distraction-free environment.</p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Please ensure you have a stable internet connection and have set aside enough time before you begin.</p>
                        <button
                            onClick={() => window.open(`/#/exam/${selectedItem.examinationId}`, '_blank')}
                            className="mt-6 bg-primary text-gray-800 font-bold py-3 px-6 rounded-md hover:bg-primary-dark transition duration-300 flex items-center"
                        >
                            <Icon name="PenSquare" className="h-5 w-5 mr-2" />
                            Begin Examination
                        </button>
                    </div>
                </div>
            );
        }

        if (selectedItem.type === ContentType.Assignment && selectedItem.requiresFileUpload) {
            return <AssignmentUploader 
                        assignment={selectedItem}
                        courseId={courseId!}
                        onSubmissionComplete={() => alert("Assignment submitted successfully!")}
                    />
        }
        
        return (
            <div>
                <div className="flex items-center mb-4">
                    <Icon name={contentIconMap[selectedItem.type] || 'FileText'} className="h-6 w-6 text-secondary dark:text-blue-400 mr-3" />
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedItem.type}</p>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{selectedItem.title}</h1>
                    </div>
                </div>
                 {itemLoading ? (
                    <div className="text-center py-8">Loading content...</div>
                ) : itemContent ? (
                    <div
                        className="mt-6 prose prose-sans max-w-none dark:prose-invert 
                        [&_.syllabus-section]:border-gray-200 [&_.syllabus-section]:dark:border-gray-700 
                        [&_.syllabus-header]:text-secondary [&_.syllabus-header]:dark:text-blue-400 
                        [&_table.grading-table_th]:bg-secondary-light/50 [&_table.grading-table_th]:dark:bg-secondary/20 [&_table.grading-table_th]:text-secondary [&_table.grading-table_th]:dark:text-blue-300 
                        [&_table.grading-table_td]:border-gray-200 [&_table.grading-table_td]:dark:border-gray-700
                        [&_.key-concept]:bg-secondary-light/40 [&_.key-concept]:dark:bg-secondary/20 [&_.key-concept]:border-secondary [&_.key-concept]:dark:border-blue-400
                        [&_.code-block]:border-gray-200 [&_.code-block]:dark:border-gray-700
                        [&_.code-header]:bg-gray-100 [&_.code-header]:dark:bg-gray-900 [&_.code-header]:text-gray-500 [&_.code-header]:dark:text-gray-400 [&_.code-header]:border-gray-200 [&_.code-header]:dark:border-gray-700
                        [&_.lesson-section-header]:bg-secondary-light/40 [&_.lesson-section-header]:dark:bg-secondary/20 [&_.lesson-section-header]:border-secondary [&_.lesson-section-header]:dark:border-blue-400 [&_.lesson-section-header]:text-secondary [&_.lesson-section-header]:dark:text-blue-300"
                        dangerouslySetInnerHTML={{ __html: itemContent.content }}
                    />
                ) : (
                    <div className="mt-6 prose max-w-none dark:prose-invert">
                        <p>Content for this item is not available.</p>
                    </div>
                )}
            </div>
        );
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Loading course...</div>;
    if (!course) return <div className="flex h-screen items-center justify-center">Course not found.</div>;

    return (
        <div>
            <Link to="/my-courses" className="text-sm text-secondary dark:text-blue-400 hover:underline mb-4 inline-block">&larr; Back to My Courses</Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm self-start sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 truncate">{course.title}</h2>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `75%` }}></div>
                    </div>
                    <button 
                        onClick={handleMessageInstructor}
                        className="w-full mb-4 bg-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-secondary-dark transition duration-300 flex items-center justify-center text-sm"
                    >
                        <Icon name="MessageSquare" className="h-4 w-4 mr-2" />
                        Message Instructor
                    </button>
                    <nav className="space-y-4">
                        {course.modules?.map(module => (
                            <div key={module.id}>
                                <h3 className="font-bold text-gray-600 dark:text-gray-400 mb-2">{module.title}</h3>
                                <ul className="space-y-1">
                                    {module.items.map(item => (
                                        <li key={item.id}>
                                            <button 
                                                onClick={() => setSelectedItem(item)}
                                                className={`w-full flex items-center text-left p-2 rounded-md text-sm transition-colors ${
                                                    selectedItem?.id === item.id ? 'bg-secondary-light dark:bg-secondary/20 text-secondary dark:text-blue-300 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <Icon name={contentIconMap[item.type] || 'FileText'} className="h-4 w-4 mr-3 flex-shrink-0" />
                                                <span>{item.title}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3 h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="flex-1 p-6 overflow-y-auto">
                        {renderContent()}
                    </div>
                    
                    {selectedItem && (
                        <div className="p-6 border-t dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                            <button
                                onClick={() => prevItem && setSelectedItem(prevItem)}
                                disabled={!prevItem}
                                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Icon name="ChevronLeft" className="h-5 w-5" />
                                Previous
                            </button>
                            <button
                                onClick={() => nextItem && setSelectedItem(nextItem)}
                                disabled={!nextItem}
                                className="flex items-center gap-2 bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <Icon name="ChevronRight" className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseViewerPage;