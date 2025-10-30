import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MediaLibrary } from '../../components/common/MediaLibrary';

const MediaLibraryPage: React.FC = () => {
    return (
        <div>
            <PageHeader title="Media Library" subtitle="Manage all your uploaded images, videos, and documents." />
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <MediaLibrary />
            </div>
        </div>
    );
};

export default MediaLibraryPage;
