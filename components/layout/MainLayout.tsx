
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from './Header';
import { Sidebar, NavItem } from './Sidebar';
import { ADMIN_NAV_ITEMS, INSTRUCTOR_NAV_ITEMS, STUDENT_NAV_ITEMS } from '../../constants';
import { UserRole } from '../../types';

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
    const [isSidebarOpen, setSidebarOpen] = useState(false);

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

    return (
        <div className="min-h-screen bg-light-cream">
            <div className="lg:pl-64">
                <Header onToggleSidebar={handleToggleSidebar}/>
            </div>
            <Sidebar navItems={navItems} isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
            <main className="lg:pl-64">
                <div className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
