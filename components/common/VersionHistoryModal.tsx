
import React from 'react';
import { VersionHistoryEntry } from '../../types';
import { Modal } from '../ui/Modal';
import { Icon } from '../icons';

interface VersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: VersionHistoryEntry[];
    onRestore: (versionId: string) => void;
    isRestoring: boolean;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose, history, onRestore, isRestoring }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Course Version History" size="2xl">
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    View the history of changes made to this course content. You can restore the course to any previous version.
                </p>
                
                {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No history available. Make some changes to see versions here.</div>
                ) : (
                    <div className="border rounded-md dark:border-gray-700 overflow-hidden">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Version</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Date & Time</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Changed By</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Summary</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {history.map((entry) => (
                                    <tr key={entry.id} className="bg-white dark:bg-gray-800">
                                        <td className="px-4 py-3 font-medium">v{entry.versionNumber}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{entry.changedBy}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={entry.changeSummary}>
                                            {entry.changeSummary}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm(`Are you sure you want to revert to Version ${entry.versionNumber}? Current changes will be lost.`)) {
                                                        onRestore(entry.id);
                                                    }
                                                }}
                                                disabled={isRestoring}
                                                className="text-secondary dark:text-blue-400 hover:underline font-medium flex items-center justify-end gap-1 ml-auto disabled:opacity-50"
                                            >
                                                <Icon name="Undo" className="h-4 w-4" /> Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
};
