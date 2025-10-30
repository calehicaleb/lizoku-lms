import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../../services/api';
import { MediaItem, MediaType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon, IconName } from '../icons';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const mediaTypeIcons: Record<MediaType, IconName> = {
    [MediaType.Image]: 'FileImage',
    [MediaType.Video]: 'FileVideo',
    [MediaType.Audio]: 'FileMusic',
    [MediaType.Document]: 'FileText',
};

interface MediaLibraryProps {
    onSelectItem?: (item: MediaItem) => void;
    filterByType?: MediaType; // e.g., only show 'image'
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelectItem, filterByType }) => {
    const { user } = useAuth();
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<MediaType | 'all'>(filterByType || 'all');
    
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        api.getMediaItems(user.id)
            .then(setMediaItems)
            .catch(err => console.error("Failed to load media items", err))
            .finally(() => setIsLoading(false));
    }, [user]);

    const handleFileUpload = async (file: File) => {
        if (!user) return;
        setUploadError('');
        setIsUploading(true);
        try {
            const newItem = await api.uploadMediaItem(user.id, file);
            setMediaItems(prev => [newItem, ...prev]);
        } catch (error) {
            setUploadError('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };
    
    // Drag and drop handlers
    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [user]);

    const filteredItems = useMemo(() => {
        if (activeFilter === 'all') return mediaItems;
        return mediaItems.filter(item => item.type === activeFilter);
    }, [mediaItems, activeFilter]);

    return (
        <div className="flex flex-col h-full">
            {/* Uploader Section */}
            <div 
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors mb-6 ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'}`}
            >
                <input type="file" id="media-upload-input" className="hidden" onChange={onFileChange} disabled={isUploading} />
                <Icon name="UploadCloud" className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <label htmlFor="media-upload-input" className="font-semibold text-secondary dark:text-blue-400 hover:underline cursor-pointer">
                    Click to upload
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">or drag and drop a file</p>
                {isUploading && <p className="text-sm mt-2">Uploading...</p>}
                {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
            </div>

            {/* Filters */}
            {!filterByType && (
                <div className="flex items-center gap-2 mb-4 border-b dark:border-gray-700 pb-4">
                    {(['all', ...Object.values(MediaType)] as const).map(type => (
                        <button key={type} onClick={() => setActiveFilter(type)} className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize ${activeFilter === type ? 'bg-primary text-gray-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                            {type}s
                        </button>
                    ))}
                </div>
            )}
            
            {/* Grid */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">Loading media...</div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">No media items found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredItems.map(item => (
                                <div key={item.id} className="relative group border dark:border-gray-700 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700">
                                    {item.type === MediaType.Image ? (
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2">
                                            <Icon name={mediaTypeIcons[item.type]} className="h-12 w-12 text-gray-400 mx-auto" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">{item.name}</p>
                                        </div>
                                    )}
                                    {onSelectItem && (
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                                            <button onClick={() => onSelectItem(item)} className="px-4 py-2 bg-primary text-gray-800 font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                Select
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
