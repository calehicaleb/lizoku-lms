
import React, { useState, useRef, useEffect } from 'react';
import { Icon, IconName } from '../icons';
import { Modal } from '../ui/Modal';
import { MediaLibrary } from './MediaLibrary';
import { MediaType } from '../../types';

interface RichTextEditorProps {
    initialContent?: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const ToolbarButton: React.FC<{ 
    icon: IconName; 
    command: string; 
    arg?: string; 
    active?: boolean;
    title?: string;
    onClick?: () => void;
}> = ({ icon, command, arg, active, title, onClick }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent focus loss from editor
        if (onClick) {
            onClick();
        } else {
            document.execCommand(command, false, arg);
        }
    };

    return (
        <button
            onMouseDown={handleMouseDown}
            className={`p-2 rounded-md transition-colors ${
                active 
                    ? 'bg-primary text-gray-900' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={title}
            type="button"
        >
            <Icon name={icon} className="h-4 w-4" />
        </button>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent = '', onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

    useEffect(() => {
        // Set initial content only once
        if (editorRef.current && initialContent && editorRef.current.innerHTML !== initialContent) {
            editorRef.current.innerHTML = initialContent;
        }
    }, []); // Empty dependency to run only once on mount

    const handleInput = () => {
        if (editorRef.current) {
            const newHtml = editorRef.current.innerHTML;
            onChange(newHtml);
        }
    };

    const handleImageSelect = (item: any) => {
        if (item.type === MediaType.Image) {
            // Restore focus
            if (editorRef.current) editorRef.current.focus();
            
            // Insert image
            document.execCommand('insertImage', false, item.url);
            handleInput(); // Trigger change
        } else {
            alert("Please select an image file.");
        }
        setIsMediaLibraryOpen(false);
    };

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <ToolbarButton icon="Bold" command="bold" title="Bold (Ctrl+B)" />
                <ToolbarButton icon="Italic" command="italic" title="Italic (Ctrl+I)" />
                <ToolbarButton icon="Underline" command="underline" title="Underline (Ctrl+U)" />
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                
                <ToolbarButton icon="Type" command="formatBlock" arg="H2" title="Heading" />
                <ToolbarButton icon="List" command="insertUnorderedList" title="Bullet List" />
                <ToolbarButton icon="ListOrdered" command="insertOrderedList" title="Numbered List" />
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                
                <ToolbarButton icon="AlignLeft" command="justifyLeft" title="Align Left" />
                <ToolbarButton icon="AlignCenter" command="justifyCenter" title="Align Center" />
                <ToolbarButton icon="AlignRight" command="justifyRight" title="Align Right" />
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <ToolbarButton icon="Link" command="createLink" arg={prompt('Enter URL') || undefined} title="Insert Link" />
                <ToolbarButton 
                    icon="Image" 
                    command="custom" 
                    title="Insert Image from Library" 
                    onClick={() => setIsMediaLibraryOpen(true)}
                />
                <ToolbarButton icon="Code" command="formatBlock" arg="PRE" title="Code Block" />

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <ToolbarButton icon="Undo" command="undo" title="Undo (Ctrl+Z)" />
                <ToolbarButton icon="Redo" command="redo" title="Redo (Ctrl+Y)" />
            </div>

            {/* Content Area */}
            <div
                ref={editorRef}
                className="flex-grow p-4 overflow-y-auto focus:outline-none prose prose-sm sm:prose max-w-none dark:prose-invert"
                contentEditable
                onInput={handleInput}
                data-placeholder={placeholder}
                style={{ minHeight: '300px' }}
            />
            
            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                    display: block; /* For Firefox */
                }
            `}</style>

            <Modal isOpen={isMediaLibraryOpen} onClose={() => setIsMediaLibraryOpen(false)} title="Insert Image from Media Library" size="4xl">
                <div className="h-[60vh]">
                    <MediaLibrary onSelectItem={handleImageSelect} filterByType={MediaType.Image} />
                </div>
            </Modal>
        </div>
    );
};
