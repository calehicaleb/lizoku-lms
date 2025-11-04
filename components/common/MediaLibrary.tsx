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

type ItemCardProps = {
    item: MediaItem & { instructorName?: string };
    activeView: 'my' | 'public';
    onSelectItem?: (item: MediaItem) => void;
    onToggleVisibility: (itemId: string, isPublic: boolean) => void;
    onDeleteItem: (itemId: string) => void;
};

const ItemCard: React.FC<ItemCardProps> = ({ item, activeView, onSelectItem, onToggleVisibility, onDeleteItem }) => {
    const [isActioning, setIsActioning] = useState(false);

    const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsActioning(true);
        await onToggleVisibility(item.id, e.target.checked);
        setIsActioning(false);
    };
    
    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
            setIsActioning(true);
            await onDeleteItem(item.id);
            // No need to set isActioning to false, as the component will unmount
        }
    };

    return (
        <div className="relative group border dark:border-gray-700 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700/50">
            {item.type === MediaType.Image ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
                <div className="text-center p-2">
                    <Icon name={mediaTypeIcons[item.type]} className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
            )}
            
            {activeView === 'my' && (
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button onClick={handleDelete} disabled={isActioning} className="p-1.5 bg-black/50 rounded-full text-white hover:bg-red-600 transition-colors">
                        <Icon name="X" className="h-4 w-4" />
                    </button>
                    <label className="flex items-center cursor-pointer p-1 bg-black/50 rounded-full" title={item.isPublic ? 'Shared Publicly' : 'Private'}>
                        <div className="relative">
                            <input type="checkbox" checked={item.isPublic} onChange={handleToggle} className="sr-only" disabled={isActioning} />
                            <div className={`block w-10 h-5 rounded-full transition-colors ${item.isPublic ? 'bg-primary' : 'bg-gray-500'}`}></div>
                            <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${item.isPublic ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                    </label>
                </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white">
                <p className="text-xs truncate font-semibold">{item.name}</p>
                 <div className="flex justify-between items-center text-xs text-gray-300">
                    <span>{formatBytes(item.size)}</span>
                    {activeView === 'public' && item.instructorName && (
                        <span className="truncate">by {item.instructorName}</span>
                    )}
                 </div>
            </div>

            {onSelectItem && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                    <button onClick={() => onSelectItem(item)} className="px-4 py-2 bg-primary text-gray-800 font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        Select
                    </button>
                </div>
            )}
        </div>
    );
};

interface MediaLibraryProps {
    onSelectItem?: (item: MediaItem) => void;
    filterByType?: MediaType;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelectItem, filterByType }) => {
    const { user } = useAuth();
    
    const [myMediaItems, setMyMediaItems] = useState<MediaItem[]>([]);
    const [publicMediaItems, setPublicMediaItems] = useState<(MediaItem & { instructorName: string })[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isPublicLoading, setIsPublicLoading] = useState(false);
    
    const [activeView, setActiveView] = useState<'my' | 'public'>('my');
    const [activeFilter, setActiveFilter] = useState<MediaType | 'all'>(filterByType || 'all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        api.getMediaItems(user.id)
            .then(setMyMediaItems)
            .catch(err => console.error("Failed to load media items", err))
            .finally(() => setIsLoading(false));
    }, [user]);

    useEffect(() => {
        if (activeView === 'public' && publicMediaItems.length === 0 && user) {
            setIsPublicLoading(true);
            api.getPublicMediaItems(user.id)
                .then(setPublicMediaItems)
                .catch(err => console.error("Failed to load public media", err))
                .finally(() => setIsPublicLoading(false));
        }
    }, [activeView, user, publicMediaItems.length]);

    const handleFileUpload = async (file: File) => {
        if (!user) return;
        setUploadError('');
        setIsUploading(true);
        try {
            const newItem = await api.uploadMediaItem(user.id, file);
            setMyMediaItems(prev => [newItem, ...prev]);
        } catch (error) {
            setUploadError('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleVisibilityToggle = async (itemId: string, isPublic: boolean) => {
        const originalItems = [...myMediaItems];
        setMyMediaItems(prev => prev.map(item => item.id === itemId ? { ...item, isPublic } : item));
        try {
            await api.updateMediaItemVisibility(itemId, isPublic);
        } catch (error) {
            console.error("Failed to update visibility", error);
            setMyMediaItems(originalItems);
        }
    };
    
    const handleDeleteItem = async (itemId: string) => {
        const originalItems = [...myMediaItems];
        setMyMediaItems(prev => prev.filter(item => item.id !== itemId));
        try {
            await api.deleteMediaItem(itemId);
        } catch (error) {
            console.error("Failed to delete item", error);
            setMyMediaItems(originalItems);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };
    
    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [user]);

    const filteredItems = useMemo(() => {
        const source = activeView === 'my' ? myMediaItems : publicMediaItems;
        return source.filter(item => {
            const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
            const matchesSearch = searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [myMediaItems, publicMediaItems, activeView, activeFilter, searchTerm]);

    const isLoadingData = (isLoading && activeView === 'my') || (isPublicLoading && activeView === 'public');

    return (
        <div className="flex flex-col h-full">
            <div className="flex border-b dark:border-gray-700 mb-4">
                <button onClick={() => setActiveView('my')} className={`whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center gap-2 ${activeView === 'my' ? 'border-b-2 border-primary text-secondary dark:text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    <Icon name="User" className="h-4 w-4" /> My Resources
                </button>
                 <button onClick={() => setActiveView('public')} className={`whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center gap-2 ${activeView === 'public' ? 'border-b-2 border-primary text-secondary dark:text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    <Icon name="Globe" className="h-4 w-4" /> Public Resources
                </button>
            </div>

            {activeView === 'my' && (
                <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors mb-6 ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'}`}>
                    <input type="file" id="media-upload-input" className="hidden" onChange={onFileChange} disabled={isUploading} />
                    <Icon name="UploadCloud" className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <label htmlFor="media-upload-input" className="font-semibold text-secondary dark:text-blue-400 hover:underline cursor-pointer">Click to upload</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">or drag and drop a file</p>
                    {isUploading && <p className="text-sm mt-2">Uploading...</p>}
                    {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                    <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name..." className="w-full px-3 py-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                {!filterByType && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {(['all', ...Object.values(MediaType)] as const).map(type => (
                            <button key={type} onClick={() => setActiveFilter(type)} className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize ${activeFilter === type ? 'bg-primary text-gray-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                {type}s
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {isLoadingData ? (
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
                                <ItemCard 
                                    key={item.id}
                                    item={item}
                                    activeView={activeView}
                                    onSelectItem={onSelectItem}
                                    onToggleVisibility={handleVisibilityToggle}
                                    onDeleteItem={handleDeleteItem}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
