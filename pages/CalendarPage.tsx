import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Icon } from '../components/icons';
import * as api from '../services/api';
import { CalendarEvent, CalendarEventType } from '../types';

const CalendarPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 1)); // Default to August 2024 for demo
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const data = await api.getCalendarEvents();
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch calendar events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

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
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];
        // Add blank cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border-r border-b dark:border-gray-700"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            calendarDays.push(
                <div key={day} className="border-r border-b dark:border-gray-700 p-2 min-h-[120px]">
                    <div className="font-bold text-gray-700 dark:text-gray-200">{day}</div>
                    <div className="mt-1 space-y-1">
                        {dayEvents.map(event => (
                            <div key={event.id} className={`p-1 text-xs rounded border-l-4 ${eventColors[event.type]}`}>
                                <p className="font-semibold">{event.title}</p>
                                {event.courseName && <p className="opacity-75">{event.courseName}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };
    
    return (
        <div>
            <PageHeader title="Calendar" subtitle="View deadlines, holidays, and important events." />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="ChevronDown" className="h-6 w-6 rotate-90" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="ChevronDown" className="h-6 w-6 -rotate-90" />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 border-t border-l dark:border-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 p-2 border-r border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            {day}
                        </div>
                    ))}
                    {loading ? <div className="col-span-7 text-center p-8">Loading events...</div> : renderCalendar()}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;