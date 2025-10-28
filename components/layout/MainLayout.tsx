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
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const isStudentCoursePage = user?.role === UserRole.Student && location.pathname.startsWith('/courses/');
        const isDesktop = window.innerWidth >= 1024;
        
        // Set default sidebar state based on page and screen size.
        // On a student's course page, it defaults to closed.
        // On all other pages, it defaults to open on desktop and closed on mobile.
        setSidebarOpen(isDesktop && !isStudentCoursePage);
    }, [location.pathname, user]);

    if (!user) {
        // This should ideally not be reached if routes are protected
        return null;
    }

    const navItems = getNavItemsByRole(user.role);
    
    const handleToggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    }
    
    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    }

    const mainContentPadding = isSidebarOpen ? 'lg:pl-72' : 'lg:pl-16';

    return (
        <div className="min-h-screen bg-light-cream">
            {/* Floating button to OPEN sidebar, only on desktop when closed */}
            {!isSidebarOpen && (
                <button
                    onClick={handleToggleSidebar}
                    aria-label="Open sidebar"
                    className="fixed top-20 left-4 z-30 p-2 bg-white rounded-lg shadow-lg hidden lg:block"
                >
                    <Icon name="ChevronRight" className="h-6 w-6 text-gray-600" />
                </button>
            )}

            <div className={`transition-all duration-300 ease-in-out ${mainContentPadding}`}>
                <Header onToggleSidebar={handleToggleSidebar}/>
            </div>
            <Sidebar navItems={navItems} isOpen={isSidebarOpen} onClose={handleCloseSidebar} onToggleSidebar={handleToggleSidebar} />
            <main className={`transition-all duration-300 ease-in-out ${mainContentPadding}`}>
                <div className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};