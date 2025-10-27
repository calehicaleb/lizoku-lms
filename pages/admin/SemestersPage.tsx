import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Semester, SemesterStatus } from '../../types';
import { Icon } from '../../components/icons';

const emptySemester: Partial<Semester> = {
    name: '',
    startDate: '',
    endDate: '',
};

const SemestersPage: React.FC = () => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
    const [formData, setFormData] = useState<Partial<Semester>>(emptySemester);

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const data = await api.getSemesters();
                setSemesters(data);
            } catch (error) {
                console.error("Failed to fetch semesters", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSemesters();
    }, []);

    const handleOpenModal = (semester: Semester | null = null) => {
        if (semester) {
            setSelectedSemester(semester);
            setFormData(semester);
        } else {
            setSelectedSemester(null);
            setFormData(emptySemester);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSemester(null);
        setFormData(emptySemester);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id.replace('semester-', '')]: value }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.startDate || !formData.endDate) {
            alert('Please fill all fields');
            return;
        }

        try {
            if (selectedSemester) {
                const updated = await api.updateSemester(selectedSemester.id, formData as any);
                if (updated) {
                    setSemesters(semesters.map(s => s.id === updated.id ? updated : s));
                }
            } else {
                const created = await api.createSemester(formData as any);
                setSemesters([...semesters, created]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save semester", error);
        }
    };
    
    const handleDelete = async (semesterId: string) => {
        if (window.confirm('Are you sure you want to delete this semester?')) {
            const result = await api.deleteSemester(semesterId);
            if (result.success) {
                setSemesters(semesters.filter(s => s.id !== semesterId));
            } else {
                alert('Failed to delete semester');
            }
        }
    };
    
    const getStatusColor = (status: SemesterStatus) => {
        switch (status) {
            case SemesterStatus.Active: return 'bg-green-100 text-green-800';
            case SemesterStatus.Upcoming: return 'bg-yellow-100 text-yellow-800';
            case SemesterStatus.Past: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }


    if (loading) return <div>Loading semesters...</div>;

    return (
        <div>
            <PageHeader title="Semesters" subtitle="Manage academic periods for course scheduling." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="BookCopy" className="h-5 w-5 mr-2" />
                        Add Semester
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Semester Name</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Start Date</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">End Date</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {semesters.map(semester => (
                                <tr key={semester.id}>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{semester.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{semester.startDate}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{semester.endDate}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(semester.status)}`}>
                                            {semester.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap space-x-4">
                                        <button onClick={() => handleOpenModal(semester)} className="text-secondary hover:text-secondary-dark font-medium">Edit</button>
                                        <button onClick={() => handleDelete(semester.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedSemester ? 'Edit Semester' : 'Add Semester'}>
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                    <div>
                        <label htmlFor="semester-name" className="block text-sm font-medium text-gray-700 mb-1">Semester Name</label>
                        <input type="text" id="semester-name" value={formData.name} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Fall 2024"/>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="semester-startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="date" id="semester-startDate" value={formData.startDate} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                             <label htmlFor="semester-endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input type="date" id="semester-endDate" value={formData.endDate} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
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

export default SemestersPage;