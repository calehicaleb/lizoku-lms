import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Rubric, RubricCriterion, RubricLevel } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import { RubricViewer } from '../../components/common/RubricViewer';

const emptyRubric: Omit<Rubric, 'id' | 'instructorId'> = {
    title: 'New Rubric',
    criteria: [
        { id: `c-${Date.now()}`, description: 'Criterion 1', longDescription: '', points: 5, levelDescriptions: {} }
    ],
    levels: [
        { id: `l-${Date.now()}-1`, name: 'Full Marks', points: 5 },
        { id: `l-${Date.now()}-2`, name: 'No Marks', points: 0 },
    ],
};

const RubricsPage: React.FC = () => {
    const { user } = useAuth();
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
    const [formData, setFormData] = useState(emptyRubric);
    
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [rubricForPreview, setRubricForPreview] = useState<Rubric | null>(null);

    const sortedLevels = useMemo(() => {
        return [...formData.levels].sort((a, b) => b.points - a.points);
    }, [formData.levels]);
    
    const totalPoints = useMemo(() => {
        return formData.criteria.reduce((acc, crit) => acc + crit.points, 0);
    }, [formData.criteria]);

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
            // Ensure levelDescriptions is not undefined
            const sanitizedRubric = {
                ...rubric,
                criteria: rubric.criteria.map(c => ({...c, levelDescriptions: c.levelDescriptions || {}}))
            };
            setFormData(sanitizedRubric);
        } else {
            setSelectedRubric(null);
            setFormData(emptyRubric);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleOpenPreviewModal = (rubric: Rubric) => {
        setRubricForPreview(rubric);
        setIsPreviewModalOpen(true);
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
    
    // Form change handlers
    const handleCriterionChange = (index: number, field: keyof Omit<RubricCriterion, 'id'|'levelDescriptions'>, value: string | number) => {
        const newCriteria = [...formData.criteria];
        (newCriteria[index] as any)[field] = value;
        setFormData({ ...formData, criteria: newCriteria });
    };

    const handleLevelChange = (levelId: string, field: keyof RubricLevel, value: string | number) => {
        const newLevels = formData.levels.map(l => l.id === levelId ? {...l, [field]: value} : l);
        setFormData({ ...formData, levels: newLevels });
    };
    
    const handleLevelDescriptionChange = (critIndex: number, levelId: string, value: string) => {
        const newCriteria = [...formData.criteria];
        if (!newCriteria[critIndex].levelDescriptions) {
            newCriteria[critIndex].levelDescriptions = {};
        }
        newCriteria[critIndex].levelDescriptions![levelId] = value;
        setFormData({ ...formData, criteria: newCriteria });
    };

    const addCriterion = () => setFormData({ ...formData, criteria: [...formData.criteria, { id: `c-${Date.now()}`, description: 'New Criterion', points: 5, levelDescriptions: {} }] });
    const removeCriterion = (index: number) => setFormData({ ...formData, criteria: formData.criteria.filter((_, i) => i !== index) });

    const addLevel = () => setFormData({ ...formData, levels: [...formData.levels, { id: `l-${Date.now()}`, name: 'New Level', points: 0 }] });
    const removeLevel = (levelId: string) => setFormData({ ...formData, levels: formData.levels.filter(l => l.id !== levelId) });


    if (loading) return <div>Loading rubrics...</div>;

    return (
        <div>
            <PageHeader title="Rubrics" subtitle="Create and manage reusable rubrics for grading assignments." />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="ClipboardCheck" className="h-5 w-5 mr-2" />
                        Add Rubric
                    </button>
                </div>

                <div className="space-y-4">
                     {rubrics.length > 0 ? rubrics.map(rubric => (
                        <div key={rubric.id} className="p-4 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                             <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{rubric.title}</h3>
                                <div className="flex-shrink-0 space-x-4">
                                    <button onClick={() => handleOpenPreviewModal(rubric)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm">Preview</button>
                                    <button onClick={() => handleOpenModal(rubric)} className="text-secondary dark:text-blue-400 hover:text-secondary-dark dark:hover:text-blue-300 font-medium text-sm">Edit</button>
                                    <button onClick={() => handleDelete(rubric.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                                </div>
                            </div>
                           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rubric.criteria.length} criteria, {rubric.levels.length} levels</p>
                        </div>
                    )) : (
                         <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed dark:border-gray-700">
                            <Icon name="ClipboardCheck" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No Rubrics Created Yet</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click "Add Rubric" to create your first grading rubric.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedRubric ? 'Edit Rubric' : 'Create Rubric'} size="5xl">
                <div className="space-y-4">
                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full text-2xl font-bold bg-transparent focus:outline-none focus:border-b-2 focus:border-primary dark:text-white" />

                    <div className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                        <table className="min-w-full text-sm border-collapse">
                            <thead className="bg-gray-100 dark:bg-gray-700/50">
                                <tr>
                                    <th className="p-2 border-r dark:border-gray-600 font-medium text-left text-gray-700 dark:text-gray-300 w-1/4">Criteria</th>
                                    {sortedLevels.map(level => (
                                        <th key={level.id} className="p-2 border-r dark:border-gray-600 font-medium text-center text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <input type="text" value={level.name} onChange={e => handleLevelChange(level.id, 'name', e.target.value)} className="w-full text-center font-medium bg-transparent focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded-sm" />
                                                <button onClick={() => removeLevel(level.id)} className="text-gray-400 hover:text-red-500"><Icon name="X" className="h-3 w-3"/></button>
                                            </div>
                                            <input type="number" value={level.points} onChange={e => handleLevelChange(level.id, 'points', Number(e.target.value))} className="w-20 text-center bg-transparent focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded-sm" />
                                        </th>
                                    ))}
                                    <th className="p-2"><button onClick={addLevel} className="text-secondary dark:text-blue-400 hover:underline text-xs">Add Level</button></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.criteria.map((criterion, critIndex) => (
                                    <tr key={criterion.id} className="border-t dark:border-gray-600">
                                        <td className="p-2 border-r dark:border-gray-600 align-top">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1">
                                                    <input value={criterion.description} onChange={e => handleCriterionChange(critIndex, 'description', e.target.value)} className="w-full font-bold bg-transparent focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded-sm" />
                                                    <button onClick={() => removeCriterion(critIndex)} className="text-gray-400 hover:text-red-500"><Icon name="X" className="h-3 w-3" /></button>
                                                </div>
                                                <textarea value={criterion.longDescription || ''} onChange={e => handleCriterionChange(critIndex, 'longDescription', e.target.value)} placeholder="Click to add description..." rows={2} className="w-full text-xs mt-1 bg-transparent focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded-sm" />
                                                <div className="flex items-center mt-2">
                                                    <input type="number" value={criterion.points} onChange={e => handleCriterionChange(critIndex, 'points', Number(e.target.value))} className="w-20 text-center font-bold bg-transparent focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded-sm" />
                                                    <span className="text-xs text-gray-500">pts</span>
                                                </div>
                                            </div>
                                        </td>
                                        {sortedLevels.map(level => (
                                            <td key={level.id} className="p-2 border-r dark:border-gray-600 align-top">
                                                <textarea
                                                    value={criterion.levelDescriptions?.[level.id] || ''}
                                                    onChange={e => handleLevelDescriptionChange(critIndex, level.id, e.target.value)}
                                                    placeholder="Description..."
                                                    rows={4}
                                                    className="w-full h-full text-xs bg-transparent focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded-sm"
                                                />
                                            </td>
                                        ))}
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button onClick={addCriterion} className="mt-2 text-sm text-secondary dark:text-blue-400 hover:underline">+ Add Criterion</button>

                </div>
                 <div className="pt-4 mt-4 border-t dark:border-gray-700 flex justify-between items-center">
                    <span className="font-bold text-lg dark:text-gray-200">Total Points: {totalPoints}</span>
                    <div className="flex space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Save Rubric</button>
                    </div>
                </div>
            </Modal>
            
            {rubricForPreview && (
                <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Rubric Preview (Student View)" size="5xl">
                    <RubricViewer rubric={rubricForPreview} />
                </Modal>
            )}
        </div>
    );
};

export default RubricsPage;