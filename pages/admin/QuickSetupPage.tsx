import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Icon } from '../../components/icons';
import * as api from '../../services/api';
import { UserRole, UserStatus } from '../../types';

const STEPS = [
    "Welcome",
    "Branding",
    "Academics",
    "First Instructor",
    "Finish"
];

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex items-center justify-center mb-8">
        {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;
            return (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                isCompleted ? 'bg-primary text-gray-800' :
                                isActive ? 'bg-secondary text-white ring-4 ring-secondary-light dark:ring-secondary/20' :
                                'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            {isCompleted ? <Icon name="CheckCircle" className="w-6 h-6" /> : <span className="font-bold">{stepNumber}</span>}
                        </div>
                        <p className={`mt-2 text-sm font-medium ${isActive ? 'text-secondary dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>{step}</p>
                    </div>
                    {stepNumber < STEPS.length && <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                </React.Fragment>
            );
        })}
    </div>
);

const QuickSetupPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        institutionName: '',
        logoUrl: '',
        primaryColor: '#FFD700',
        departmentName: '',
        programName: '',
        programDuration: '',
        instructorName: '',
        instructorEmail: '',
    });

    useEffect(() => {
        const fetchInitialSettings = async () => {
            try {
                const settings = await api.getInstitutionSettings();
                setFormData(prev => ({
                    ...prev,
                    institutionName: settings.institutionName,
                    logoUrl: settings.logoUrl,
                    primaryColor: settings.primaryColor,
                }));
            } catch (error) {
                console.error("Failed to load initial settings", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, STEPS.length));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
    
    const handleFinish = async () => {
        setIsSaving(true);
        try {
            // 1. Save branding settings
            await api.updateInstitutionSettings({
                institutionName: formData.institutionName,
                logoUrl: formData.logoUrl,
                primaryColor: formData.primaryColor
            });

            // 2. Create Department
            const newDept = await api.createDepartment({ name: formData.departmentName, head: 'Admin' });

            // 3. Create Program
            await api.createProgram({ name: formData.programName, departmentId: newDept.id, duration: formData.programDuration });

            // 4. Create Instructor
            await api.createUser({ name: formData.instructorName, email: formData.instructorEmail, role: UserRole.Instructor, status: UserStatus.Active });
            
            // Go to the final step
            handleNext();

        } catch (error) {
            console.error("Failed to complete quick setup", error);
            alert("An error occurred. Please check your inputs and try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <PageHeader title="Quick Setup Wizard" subtitle="Get your LMS up and running in a few simple steps." />
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
                <Stepper currentStep={step} />
                
                <div className="mt-8">
                    {step === 1 && (
                        <div className="text-center">
                            <Icon name="Wrench" className="h-16 w-16 text-primary mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome to Lizoku LMS!</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-xl mx-auto">This setup wizard will guide you through the essential first steps to configure your new learning management system. Let's get started!</p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                             <h2 className="text-xl font-bold text-center">Institution Branding</h2>
                             <div>
                                <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution Name</label>
                                <input type="text" id="institutionName" value={formData.institutionName} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
                                <input type="text" id="logoUrl" value={formData.logoUrl} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Brand Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" id="primaryColor" value={formData.primaryColor} onChange={handleChange} className="h-10 w-10 p-1 border dark:border-gray-600 rounded-md" />
                                    <input type="text" id="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {step === 3 && (
                         <div className="space-y-6">
                             <h2 className="text-xl font-bold text-center">Initial Academic Structure</h2>
                             <div>
                                <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Department Name</label>
                                <input type="text" id="departmentName" value={formData.departmentName} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" placeholder="e.g., School of Computing" />
                            </div>
                             <div>
                                <label htmlFor="programName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Program Name</label>
                                <input type="text" id="programName" value={formData.programName} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" placeholder="e.g., BSc. in Computer Science" />
                            </div>
                             <div>
                                <label htmlFor="programDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Duration</label>
                                <input type="text" id="programDuration" value={formData.programDuration} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" placeholder="e.g., 4 Years" />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                         <div className="space-y-6">
                             <h2 className="text-xl font-bold text-center">Create Your First Instructor</h2>
                             <div>
                                <label htmlFor="instructorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor's Full Name</label>
                                <input type="text" id="instructorName" value={formData.instructorName} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="instructorEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor's Email</label>
                                <input type="email" id="instructorEmail" value={formData.instructorEmail} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md" />
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="text-center">
                            <Icon name="BadgeCheck" className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Setup Complete!</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">You have successfully configured the basics of your LMS.</p>
                             <ul className="mt-4 text-left inline-block bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                                <li><strong>Institution:</strong> {formData.institutionName}</li>
                                <li><strong>Department:</strong> {formData.departmentName}</li>
                                <li><strong>Program:</strong> {formData.programName}</li>
                                <li><strong>Instructor:</strong> {formData.instructorName}</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-10 pt-6 border-t dark:border-gray-700 flex justify-between items-center">
                    {step > 1 && step < STEPS.length && (
                        <button onClick={handleBack} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-2 px-6 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                            Back
                        </button>
                    )}
                    
                    {step < STEPS.length - 1 && (
                         <button onClick={handleNext} className="bg-primary text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-primary-dark ml-auto">
                            Next
                        </button>
                    )}
                    
                    {step === STEPS.length - 1 && (
                        <button onClick={handleFinish} disabled={isSaving} className="bg-primary text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-primary-dark ml-auto disabled:bg-gray-300">
                             {isSaving ? 'Saving...' : 'Finish'}
                        </button>
                    )}

                    {step === STEPS.length && (
                         <button onClick={() => navigate('/admin')} className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 mx-auto">
                            Go to Dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickSetupPage;