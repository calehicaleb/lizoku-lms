import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, UserRole, Notification } from '../types';
import * as api from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<User | null>;
    logout: () => void;
    updateUser: (updatedUser: User) => void;
    loading: boolean;
    isIdleTimeoutWarningVisible: boolean;
    resetTimers: () => void;
    notifications: Notification[];
    unreadCount: number;
    markNotificationAsRead: (notificationId: string) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const IDLE_WARNING_DURATION = 1 * 60 * 1000; // 1 minute before timeout

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isIdleTimeoutWarningVisible, setIsIdleTimeoutWarningVisible] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    const warningTimerRef = useRef<number | null>(null);
    const logoutTimerRef = useRef<number | null>(null);
    
    const fetchNotifications = async (userId: string) => {
        try {
            const data = await api.getNotifications(userId);
            setNotifications(data);
        } catch (e) {
            console.error("Failed to fetch notifications");
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setNotifications([]);
        sessionStorage.removeItem('lizokuUser');
        setIsIdleTimeoutWarningVisible(false);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    }, []);
    
    const resetTimers = useCallback(() => {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        setIsIdleTimeoutWarningVisible(false);

        // This function can be called by the modal to keep the session alive,
        // so we must check for a user session before setting new timers.
        if (sessionStorage.getItem('lizokuUser')) {
            warningTimerRef.current = window.setTimeout(() => {
                setIsIdleTimeoutWarningVisible(true);
            }, IDLE_TIMEOUT_DURATION - IDLE_WARNING_DURATION);
            
            logoutTimerRef.current = window.setTimeout(() => {
                logout();
            }, IDLE_TIMEOUT_DURATION);
        }
    }, [logout]);


    useEffect(() => {
        const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll'];
        
        const handleActivity = () => {
            resetTimers();
        };

        if (user) {
            events.forEach(event => window.addEventListener(event, handleActivity));
            resetTimers();
        }

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
    }, [user, resetTimers]);

    useEffect(() => {
        // Try to load user from session storage to persist login
        const storedUser = sessionStorage.getItem('lizokuUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchNotifications(parsedUser.id);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const loggedInUser = await api.login(email, password);
            if (loggedInUser) {
                setUser(loggedInUser);
                sessionStorage.setItem('lizokuUser', JSON.stringify(loggedInUser));
                fetchNotifications(loggedInUser.id);
                return loggedInUser;
            }
            return null;
        } catch (error) {
            console.error("Login failed", error);
            return null;
        }
    };
    
    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        sessionStorage.setItem('lizokuUser', JSON.stringify(updatedUser));
    };

    const markNotificationAsRead = async (notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
        try {
            await api.markNotificationAsRead(notificationId);
        } catch (e) {
            console.error("Failed to mark notification as read", e);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n));
        }
    };

    const markAllNotificationsAsRead = async () => {
        const originalNotifications = [...notifications];
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            if (user) {
                await api.markAllNotificationsAsRead(user.id);
            }
        } catch (e) {
            console.error("Failed to mark all notifications as read", e);
            setNotifications(originalNotifications);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        loading,
        isIdleTimeoutWarningVisible,
        resetTimers,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};