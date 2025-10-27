
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Icon, IconName } from '../icons';

export const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <button
                            onClick={onToggleSidebar}
                            className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-dark lg:hidden mr-4"
                        >
                           <Icon name="Menu" className="h-6 w-6" />
                        </button>
                        <div className="flex items-center text-2xl font-bold text-gray-800">
                            <Icon name="GraduationCap" className="h-8 w-8 text-primary" />
                            <span className="ml-2">Lizoku LMS</span>
                        </div>
                    </div>
                    {user && (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <img
                                    src={user.avatarUrl}
                                    alt="User Avatar"
                                    className="w-10 h-10 rounded-full border-2 border-primary"
                                />
                                <div className="ml-3 text-right hidden sm:block">
                                    <p className="font-bold text-gray-800">{user.name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                                <Icon name="LogOut" className="h-6 w-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
