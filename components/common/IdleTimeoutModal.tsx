import React, { useState, useEffect } from 'react';
import { Icon } from '../icons';

interface IdleTimeoutModalProps {
    isOpen: boolean;
    onStayLoggedIn: () => void;
    onLogout: () => void;
}

const WARNING_SECONDS = 60;

export const IdleTimeoutModal: React.FC<IdleTimeoutModalProps> = ({ isOpen, onStayLoggedIn, onLogout }) => {
    const [countdown, setCountdown] = useState(WARNING_SECONDS);
    
    // Animation states
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen && !isMounted) {
            setIsMounted(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else if (!isOpen && isMounted) {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setIsMounted(false);
            }, 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen, isMounted]);


    useEffect(() => {
        if (isOpen) {
            setCountdown(WARNING_SECONDS);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className={`fixed inset-0 bg-black z-[100] flex justify-center items-center p-4 transition-opacity duration-300 ease-out ${isAnimating ? 'bg-opacity-75' : 'bg-opacity-0'}`}>
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-md text-center p-8 transform transition-all duration-300 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                <Icon name="Clock" className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Are you still there?</h2>
                <p className="text-gray-600 my-4">
                    For your security, you will be logged out automatically due to inactivity in{' '}
                    <span className="font-bold text-lg text-red-600">{countdown}</span> seconds.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={onLogout}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                        Log Out Now
                    </button>
                    <button
                        onClick={onStayLoggedIn}
                        className="px-6 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark"
                    >
                        Stay Logged In
                    </button>
                </div>
            </div>
        </div>
    );
};
