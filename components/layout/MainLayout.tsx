import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from './Header';
import { Sidebar, NavItem } from './Sidebar';
import { ADMIN_NAV_ITEMS, INSTRUCTOR_NAV_ITEMS, STUDENT_NAV_ITEMS } from '../../constants';
import { UserRole } from '../../types';
import { Icon } from '../icons';

const getNavItemsByRole = (role: UserRole): NavItem[] => {
    switch (role) {
        case UserRole.Admin:
            return ADMIN_NAV_ITEMS;
        case UserRole.Instructor:
            return INSTRUCTOR_NAV_ITEMS;
        case UserRole.Student:
            return STUDENT_NAV_ITEMS;
        default:
            return [];
    }
};

export const MainLayout: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const isStudentCoursePage = user?.role === UserRole.Student && location.pathname.startsWith('/courses/');
        const isDesktop = window.innerWidth >= 1024;
        
        // Default sidebar state:
        // On Student Course Viewer: Collapsed for focus.
        // Otherwise: Expanded.
        if (isStudentCoursePage) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(isDesktop);
        }
    }, [location.pathname, user?.role]);

    if (!user) return null;

    const navItems = getNavItemsByRole(user.role);
    
    const handleToggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };
    
    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    // Calculate dynamic padding for the content area based on expanded vs rail state
    const contentPadding = isSidebarOpen ? 'lg:pl-[18rem]' : 'lg:pl-[7rem]';

    return (
        <div className="min-h-screen bg-light-cream dark:bg-gray-900 transition-colors duration-300">
            {/* Header always takes full available width with left padding adjustment */}
            <div className={`transition-all duration-300 ease-in-out ${contentPadding} pr-4 lg:pr-8 pt-4`}>
                <Header onToggleSidebar={handleToggleSidebar}/>
            </div>

            <Sidebar 
                navItems={navItems} 
                isOpen={isSidebarOpen} 
                onClose={handleCloseSidebar} 
                onToggleSidebar={handleToggleSidebar} 
            />

            <main className={`transition-all duration-300 ease-in-out ${contentPadding}`}>
                <div className="p-4 sm:p-6 lg:p-8 lg:pt-4">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Subtle overlay/indicator for when sidebar is completely hidden (Mobile) */}
            {!isSidebarOpen && (
                <button
                    onClick={handleToggleSidebar}
                    aria-label="Open sidebar"
                    className="fixed bottom-6 left-6 z-50 p-4 bg-primary text-gray-900 rounded-full shadow-2xl lg:hidden transform active:scale-95 transition-transform"
                >
                    <Icon name="Menu" className="h-6 w-6" />
                </button>
            )}
        </div>
    );
};