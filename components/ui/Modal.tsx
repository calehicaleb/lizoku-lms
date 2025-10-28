
import React, { useEffect, useState } from 'react';
import { Icon } from '../icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    // Controls if the modal is in the DOM
    const [isMounted, setIsMounted] = useState(false);
    // Controls the animation state (in or out)
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen && !isMounted) {
            setIsMounted(true);
            // RAF ensures the initial state is rendered before the animation state
            requestAnimationFrame(() => {
                requestAnimationFrame(() => { // Double RAF for browser compatibility
                    setIsAnimating(true);
                });
            });
        } else if (!isOpen && isMounted) {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setIsMounted(false);
            }, 300); // This must match the CSS transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen, isMounted]);

    if (!isMounted) {
        return null;
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-out ${isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'}`}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto transform transition-all duration-300 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 id="modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                        <Icon name="X" className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
