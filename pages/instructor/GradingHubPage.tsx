import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Icon, IconName } from '../../components/icons';
import * as api from '../../services/api';
import {
    CourseGradingSummary,
    GradableItemSummary,
    StudentSubmissionDetails,
    ContentType,
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ManualGrader } from '../../components/common/ManualGrader';

const GradingHubPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<CourseGradingSummary[]>([]);
    
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    
    const [submissionDetails, setSubmissionDetails] = useState<StudentSubmissionDetails[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState<'needsGrading' | 'graded' | 'notSubmitted'>('needsGrading');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    
    // Communication State
    const [showCommunicate, setShowCommunicate] = useState(false);
    const [commSubject, setCommSubject] = useState('');
    const [commMessage, setCommMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    // Grader Modal State
    const [isGraderOpen, setIsGraderOpen] = useState(false);
    const [gradingInfo, setGradingInfo] = useState<{ submissionId: string, studentName: string } | null>(null);


    useEffect(() => {
        if (!user) return;
        api.getInstructorGradingSummary(user.id)
            .then(data => {
                setSummaryData(data);
                if (data.length > 0) {
                    setSelectedCourseId(data[0].courseId);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);
    
    useEffect(() => {
        if (!selectedItemId) {
            setSubmissionDetails([]);
            return;
        }

        setLoadingSubmissions(true);
        api.getSubmissionsForContentItem(selectedItemId)
            .then(data => {
                setSubmissionDetails(data);
                setActiveTab('needsGrading'); // Reset tab on item change
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingSubmissions(false));

    }, [selectedItemId]);
    
    const selectedCourse = useMemo(() => summaryData.find(c => c.courseId === selectedCourseId), [summaryData, selectedCourseId]);
    const selectedItem = useMemo(() => selectedCourse?.items.find(i => i.id === selectedItemId), [selectedCourse, selectedItemId]);
    
    const { needsGrading, graded, notSubmitted } = useMemo(() => {
        const needsGrading: StudentSubmissionDetails[] = [];
        const graded: StudentSubmissionDetails[] = [];
        const notSubmitted: StudentSubmissionDetails[] = [];

        submissionDetails.forEach(detail => {
            if (!detail.submission) {
                notSubmitted.push(detail);
            } else if (detail.grade && detail.grade.status === 'graded') {
                graded.push(detail);
            } else {
                needsGrading.push(detail);
            }
        });
        return { needsGrading, graded, notSubmitted };
    }, [submissionDetails]);

    const activeList = useMemo(() => {
        switch (activeTab) {
            case 'needsGrading': return needsGrading;
            case 'graded': return graded;
            case 'notSubmitted': return notSubmitted;
            default: return [];
        }
    }, [activeTab, needsGrading, graded, notSubmitted]);
    
    const handleStudentSelect = (studentId: string) => {
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedStudentIds.size === activeList.length) {
            setSelectedStudentIds(new Set());
        } else {
            setSelectedStudentIds(new Set(activeList.map(s => s.student.id)));
        }
    };
    
    const handleGraderClose = (wasUpdated: boolean) => {
        setIsGraderOpen(false);
        setGradingInfo(null);
        if (wasUpdated && user) {
            // Refresh summary and submission details
             api.getInstructorGradingSummary(user.id).then(setSummaryData);
             api.getSubmissionsForContentItem(selectedItemId!).then(setSubmissionDetails);
        }
    };
    
    if (loading) return <div>Loading Grading Hub...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <PageHeader title="Grading Hub" subtitle="A centralized dashboard to view, grade, and manage all student submissions." />
            
            <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                {/* Column 1: Courses */}
                <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col overflow-y-auto">
                    <h2 className="p-4 text-lg font-bold border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">My Courses</h2>
                    <nav className="flex-1">
                        {summaryData.map(course => (
                            <button key={course.courseId} onClick={() => { setSelectedCourseId(course.courseId); setSelectedItemId(null); }} className={`w-full text-left p-4 text-sm font-medium transition-colors ${selectedCourseId === course.courseId ? 'bg-secondary-light dark:bg-secondary/20 text-secondary dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                {course.courseTitle}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Column 2: Gradable Items */}
                <div className="col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col overflow-y-auto">
                    <h2 className="p-4 text-lg font-bold border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">{selectedCourse?.courseTitle || 'Select a Course'}</h2>
                    {selectedCourse ? (
                        <div className="p-4 space-y-3">
                            {selectedCourse.items.map(item => <GradableItemCard key={item.id} item={item} isSelected={selectedItemId === item.id} onSelect={() => setSelectedItemId(item.id)} />)}
                        </div>
                    ) : <div className="p-4 text-center text-gray-500">Select a course to see its gradable items.</div>}
                </div>

                {/* Column 3: Submission Details */}
                <div className="col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col overflow-hidden">
                    {!selectedItem ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8">
                            <Icon name="PenSquare" className="h-16 w-16 mb-4" />
                            <h2 className="text-xl font-medium">Select an item to view submissions</h2>
                            <p>Choose an assignment, quiz, or discussion from the list to begin grading.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b dark:border-gray-700">
                                <h3 className="text-lg font-bold">{selectedItem.title}</h3>
                                <p className="text-sm text-gray-500">Due: {new Date(selectedItem.dueDate).toLocaleString()}</p>
                            </div>

                            {loadingSubmissions ? <div>Loading submissions...</div> : (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="p-4 grid grid-cols-3 gap-4">
                                        <StatCard title="Needs Grading" value={needsGrading.length.toString()} color="warning" />
                                        <StatCard title="Graded" value={graded.length.toString()} color="success" />
                                        <StatCard title="Not Submitted" value={notSubmitted.length.toString()} color="info" />
                                    </div>

                                    <div className="px-4 border-b dark:border-gray-700">
                                        <nav className="-mb-px flex space-x-6">
                                            <TabButton title="Needs Grading" count={needsGrading.length} isActive={activeTab==='needsGrading'} onClick={() => setActiveTab('needsGrading')} />
                                            <TabButton title="Graded" count={graded.length} isActive={activeTab==='graded'} onClick={() => setActiveTab('graded')} />
                                            <TabButton title="Not Submitted" count={notSubmitted.length} isActive={activeTab==='notSubmitted'} onClick={() => setActiveTab('notSubmitted')} />
                                        </nav>
                                    </div>

                                    {/* Student List Table */}
                                    <div className="p-4">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="p-2 w-8"><input type="checkbox" checked={selectedStudentIds.size === activeList.length && activeList.length > 0} onChange={handleSelectAll} /></th>
                                                    <th className="p-2 text-left font-medium">Student</th>
                                                    <th className="p-2 text-left font-medium">Submitted</th>
                                                    <th className="p-2 text-left font-medium">Grade</th>
                                                    <th className="p-2 text-left font-medium">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeList.map(detail => (
                                                    <tr key={detail.student.id} className="border-b dark:border-gray-700">
                                                        <td className="p-2"><input type="checkbox" checked={selectedStudentIds.has(detail.student.id)} onChange={() => handleStudentSelect(detail.student.id)} /></td>
                                                        <td className="p-2 flex items-center gap-2">
                                                            <img src={detail.student.avatarUrl} alt={detail.student.name} className="w-8 h-8 rounded-full" />
                                                            {detail.student.name}
                                                        </td>
                                                        <td className="p-2">{detail.submission ? new Date(detail.submission.submittedAt).toLocaleString() : '—'}</td>
                                                        <td className="p-2">{detail.grade?.score ?? '—'}</td>
                                                        <td className="p-2">
                                                            {activeTab === 'needsGrading' && detail.submission && (
                                                                <button onClick={() => { setGradingInfo({ studentName: detail.student.name, submissionId: detail.grade!.submissionId! }); setIsGraderOpen(true); }} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Grade</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                             {isGraderOpen && gradingInfo && <ManualGrader isOpen={isGraderOpen} onClose={handleGraderClose} {...gradingInfo} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-components for GradingHubPage
const GradableItemCard: React.FC<{item: GradableItemSummary, isSelected: boolean, onSelect: () => void}> = ({ item, isSelected, onSelect }) => {
    const iconMap: Record<ContentType, IconName> = {
        [ContentType.Assignment]: 'PenSquare',
        [ContentType.Quiz]: 'ClipboardCheck',
        [ContentType.Discussion]: 'MessageSquare',
        [ContentType.Examination]: 'ListChecks',
        [ContentType.Lesson]: 'FileText',
        [ContentType.Resource]: 'Link',
    };
    return (
        <button onClick={onSelect} className={`w-full p-4 border rounded-lg text-left transition-all ${isSelected ? 'bg-secondary-light dark:bg-secondary/20 ring-2 ring-secondary' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
            <div className="flex items-start gap-3">
                <Icon name={iconMap[item.type]} className="h-5 w-5 mt-0.5 text-secondary dark:text-blue-400" />
                <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.type} &bull; Due {new Date(item.dueDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                    <span>{item.submittedCount} / {item.totalEnrolled} Submitted</span>
                    <span>{Math.round((item.submittedCount / item.totalEnrolled) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{width: `${(item.submittedCount / item.totalEnrolled) * 100}%`}}></div>
                </div>
            </div>
        </button>
    );
};

const StatCard: React.FC<{title:string, value:string, color: 'warning' | 'success' | 'info'}> = ({ title, value, color }) => {
    const colors = {
        warning: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
        success: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
        info: 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300',
    }
    return (
        <div className={`p-4 rounded-lg ${colors[color]}`}>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
};

const TabButton: React.FC<{title:string, count: number, isActive: boolean, onClick: ()=>void}> = ({ title, count, isActive, onClick }) => (
    <button onClick={onClick} className={`py-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 ${isActive ? 'border-primary text-secondary dark:text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}>
        {title}
        <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-primary text-gray-800' : 'bg-gray-200 dark:bg-gray-600'}`}>{count}</span>
    </button>
);

export default GradingHubPage;