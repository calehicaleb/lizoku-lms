
import React, { useState } from 'react';
import { ContentItem, ContentType } from '../../types';

interface OfflineSessionEditorProps {
    initialItem?: ContentItem;
    onSave: (item: Omit<ContentItem, 'id'>) => void;
    onCancel: () => void;
}

export const OfflineSessionEditor: React.FC<OfflineSessionEditorProps> = ({ initialItem, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialItem?.title || '');
    const [location, setLocation] = useState(initialItem?.offlineDetails?.location || '');
    const [startDateTime, setStartDateTime] = useState(initialItem?.offlineDetails?.startDateTime || '');
    const [duration, setDuration] = useState(initialItem?.offlineDetails?.durationMinutes || 60);
    const [notes, setNotes] = useState(initialItem?.offlineDetails?.notes || '');

    const handleSave = () => {
        if (!title.trim() || !location.trim() || !startDateTime) {
            alert("Title, Location, and Date/Time are required.");
            return;
        }

        onSave({
            title,
            type: ContentType.OfflineSession,
            offlineDetails: {
                location,
                startDateTime,
                durationMinutes: Number(duration),
                notes
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Schedule Offline Session
            </h2>
            
            <div className="space-y-4 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Title</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g., Week 3: Physical Lab"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input 
                        type="text" 
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g., Building A, Room 101"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                        <input 
                            type="datetime-local" 
                            value={startDateTime}
                            onChange={e => setStartDateTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                        <input 
                            type="number" 
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            min="15"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Instructions</label>
                    <textarea 
                        rows={4}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Instructions for students (e.g., what to bring)..."
                    />
                </div>
            </div>

            <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end gap-3">
                <button 
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-gray-900 font-bold rounded-md hover:bg-primary-dark"
                >
                    Save Session
                </button>
            </div>
        </div>
    );
};
