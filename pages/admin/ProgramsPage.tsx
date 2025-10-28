import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Program, Department } from '../../types';
import { Icon } from '../../components/icons';

const emptyProgram: Partial<Program> = {
    name: '',
    departmentId: '',
    duration: ''
};

const ProgramsPage: React.FC = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [formData, setFormData] = useState<Partial<Program>>(emptyProgram);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [programsData, deptsData] = await Promise.all([
                    api.getPrograms(),
                    api.getDepartments(),
                ]);
                setPrograms(programsData);
                setDepartments(deptsData);
                // Set default department for new program form
                if (deptsData.length > 0) {
                    emptyProgram.departmentId = deptsData[0].id;
                }
            } catch (error) {
                console.error("Failed to fetch programs or departments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (program: Program | null = null) => {
        if (program) {
            setSelectedProgram(program);
            setFormData(program);
        } else {
            setSelectedProgram(null);
            setFormData(emptyProgram);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProgram(null);
        setFormData(emptyProgram);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id.replace('prog-', '')]: value }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.departmentId || !formData.duration) {
            alert('Please fill all fields.');
            return;
        }
        
        try {
            if (selectedProgram) {
                const updated = await api.updateProgram(selectedProgram.id, formData as any);
                if (updated) {
                    setPrograms(programs.map(p => p.id === updated.id ? updated : p));
                }
            } else {
                const created = await api.createProgram(formData as any);
                setPrograms([...programs, created]);
            }
            handleCloseModal();
        } catch(error) {
            console.error("Failed to save program", error);
        }
    };
    
    const handleDelete = async (programId: string) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            const result = await api.deleteProgram(programId);
            if(result.success) {
                setPrograms(programs.filter(p => p.id !== programId));
            } else {
                alert('Failed to delete program.');
            }
        }
    };

    if (loading) return <div>Loading programs...</div>;

    return (
        <div>
            <PageHeader title="Programs" subtitle="Manage academic programs and assign them to departments." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="GraduationCap" className="h-5 w-5 mr-2" />
                        Add Program
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Program Name</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Department</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Courses</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Duration</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {programs.map(prog => (
                                <tr key={prog.id}>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{prog.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{prog.departmentName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{prog.courseCount}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{prog.duration}</td>
                                    <td className="px-4 py-3 whitespace-nowrap space-x-4">
                                        <button onClick={() => handleOpenModal(prog)} className="text-secondary hover:text-secondary-dark font-medium">Edit</button>
                                        <button className="text-secondary hover:text-secondary-dark font-medium">Manage Courses</button>
                                        <button onClick={() => handleDelete(prog.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedProgram ? 'Edit Program' : 'Add Program'}>
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                    <div>
                        <label htmlFor="prog-name" className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                        <input type="text" id="prog-name" value={formData.name} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label htmlFor="prog-departmentId" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select id="prog-departmentId" value={formData.departmentId} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="prog-duration" className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input type="text" id="prog-duration" value={formData.duration} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
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

export default ProgramsPage;