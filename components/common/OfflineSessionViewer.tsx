
import React from 'react';
import { ContentItem } from '../../types';
import { Icon } from '../icons';

interface OfflineSessionViewerProps {
    session: ContentItem;
}

export const OfflineSessionViewer: React.FC<OfflineSessionViewerProps> = ({ session }) => {
    const details = session.offlineDetails;

    if (!details) return <div>Invalid session details.</div>;

    const startDate = new Date(details.startDateTime);
    const endDate = new Date(startDate.getTime() + details.durationMinutes * 60000);

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl w-full border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b dark:border-gray-700">
                    <div className="p-3 bg-secondary-light dark:bg-secondary/20 rounded-full">
                        <Icon name="CalendarCheck" className="h-8 w-8 text-secondary dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{session.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400">Offline Session</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</p>
                            <div className="flex items-center mt-1 text-gray-800 dark:text-gray-200">
                                <Icon name="Clock" className="h-5 w-5 mr-2 text-gray-400" />
                                <span>{startDate.toLocaleDateString()}</span>
                            </div>
                            <p className="ml-7 text-lg font-bold text-gray-800 dark:text-gray-200">
                                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</p>
                            <div className="flex items-center mt-1 text-gray-800 dark:text-gray-200 text-lg">
                                <Icon name="MapPin" className="h-5 w-5 mr-2 text-red-500" />
                                <span>{details.location}</span>
                            </div>
                        </div>

                        {details.notes && (
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</p>
                                <p className="mt-1 text-gray-700 dark:text-gray-300">{details.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                        <Icon name="QrCode" className="h-32 w-32 text-gray-800 dark:text-white mb-4" />
                        <p className="font-bold text-gray-800 dark:text-gray-200">Attendance Check-in</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Scan this code at the venue or show it to the instructor to mark your attendance.</p>
                        <span className="mt-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                            Status: Scheduled
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
