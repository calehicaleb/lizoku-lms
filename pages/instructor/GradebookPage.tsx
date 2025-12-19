import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Course, ContentItem, Grade, CourseStatus, GradeDispute, DisputeStatus, GradeHistoryEntry } from '../../types';
import { Icon } from '../../components/icons';
import { ManualGrader } from '../../components/common/ManualGrader';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/ui/Modal';

interface StudentGradeData {
    studentId: string;
    studentName: string;
    grades: Record<string, Grade | null>;
}

interface GradebookData {
    gradableItems: ContentItem[];
    studentGrades: StudentGradeData[];
}

const GradebookPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [gradebookData, setGradebookData] = useState<GradebookData | null>(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(false);
    
    // Integrity State
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Manual Grader Modal State
    const [gradingInfo, setGradingInfo] = useState<{ submissionId: string, studentName: string } | null>(null);

    // Dispute Modal State
    const [disputeToResolve, setDisputeToResolve] = useState<GradeDispute | null>(null);
    const [resolutionComment, setResolutionComment] = useState('');
    const [newDisputeScore, setNewDisputeScore] = useState<number>(0);
    const [isResolving, setIsResolving] = useState(false);

    // History Modal State
    const [selectedHistory, setSelectedHistory] = useState<{ studentName: string, itemTitle: string, history: GradeHistoryEntry[] } | null>(null);

    const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);
    const isLocked = selectedCourse?.status === CourseStatus.Finalized || selectedCourse?.status === CourseStatus.Archived;

    const fetchGrades = async (courseId: string) => {
        if (!courseId) return;
        setLoadingGrades(true);
        try {
            const data = await api.getCourseGrades(courseId);
            setGradebookData(data);
        } catch (error) {
            console.error("Failed to fetch gradebook data", error);
        } finally {
            setLoadingGrades(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        const fetchCourses = async () => {
            try {
                const data = await api.getInstructorCourses(user.id);
                setCourses(data);
                if (data.length > 0) {
                    setSelectedCourseId(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [user]);

    useEffect(() => {
        fetchGrades(selectedCourseId);
    }, [selectedCourseId]);
    
    const handleFinalize = async () => {
        if (!selectedCourseId) return;
        if (!window.confirm("ARE YOU SURE? Finalizing will lock the gradebook and push marks to students' permanent transcripts.")) return;
        
        setIsFinalizing(true);
        try {
            const success = await api.finalizeGrades(selectedCourseId);
            if (success) {
                setCourses(prev => prev.map(c => c.id === selectedCourseId ? { ...c, status: CourseStatus.Finalized } : c));
                alert("Gradebook finalized.");
            }
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleOpenDispute = async (disputeId: string, currentScore: number) => {
        const dispute = await api.getGradeDispute(disputeId);
        if (dispute) {
            setDisputeToResolve(dispute);
            setNewDisputeScore(currentScore);
            setResolutionComment('');
        }
    };

    const handleResolveDispute = async (status: DisputeStatus) => {
        if (!disputeToResolve) return;
        setIsResolving(true);
        try {
            await api.resolveDispute(disputeToResolve.id, status, resolutionComment, status === DisputeStatus.Accepted ? newDisputeScore : undefined);
            setDisputeToResolve(null);
            fetchGrades(selectedCourseId);
        } finally {
            setIsResolving(false);
        }
    };

    const handleGradeSave = async (studentId: string, contentItemId: string, scoreStr: string) => {
        if (isLocked) return;
        const score = scoreStr === '' ? null : parseInt(scoreStr, 10);
        
        try {
            await api.updateGrade(studentId, selectedCourseId, contentItemId, score, "Manual update via Gradebook");
        } catch (error) {
            fetchGrades(selectedCourseId); 
        }
    };

    const handleToggleRetake = async (studentId: string, itemId: string, currentVal: boolean) => {
        try {
            await api.toggleAllowRetake(studentId, itemId, !currentVal);
            fetchGrades(selectedCourseId);
        } catch (err) {
            alert("Update failed");
        }
    };
    
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <PageHeader title="Academic Gradebook" subtitle="Official session records and grade integrity management." />
                {!isLocked && selectedCourseId && (
                    <button 
                        onClick={handleFinalize}
                        disabled={isFinalizing}
                        className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 shadow-md flex items-center gap-2 transition-all"
                    >
                        <Icon name="Lock" className="h-5 w-5" />
                        Finalize Session
                    </button>
                )}
                {isLocked && (
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-600">
                        <Icon name="Shield" className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Records Finalized</span>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="mb-4 flex items-center gap-4">
                    <label className="font-medium text-gray-700 dark:text-gray-300">Active Session:</label>
                    <select
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className="w-full max-w-sm px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        disabled={loadingCourses}
                    >
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.semesterName})</option>)}
                    </select>
                </div>

                {loadingGrades ? (
                    <div className="text-center py-12 text-gray-400">Loading academic records...</div>
                ) : gradebookData && (
                    <div className="overflow-x-auto border dark:border-gray-700 rounded-lg shadow-inner">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold border dark:border-gray-700 text-gray-600 dark:text-gray-200">Student Profile</th>
                                    {gradebookData.gradableItems.map(item => (
                                        <th key={item.id} className="px-4 py-3 text-center font-bold border dark:border-gray-700 text-gray-600 dark:text-gray-200">{item.title}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {gradebookData.studentGrades.map(sg => (
                                    <tr key={sg.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="px-4 py-3 font-medium border dark:border-gray-700 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{sg.studentName.charAt(0)}</div>
                                            {sg.studentName}
                                        </td>
                                        {gradebookData.gradableItems.map(item => {
                                            const grade = sg.grades[item.id];
                                            return (
                                                <td key={item.id} className="border dark:border-gray-700 p-0 text-center relative group min-w-[120px]">
                                                    {grade?.isDisputed && (
                                                        <button 
                                                            onClick={() => handleOpenDispute(grade.disputeId!, grade.score || 0)}
                                                            className="absolute top-1 right-1 z-10 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:scale-110 transition-transform border dark:border-gray-600"
                                                        >
                                                            <Icon name="AlertTriangle" className="h-4 w-4 text-orange-500 animate-pulse" />
                                                        </button>
                                                    )}
                                                    
                                                    <div className="flex items-center h-full">
                                                        {grade?.status === 'pending review' && grade.submissionId ? (
                                                            <button 
                                                                disabled={isLocked}
                                                                onClick={() => setGradingInfo({ submissionId: grade.submissionId!, studentName: sg.studentName })}
                                                                className="w-full h-full p-3 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 font-black uppercase tracking-tighter hover:bg-yellow-200 disabled:opacity-50">
                                                                Mark
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    disabled={isLocked}
                                                                    defaultValue={grade?.score ?? ''}
                                                                    onBlur={e => handleGradeSave(sg.studentId, item.id, e.target.value)}
                                                                    className="w-full p-3 bg-transparent text-center focus:bg-primary/10 outline-none disabled:opacity-50 dark:text-gray-200"
                                                                    placeholder="-"
                                                                />
                                                                <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-600">
                                                                     {grade?.history && grade.history.length > 0 && (
                                                                        <button 
                                                                            onClick={() => setSelectedHistory({ studentName: sg.studentName, itemTitle: item.title, history: grade.history! })}
                                                                            className="p-1.5 text-gray-400 hover:text-secondary"
                                                                            title="View Audit Trail"
                                                                        >
                                                                            <Icon name="History" className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                    {!isLocked && (
                                                                        <button 
                                                                            onClick={() => handleToggleRetake(sg.studentId, item.id, !!grade?.canResubmit)}
                                                                            className={`p-1.5 ${grade?.canResubmit ? 'text-green-500' : 'text-gray-400'}`}
                                                                            title="Allow Resubmission Override"
                                                                        >
                                                                            <Icon name="Undo" className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Resolve Dispute Modal */}
            <Modal isOpen={!!disputeToResolve} onClose={() => setDisputeToResolve(null)} title="Academic Regrade Resolution" size="lg">
                {disputeToResolve && (
                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md border-l-4 border-orange-500">
                            <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-widest">Student Justification:</p>
                            <p className="mt-1 text-sm italic text-gray-700 dark:text-gray-300">"{disputeToResolve.studentReason}"</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Score (Percentage)</label>
                            <input type="number" value={newDisputeScore} onChange={e => setNewDisputeScore(Number(e.target.value))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Pedagogical Comment</label>
                            <textarea value={resolutionComment} onChange={e => setResolutionComment(e.target.value)} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary" placeholder="Explain the rationale for this grade adjustment..." />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                            <button onClick={() => handleResolveDispute(DisputeStatus.Rejected)} disabled={isResolving} className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md">Reject Appeal</button>
                            <button onClick={() => handleResolveDispute(DisputeStatus.Accepted)} disabled={isResolving} className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-md">Accept & Adjust Grade</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Grade History Modal */}
            <Modal isOpen={!!selectedHistory} onClose={() => setSelectedHistory(null)} title={`Audit Trail: ${selectedHistory?.studentName}`} size="xl">
                {selectedHistory && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{selectedHistory.itemTitle}</p>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">Log Entries: {selectedHistory.history.length}</span>
                        </div>
                        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-8 pb-4">
                            {selectedHistory.history.slice().reverse().map((entry) => (
                                <div key={entry.id} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white dark:bg-gray-800 border-2 border-primary rounded-full ring-4 ring-white dark:ring-gray-900"></div>
                                    <div className="text-xs text-gray-400 font-medium mb-1">{new Date(entry.timestamp).toLocaleString()}</div>
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-gray-800 dark:text-gray-100">{entry.modifierName}</p>
                                            <div className="flex items-center gap-3 font-mono text-xs">
                                                <span className="text-gray-400 line-through">{entry.oldScore ?? 'Null'}%</span>
                                                <Icon name="ChevronRight" className="h-3 w-3 text-gray-300" />
                                                <span className="font-bold text-primary-dark dark:text-primary">{entry.newScore}%</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{entry.reason}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {gradingInfo && (
                <ManualGrader 
                    isOpen={!!gradingInfo} 
                    onClose={(updated) => { setGradingInfo(null); if(updated) fetchGrades(selectedCourseId); }} 
                    submissionId={gradingInfo.submissionId} 
                    studentName={gradingInfo.studentName} 
                />
            )}
        </div>
    );
};

export default GradebookPage;