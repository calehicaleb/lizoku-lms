import React, { useEffect, useState } from 'react';
import { Icon } from '../icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', isMaximized, onToggleMaximize }) => {
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

    const sizeClasses = {
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
    };

    const modalContainerClasses = isMaximized
        ? 'w-screen h-screen max-w-none max-h-none rounded-none'
        : `${sizeClasses[size]} max-h-[90vh] rounded-lg`;
        
    const backdropPadding = isMaximized ? 'p-0' : 'p-4';

    return (
        <div
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-300 ease-out ${backdropPadding} ${isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'}`}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`bg-white dark:bg-gray-800 shadow-xl w-full flex flex-col transform transition-all duration-300 ease-out ${modalContainerClasses} ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
            >
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 id="modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                    <div className="flex items-center space-x-2">
                        {onToggleMaximize && (
                            <button onClick={onToggleMaximize} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                {isMaximized ? <Icon name="Minimize" className="h-5 w-5" /> : <Icon name="Maximize" className="h-5 w-5" />}
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                            <Icon name="X" className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                <div className={`flex-grow overflow-y-auto ${isMaximized ? 'p-6' : 'p-6'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};
