import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Icon, IconName } from '../icons';
import { Notification, NotificationType } from '../../types';

const NOTIFICATION_ICONS: Record<NotificationType, IconName> = {
    [NotificationType.NewGrade]: 'PenSquare',
    [NotificationType.NewMessage]: 'MessageSquare',
    [NotificationType.NewAnnouncement]: 'ScrollText',
    [NotificationType.AssignmentDueSoon]: 'Clock',
    // Fix: Added missing icon mapping for OnSiteReminder.
    [NotificationType.OnSiteReminder]: 'MapPin',
    // Fix: Added missing icon mapping for GradeDispute to satisfy Record<NotificationType, IconName> type constraint.
    [NotificationType.GradeDispute]: 'AlertTriangle',
};

const NotificationItem: React.FC<{ notification: Notification; onClick: () => void }> = ({ notification, onClick }) => (
    <Link to={notification.link} onClick={onClick} className={`block p-3 transition-colors ${!notification.isRead ? 'bg-secondary-light/50 dark:bg-secondary/10' : 'bg-white dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600`}>
        <div className="flex items-start">
            <Icon name={NOTIFICATION_ICONS[notification.type] || 'Bell'} className="h-5 w-5 text-secondary dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
            <div>
                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{notification.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
        </div>
    </Link>
);


const NotificationsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markNotificationAsRead(notification.id);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div ref={panelRef} className="absolute top-16 right-0 w-80 max-w-sm bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 z-50">
            <div className="flex justify-between items-center p-3 border-b dark:border-gray-600">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Notifications</h3>
                {unreadCount > 0 && (
                    <button onClick={markAllNotificationsAsRead} className="text-xs font-medium text-secondary dark:text-blue-400 hover:underline">
                        Mark all as read
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto divide-y dark:divide-gray-600">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <NotificationItem key={n.id} notification={n} onClick={() => handleNotificationClick(n)} />
                    ))
                ) : (
                    <p className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">You have no new notifications.</p>
                )}
            </div>
        </div>
    );
};


export const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
    const { user, logout, unreadCount } = useAuth();
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    
    // Theme State
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setIsDark(storedTheme === 'dark');
        } else {
            setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border-b dark:border-l dark:border-r dark:border-gray-700 rounded-b-xl sticky top-0 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <button
                            onClick={onToggleSidebar}
                            className="text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-dark mr-4 lg:hidden"
                        >
                           <Icon name="Menu" className="h-6 w-6" />
                        </button>
                        <div className="flex items-center text-2xl font-bold text-gray-800 dark:text-gray-100">
                            <Icon name="GraduationCap" className="h-8 w-8 text-primary" />
                            <span className="ml-2">Lizoku LMS</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            <Icon name={isDark ? "Sun" : "Moon"} className="h-6 w-6" />
                        </button>

                        {user && (
                            <>
                                <div className="relative">
                                    <button
                                        onClick={() => setNotificationsOpen(prev => !prev)}
                                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
                                    >
                                        <Icon name="Bell" className="h-6 w-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                                        )}
                                    </button>
                                    <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />
                                </div>

                                <div className="flex items-center pl-2 sm:pl-0">
                                    <img
                                        src={user.avatarUrl}
                                        alt="User Avatar"
                                        className="w-10 h-10 rounded-full border-2 border-primary"
                                    />
                                    <div className="ml-3 text-right hidden sm:block">
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <button onClick={logout} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                                    <Icon name="LogOut" className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
