import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Icon } from '../components/icons';
import { Modal } from '../components/ui/Modal';
import * as api from '../services/api';
import { CalendarEvent, CalendarEventType, CalendarVisibility, UserRole, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CalendarPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); 
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Management Modal State
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>({
        title: '',
        date: '',
        type: CalendarEventType.Holiday,
        visibility: CalendarVisibility.Everyone,
        courseName: '',
        location: '',
        description: '',
        targetUserIds: []
    });
    
    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');

    const isAdmin = user?.role === UserRole.Admin;
    const isInstructor = user?.role === UserRole.Instructor;
    const canManage = isAdmin || isInstructor;

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const [data, users] = await Promise.all([
                api.getCalendarEvents(user?.id, user?.role),
                canManage ? api.getAllUsers() : Promise.resolve([])
            ]);
            setEvents(data);
            setAllUsers(users);
        } catch (error) {
            console.error("Failed to fetch calendar data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const eventColors: Record<CalendarEventType, string> = {
        [CalendarEventType.Assignment]: 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200',
        [CalendarEventType.Quiz]: 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200',
        [CalendarEventType.Holiday]: 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200',
        [CalendarEventType.Maintenance]: 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200',
        [CalendarEventType.OnSiteSession]: 'bg-purple-100 border-purple-500 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-200',
        [CalendarEventType.LiveSession]: 'bg-sky-100 border-sky-500 text-sky-800 dark:bg-sky-900/30 dark:border-sky-700 dark:text-sky-200',
        [CalendarEventType.Graduation]: 'bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-200',
        [CalendarEventType.Summons]: 'bg-rose-100 border-rose-500 text-rose-800 dark:bg-rose-900/50 dark:border-rose-700 dark:text-rose-100',
        [CalendarEventType.Meeting]: 'bg-orange-100 border-orange-500 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-200',
    };

    const handleDayClick = (dateStr: string) => {
        if (!canManage) return;
        setFormData({
            title: '',
            date: dateStr,
            type: CalendarEventType.Meeting,
            visibility: CalendarVisibility.Everyone,
            courseName: '',
            location: '',
            description: '',
            targetUserIds: []
        });
        setSelectedEvent(null);
        setIsManageModalOpen(true);
    };

    const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        setViewingEvent(event);
        setIsViewModalOpen(true);
    };

    const handleEditEvent = () => {
        if (!viewingEvent || !canManage) return;
        
        // Instructors can only edit their own events or course events
        if (isInstructor && viewingEvent.createdBy !== user?.id && !viewingEvent.id.startsWith('item-')) {
            alert("You can only edit events you created.");
            return;
        }

        setFormData({
            title: viewingEvent.title,
            date: viewingEvent.date,
            type: viewingEvent.type,
            visibility: viewingEvent.visibility,
            courseName: viewingEvent.courseName || '',
            location: viewingEvent.location || '',
            description: viewingEvent.description || '',
            targetUserIds: viewingEvent.targetUserIds || []
        });
        setSelectedEvent(viewingEvent);
        setIsViewModalOpen(false);
        setIsManageModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.date) {
            alert("Title and Date are required.");
            return;
        }
        setIsSaving(true);
        try {
            if (selectedEvent) {
                await api.updateCalendarEvent(selectedEvent.id, formData);
            } else {
                await api.createCalendarEvent({ ...formData, createdBy: user?.id });
            }
            setIsManageModalOpen(false);
            fetchEvents();
        } catch (err) {
            alert("Failed to save event.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        setIsSaving(true);
        try {
            await api.deleteCalendarEvent(selectedEvent.id);
            setIsManageModalOpen(false);
            fetchEvents();
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsersForTarget = useMemo(() => {
        if (!userSearchTerm) return [];
        return allUsers.filter(u => 
            u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
            u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
        ).slice(0, 5);
    }, [allUsers, userSearchTerm]);

    const handleToggleTargetUser = (uId: string) => {
        setFormData(prev => {
            const current = prev.targetUserIds || [];
            const next = current.includes(uId) ? current.filter(id => id !== uId) : [...current, uId];
            return { ...prev, targetUserIds: next };
        });
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border-r border-b dark:border-gray-700 min-h-[120px] bg-gray-50/30 dark:bg-gray-800/10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            calendarDays.push(
                <div 
                    key={day} 
                    onClick={() => handleDayClick(dateStr)}
                    className={`border-r border-b dark:border-gray-700 p-2 min-h-[120px] transition-colors ${canManage ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40' : ''}`}
                >
                    <div className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-1">{day}</div>
                    <div className="space-y-1">
                        {dayEvents.map(event => (
                            <div 
                                key={event.id} 
                                onClick={(e) => handleEventClick(e, event)}
                                className={`p-1.5 text-[10px] leading-tight rounded border-l-4 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer ${eventColors[event.type] || 'bg-gray-100 border-gray-400'}`}
                            >
                                <p className="font-black uppercase truncate">{event.title}</p>
                                {event.time && <p className="opacity-75 font-bold">{event.time}</p>}
                                {event.type === CalendarEventType.Summons && <Icon name="AlertTriangle" className="h-3 w-3 inline ml-1 animate-pulse" />}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };
    
    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <PageHeader title="Academic Calendar" subtitle="Your schedule, course deadlines, and institutional notifications." />
                {canManage && (
                    <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/5 px-4 py-2 rounded-full border border-primary/20">
                         <Icon name="Settings" className="h-4 w-4 text-primary-dark" />
                         <span className="text-xs font-bold text-primary-dark uppercase tracking-widest">Management Mode Active</span>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 overflow-hidden">
                <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors shadow-sm">
                        <Icon name="ChevronLeft" className="h-6 w-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter">
                            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                        </h2>
                    </div>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors shadow-sm">
                        <Icon name="ChevronRight" className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 border-l dark:border-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-bold text-gray-400 dark:text-gray-500 p-3 border-r border-b dark:border-gray-700 bg-white dark:bg-gray-800 text-xs uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                    {loading ? (
                        <div className="col-span-7 h-96 flex items-center justify-center bg-white dark:bg-gray-800">
                            <div className="animate-pulse text-gray-400 font-bold uppercase tracking-widest">Refreshing Schedule...</div>
                        </div>
                    ) : renderCalendar()}
                </div>
            </div>

            {/* View Event Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Event Details" size="lg">
                {viewingEvent && (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-lg border-l-8 ${eventColors[viewingEvent.type]}`}>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{viewingEvent.type.replace('-', ' ')}</p>
                            <h2 className="text-2xl font-black">{viewingEvent.title}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{new Date(viewingEvent.date).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Time / Location</p>
                                <p className="font-bold text-gray-800 dark:text-gray-100">
                                    {viewingEvent.time || 'All Day'} {viewingEvent.location && `@ ${viewingEvent.location}`}
                                </p>
                            </div>
                        </div>

                        {viewingEvent.description && (
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{viewingEvent.description}</p>
                            </div>
                        )}

                        <div className="pt-6 border-t dark:border-gray-700 flex justify-between items-center">
                            <div className="flex gap-2">
                                {viewingEvent.courseId && (
                                    <button onClick={() => navigate(`/courses/${viewingEvent.courseId}`)} className="bg-secondary text-white px-4 py-2 rounded-md font-bold text-sm">
                                        Open Course Activity
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {canManage && (
                                    <button onClick={handleEditEvent} className="text-secondary dark:text-blue-400 font-bold hover:underline text-sm">
                                        Edit Event
                                    </button>
                                )}
                                <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Management Modal */}
            <Modal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} title={selectedEvent ? 'Edit Calendar Event' : 'Schedule New Event'} size="xl">
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-bold mb-1">Event Title</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g., Semester Finalization Meeting"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Date</label>
                            <input 
                                type="date" 
                                value={formData.date} 
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Category</label>
                            <select 
                                value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value as CalendarEventType})}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 capitalize"
                            >
                                {Object.values(CalendarEventType).filter(t => !['assignment', 'quiz', 'live-session'].includes(t)).map(type => (
                                    <option key={type} value={type}>{type.replace('-', ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Visibility</label>
                            <select 
                                value={formData.visibility} 
                                onChange={e => setFormData({...formData, visibility: e.target.value as CalendarVisibility})}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                disabled={isInstructor && formData.visibility === CalendarVisibility.Everyone && !isAdmin}
                            >
                                <option value={CalendarVisibility.Everyone}>Everyone</option>
                                <option value={CalendarVisibility.Instructors}>Instructors Only</option>
                                <option value={CalendarVisibility.Students}>Students Only</option>
                                <option value={CalendarVisibility.SpecificUsers}>Specific Users (Summons)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Time / Location</label>
                            <input 
                                type="text" 
                                value={formData.location} 
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                placeholder="e.g., 14:00 - Room 4B"
                            />
                        </div>
                    </div>

                    {formData.visibility === CalendarVisibility.SpecificUsers && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-100 dark:border-rose-900/50">
                            <label className="block text-xs font-bold text-rose-800 dark:text-rose-300 uppercase mb-2">Target Users (Search & Select)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.targetUserIds?.map(uId => {
                                    const u = allUsers.find(user => user.id === uId);
                                    return (
                                        <span key={uId} className="inline-flex items-center px-2 py-1 rounded bg-rose-600 text-white text-xs font-bold">
                                            {u?.name || uId}
                                            <button onClick={() => handleToggleTargetUser(uId)} className="ml-1 hover:text-gray-200">×</button>
                                        </span>
                                    );
                                })}
                            </div>
                            <input 
                                type="text"
                                placeholder="Search by name or email..."
                                value={userSearchTerm}
                                onChange={e => setUserSearchTerm(e.target.value)}
                                className="w-full p-2 text-sm border rounded dark:bg-gray-700"
                            />
                            {userSearchTerm && filteredUsersForTarget.length > 0 && (
                                <ul className="mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg">
                                    {filteredUsersForTarget.map(u => (
                                        <li 
                                            key={u.id} 
                                            onClick={() => handleToggleTargetUser(u.id)}
                                            className="p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between"
                                        >
                                            <span>{u.name} ({u.role})</span>
                                            {formData.targetUserIds?.includes(u.id) && <Icon name="CheckCircle" className="h-4 w-4 text-green-500" />}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-1">Detail Description</label>
                        <textarea 
                            rows={3}
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Additional context or instructions for participants..."
                        />
                    </div>

                    <div className="flex justify-between items-center pt-6 mt-6 border-t dark:border-gray-700">
                        {selectedEvent && (
                            <button 
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="text-red-600 font-bold hover:underline text-sm"
                            >
                                Delete Event
                            </button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <button onClick={() => setIsManageModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary text-gray-900 font-bold px-6 py-2 rounded-md hover:bg-primary-dark shadow-md"
                            >
                                {isSaving ? 'Processing...' : (selectedEvent ? 'Update Event' : 'Create Event')}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CalendarPage;