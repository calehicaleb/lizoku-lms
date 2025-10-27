import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Announcement } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';

const emptyAnnouncement: Partial<Announcement> = {
    title: '',
    content: '',
};

const AnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Announcement | null>(null);
    const [formData, setFormData] = useState<Partial<Announcement>>(emptyAnnouncement);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getAnnouncements();
                setAnnouncements(data);
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (announcement: Announcement | null = null) => {
        if (announcement) {
            setSelected(announcement);
            setFormData(announcement);
        } else {
            setSelected(null);
            setFormData(emptyAnnouncement);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelected(null);
        setFormData(emptyAnnouncement);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id.replace('ann-', '')]: value }));
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content || !user) {
            alert('Please fill all fields.');
            return;
        }

        try {
            if (selected) {
                const updated = await api.updateAnnouncement(selected.id, formData as any);
                if (updated) {
                    setAnnouncements(announcements.map(a => a.id === updated.id ? updated : a));
                }
            } else {
                const created = await api.createAnnouncement({ ...formData, author: user.name } as any);
                setAnnouncements([created, ...announcements]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save announcement", error);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            const result = await api.deleteAnnouncement(id);
            if (result.success) {
                setAnnouncements(announcements.filter(a => a.id !== id));
            } else {
                alert('Failed to delete announcement.');
            }
        }
    };

    if (loading) return <div>Loading announcements...</div>;

    return (
        <div>
            <PageHeader title="Site Announcements" subtitle="Manage communications for all platform users." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="ScrollText" className="h-5 w-5 mr-2" />
                        Add Announcement
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Title</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Author</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Date</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {announcements.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{item.title}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{item.author}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{item.createdAt}</td>
                                    <td className="px-4 py-3 whitespace-nowrap space-x-4">
                                        <button onClick={() => handleOpenModal(item)} className="text-secondary hover:text-secondary-dark font-medium">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selected ? 'Edit Announcement' : 'Add Announcement'}>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label htmlFor="ann-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" id="ann-title" value={formData.title} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label htmlFor="ann-content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea id="ann-content" rows={4} value={formData.content} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AnnouncementsPage;