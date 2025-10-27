import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import { Course, ContentItem, ContentType } from '../../types';
import { Icon, IconName } from '../../components/icons';
import { DiscussionBoard } from '../../components/common/DiscussionBoard';
import { QuizTaker } from '../../components/common/QuizTaker';

const CourseViewerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

    useEffect(() => {
        if (!courseId) return;
        const fetchCourse = async () => {
            try {
                const data = await api.getCourseDetails(courseId);
                setCourse(data);
                // Select the first item by default
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

    const contentIconMap: Record<ContentType, IconName> = {
        [ContentType.Lesson]: 'FileText',
        [ContentType.Quiz]: 'ClipboardCheck',
        [ContentType.Assignment]: 'PenSquare',
        [ContentType.Discussion]: 'MessageSquare',
        [ContentType.Resource]: 'Link',
    };

    const handleQuizComplete = () => {
        alert("Quiz completed! Your grade has been saved.");
        // Potentially refresh grades data or navigate away
    };

    const renderContent = () => {
        if (!selectedItem) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Icon name="BookOpen" className="h-16 w-16 mb-4" />
                    <h2 className="text-xl font-medium">Welcome to {course?.title}</h2>
                    <p>Select an item from the sidebar to begin learning.</p>
                </div>
            );
        }

        if (selectedItem.type === ContentType.Discussion) {
            return <DiscussionBoard discussionId={selectedItem.id} />;
        }

        if (selectedItem.type === ContentType.Quiz) {
            // Fix: Pass the entire selectedItem object to the quizItem prop to match the component's expected interface.
            return <QuizTaker 
                        courseId={courseId!}
                        quizItem={selectedItem}
                        onComplete={handleQuizComplete} 
                    />;
        }
        
        return (
            <div>
                <div className="flex items-center mb-4">
                    <Icon name={contentIconMap[selectedItem.type] || 'FileText'} className="h-6 w-6 text-secondary mr-3" />
                    <div>
                        <p className="text-sm text-gray-500 capitalize">{selectedItem.type}</p>
                        <h1 className="text-3xl font-bold text-gray-800">{selectedItem.title}</h1>
                    </div>
                </div>
                <div className="mt-6 prose max-w-none">
                    <p>This is the placeholder content for the {selectedItem.type}: <strong>{selectedItem.title}</strong>.</p>
                    <p>In a real application, lesson text, quiz questions, or assignment details would be loaded and displayed here.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.</p>
                </div>
            </div>
        );
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Loading course...</div>;
    if (!course) return <div className="flex h-screen items-center justify-center">Course not found.</div>;

    return (
        <div>
            <Link to="/my-courses" className="text-sm text-secondary hover:underline mb-4 inline-block">&larr; Back to My Courses</Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm self-start sticky top-24">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{course.title}</h2>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `75%` }}></div>
                    </div>
                    <nav className="space-y-4">
                        {course.modules?.map(module => (
                            <div key={module.id}>
                                <h3 className="font-bold text-gray-600 mb-2">{module.title}</h3>
                                <ul className="space-y-1">
                                    {module.items.map(item => (
                                        <li key={item.id}>
                                            <button 
                                                onClick={() => setSelectedItem(item)}
                                                className={`w-full flex items-center text-left p-2 rounded-md text-sm transition-colors ${
                                                    selectedItem?.id === item.id ? 'bg-secondary-light text-secondary font-bold' : 'text-gray-700 hover:bg-gray-100'
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
                <main className="lg:col-span-3">
                    <div className="bg-white p-6 rounded-lg shadow-sm min-h-[60vh]">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CourseViewerPage;