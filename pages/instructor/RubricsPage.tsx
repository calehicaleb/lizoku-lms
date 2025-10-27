import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Rubric, RubricCriterion, RubricLevel } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';

const emptyRubric: Omit<Rubric, 'id' | 'instructorId'> = {
    title: '',
    criteria: [{ id: `c-${Date.now()}`, description: '', points: 10 }],
    levels: [
        { id: `l-${Date.now()}-1`, name: 'Excellent', points: 10 },
        { id: `l-${Date.now()}-2`, name: 'Good', points: 7 },
        { id: `l-${Date.now()}-3`, name: 'Needs Improvement', points: 4 },
    ],
};

const RubricsPage: React.FC = () => {
    const { user } = useAuth();
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
    const [formData, setFormData] = useState(emptyRubric);

    useEffect(() => {
        if (!user) return;
        const fetchRubrics = async () => {
            try {
                const data = await api.getRubrics(user.id);
                setRubrics(data);
            } catch (error) {
                console.error("Failed to fetch rubrics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRubrics();
    }, [user]);

    const handleOpenModal = (rubric: Rubric | null = null) => {
        if (rubric) {
            setSelectedRubric(rubric);
            setFormData(rubric);
        } else {
            setSelectedRubric(null);
            setFormData(emptyRubric);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRubric(null);
        setFormData(emptyRubric);
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !user) {
            alert('Rubric title cannot be empty.');
            return;
        }

        try {
            if (selectedRubric) {
                const updated = await api.updateRubric(selectedRubric.id, formData);
                if (updated) {
                    setRubrics(rubrics.map(r => r.id === updated.id ? updated : r));
                }
            } else {
                const created = await api.createRubric({ ...formData, instructorId: user.id });
                setRubrics([created, ...rubrics]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save rubric", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this rubric?')) {
            const result = await api.deleteRubric(id);
            if (result.success) {
                setRubrics(rubrics.filter(r => r.id !== id));
            } else {
                alert('Failed to delete rubric.');
            }
        }
    };
    
    // Form change handlers for nested state
    const handleCriterionChange = (index: number, field: keyof RubricCriterion, value: string) => {
        const newCriteria = [...formData.criteria];
        (newCriteria[index] as any)[field] = field === 'points' ? parseInt(value) || 0 : value;
        setFormData({ ...formData, criteria: newCriteria });
    };

    const handleLevelChange = (index: number, field: keyof RubricLevel, value: string) => {
        const newLevels = [...formData.levels];
        (newLevels[index] as any)[field] = field === 'points' ? parseInt(value) || 0 : value;
        setFormData({ ...formData, levels: newLevels });
    };

    const addCriterion = () => {
        setFormData({
            ...formData,
            criteria: [...formData.criteria, { id: `c-${Date.now()}`, description: '', points: 10 }]
        });
    };
    
    const removeCriterion = (index: number) => {
        setFormData({ ...formData, criteria: formData.criteria.filter((_, i) => i !== index) });
    };

    const addLevel = () => {
        setFormData({
            ...formData,
            levels: [...formData.levels, { id: `l-${Date.now()}`, name: '', points: 0 }]
        });
    };
    
     const removeLevel = (index: number) => {
        setFormData({ ...formData, levels: formData.levels.filter((_, i) => i !== index) });
    };


    if (loading) return <div>Loading rubrics...</div>;

    return (
        <div>
            <PageHeader title="Rubrics" subtitle="Create and manage reusable rubrics for grading assignments." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="ClipboardCheck" className="h-5 w-5 mr-2" />
                        Add Rubric
                    </button>
                </div>

                <div className="space-y-4">
                     {rubrics.length > 0 ? rubrics.map(rubric => (
                        <div key={rubric.id} className="p-4 border rounded-md bg-gray-50">
                             <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-800">{rubric.title}</h3>
                                <div className="flex-shrink-0 space-x-4">
                                    <button onClick={() => handleOpenModal(rubric)} className="text-secondary hover:text-secondary-dark font-medium text-sm">Edit</button>
                                    <button onClick={() => handleDelete(rubric.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                                </div>
                            </div>
                           <p className="text-sm text-gray-500 mt-1">{rubric.criteria.length} criteria, {rubric.levels.length} levels</p>
                        </div>
                    )) : (
                         <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
                            <Icon name="ClipboardCheck" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Rubrics Created Yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Click "Add Rubric" to create your first grading rubric.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedRubric ? 'Edit Rubric' : 'Create Rubric'}>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="rubric-title" className="block text-sm font-medium text-gray-700 mb-1">Rubric Title</label>
                        <input type="text" id="rubric-title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    {/* Criteria Section */}
                    <div>
                        <h3 className="font-bold mb-2">Criteria</h3>
                        <div className="space-y-2">
                            {formData.criteria.map((c, i) => (
                                <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                                    <textarea value={c.description} onChange={e => handleCriterionChange(i, 'description', e.target.value)} rows={1} placeholder="Criterion description" className="col-span-8 px-2 py-1 border rounded-md" />
                                    <input type="number" value={c.points} onChange={e => handleCriterionChange(i, 'points', e.target.value)} className="col-span-3 px-2 py-1 border rounded-md" />
                                    <button type="button" onClick={() => removeCriterion(i)} className="col-span-1 text-gray-400 hover:text-red-600">
                                        <Icon name="X" className="h-4 w-4 mx-auto" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addCriterion} className="mt-2 text-sm text-secondary hover:underline">+ Add Criterion</button>
                    </div>

                    {/* Levels Section */}
                     <div>
                        <h3 className="font-bold mb-2">Performance Levels</h3>
                        <div className="space-y-2">
                            {formData.levels.map((l, i) => (
                                <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                                    <input type="text" value={l.name} onChange={e => handleLevelChange(i, 'name', e.target.value)} placeholder="Level name" className="col-span-8 px-2 py-1 border rounded-md" />
                                    <input type="number" value={l.points} onChange={e => handleLevelChange(i, 'points', e.target.value)} className="col-span-3 px-2 py-1 border rounded-md" />
                                    <button type="button" onClick={() => removeLevel(i)} className="col-span-1 text-gray-400 hover:text-red-600">
                                        <Icon name="X" className="h-4 w-4 mx-auto" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addLevel} className="mt-2 text-sm text-secondary hover:underline">+ Add Level</button>
                    </div>
                </div>
                 <div className="pt-4 mt-4 border-t flex justify-end space-x-2">
                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Save Rubric</button>
                </div>
            </Modal>
        </div>
    );
};

export default RubricsPage;