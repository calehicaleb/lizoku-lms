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
        <div className="flex flex-col h-full overflow-hidden">
            <nav className="flex-grow px-2 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {Object.keys(groupedNavItems).map((section) => (
                    <div key={section} className="mb-6">
                        {/* Section Header - Only visible when expanded */}
                        <h3 className={`px-4 mb-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:h-0 overflow-hidden'}`}>
                            {section}
                        </h3>
                        
                        <div className="space-y-1">
                            {groupedNavItems[section].map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => {
                                        // On mobile, close on click. On desktop, stay open/collapsed as is.
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    title={!isOpen ? item.name : undefined}
                                    className={({ isActive }) =>
                                        `flex items-center group transition-all duration-200 rounded-xl px-4 py-3 ${
                                            isActive
                                                ? 'bg-primary/10 dark:bg-primary/5 text-primary-dark dark:text-primary'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={`relative flex items-center justify-center transition-all duration-200 ${!isOpen ? 'w-full' : 'mr-3'}`}>
                                                <Icon name={item.icon} className={`h-6 w-6 flex-shrink-0 ${isActive ? 'text-primary-dark' : 'group-hover:scale-110 transition-transform'}`} />
                                                {/* Active dot indicator for rail mode */}
                                                {!isOpen && isActive && (
                                                    <div className="absolute -left-4 w-1 h-6 bg-primary rounded-r-full"></div>
                                                )}
                                            </div>
                                            
                                            <span className={`font-bold text-sm whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'lg:opacity-0 lg:-translate-x-4 lg:hidden'}`}>
                                                {item.name}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Toggle Button Container */}
            <div className="border-t dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50">
                <button
                    onClick={onToggleSidebar}
                    className={`flex items-center transition-all duration-300 rounded-xl p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 ${!isOpen ? 'w-full justify-center' : 'w-full'}`}
                    aria-label={isOpen ? "Collapse menu" : "Expand menu"}
                >
                    {/* Using reliable universal icons for standard functionality */}
                    <Icon name={isOpen ? "ChevronLeft" : "ChevronRight"} className="h-6 w-6" />
                    <span className={`ml-3 font-bold text-sm transition-all duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:hidden'}`}>
                        Collapse Sidebar
                    </span>
                </button>
            </div>
        </div>
    );
    
    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            ></div>

            {/* Sidebar Shell */}
            <aside 
                className={`fixed z-50 bg-white dark:bg-gray-800 shadow-2xl dark:shadow-none border-r dark:border-gray-700 transition-all duration-300 ease-in-out
                    lg:top-20 lg:left-4 lg:h-[calc(100vh-6.5rem)] lg:rounded-3xl
                    top-0 left-0 h-full
                    ${isOpen ? 'w-64 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full'}
                `}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700 lg:hidden">
                    <div className="flex items-center text-xl font-black text-gray-800 dark:text-gray-100 tracking-tighter">
                        <Icon name="GraduationCap" className="h-7 w-7 text-primary mr-2" />
                        <span>LIZOKU</span>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="X" className="h-6 w-6" />
                    </button>
                </div>

                {sidebarContent}
            </aside>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}</style>
        </>
    );
};