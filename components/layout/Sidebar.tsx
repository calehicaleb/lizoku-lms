import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, IconName } from '../icons';

export interface NavItem {
    path: string;
    name: string;
    icon: IconName;
    section?: string;
}

interface SidebarProps {
    navItems: NavItem[];
    isOpen: boolean;
    onClose: () => void;
    onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, onClose, onToggleSidebar }) => {
    const groupedNavItems = navItems.reduce((acc, item) => {
        const section = item.section || 'Main';
        if (acc[section]) {
            acc[section].push(item);
        } else {
            acc[section] = [item];
        }
        return acc;
    }, {} as Record<string, NavItem[]>);

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <nav className="flex-grow px-2 py-4 space-y-1 overflow-y-auto">
                {/* FIX: Replaced `Object.entries` with `Object.keys` for more robust type inference. This ensures the array of items is correctly typed, resolving the error where `.map` was called on an `unknown` type. */}
                {Object.keys(groupedNavItems).map((section) => (
                    <div key={section} className="mb-4">
                        <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{section}</h3>
                        {groupedNavItems[section].map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        isActive
                                            ? 'bg-secondary-light text-secondary border-l-4 border-primary'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`
                                }
                            >
                                <Icon name={item.icon} className="mr-3 h-5 w-5" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
            <div className="border-t p-2">
                <button
                    onClick={onToggleSidebar}
                    className="w-full items-center p-2 rounded-md text-gray-600 hover:bg-gray-100 hidden lg:flex"
                    aria-label="Collapse menu"
                >
                    <Icon name="ChevronLeft" className="h-6 w-6 mr-3" />
                    <span className="text-sm font-medium">Collapse menu</span>
                </button>
            </div>
        </div>
    );
    
    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out lg:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed z-40 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out transform lg:rounded-3xl lg:top-20 lg:left-4 lg:h-[calc(100vh-6rem)] top-0 left-0 h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <div className="flex items-center justify-between h-16 px-4 border-b lg:hidden">
                    <div className="flex items-center text-xl font-bold text-gray-800">
                        <Icon name="GraduationCap" className="h-7 w-7 text-primary" />
                        <span className="ml-2">Lizoku LMS</span>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-md text-gray-500 hover:bg-gray-100">
                        <Icon name="X" className="h-6 w-6" />
                    </button>
                </div>
                {sidebarContent}
            </aside>
        </>
    );
};