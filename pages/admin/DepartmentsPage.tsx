import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Department } from '../../types';
import { Icon } from '../../components/icons';

const emptyDept: Partial<Department> = {
    name: '',
    head: '',
};

const DepartmentsPage: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState<Partial<Department>>(emptyDept);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await api.getDepartments();
                setDepartments(data);
            } catch (error) {
                console.error("Failed to fetch departments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleOpenModal = (dept: Department | null = null) => {
        if (dept) {
            setSelectedDept(dept);
            setFormData(dept);
        } else {
            setSelectedDept(null);
            setFormData(emptyDept);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDept(null);
        setFormData(emptyDept);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id.replace('dept-', '')]: value }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.head) {
            alert('Please fill all fields.');
            return;
        }

        try {
            if (selectedDept) {
                const updated = await api.updateDepartment(selectedDept.id, formData as any);
                if (updated) {
                    setDepartments(departments.map(d => d.id === updated.id ? updated : d));
                }
            } else {
                const created = await api.createDepartment(formData as any);
                setDepartments([...departments, created]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save department", error);
        }
    };
    
    const handleDelete = async (deptId: string) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            const result = await api.deleteDepartment(deptId);
            if (result.success) {
                setDepartments(departments.filter(d => d.id !== deptId));
            } else {
                alert('Failed to delete department.');
            }
        }
    };

    if (loading) return <div>Loading departments...</div>;

    return (
        <div>
            <PageHeader title="Departments" subtitle="Manage the highest level of academic structure." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="Building" className="h-5 w-5 mr-2" />
                        Add Department
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Department Name</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Head of Department</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Programs</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {departments.map(dept => (
                                <tr key={dept.id}>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{dept.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{dept.head}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{dept.programCount}</td>
                                    <td className="px-4 py-3 whitespace-nowrap space-x-4">
                                        <button onClick={() => handleOpenModal(dept)} className="text-secondary hover:text-secondary-dark font-medium">Edit</button>
                                        <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedDept ? 'Edit Department' : 'Add Department'}>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                        <input type="text" id="dept-name" value={formData.name} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label htmlFor="dept-head" className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
                        <input type="text" id="dept-head" value={formData.head} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
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

export default DepartmentsPage;