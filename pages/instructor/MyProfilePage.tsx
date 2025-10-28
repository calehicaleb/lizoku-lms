
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { generateAIAvatar } from '../../services/geminiService';
import { Icon } from '../../components/icons';

const InstructorMyProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();

    // Profile Info State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    
    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });


    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);
    
    if (!user) {
        return <div>Loading profile...</div>;
    }

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileMessage({ type: '', text: '' });

        const updatedUser = await api.updateUser(user.id, { name, email });
        if (updatedUser) {
            updateUser(updatedUser);
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } else {
            setProfileMessage({ type: 'error', text: 'Failed to update profile.' });
        }
        setIsSavingProfile(false);
    };

    const handleAvatarRegenerate = async () => {
        setIsGeneratingAvatar(true);
        setProfileMessage({ type: '', text: '' });
        try {
            const newAvatarUrl = await generateAIAvatar(user.name);
            const updatedUser = await api.updateUser(user.id, { avatarUrl: newAvatarUrl });
            if (updatedUser) {
                updateUser(updatedUser);
                setProfileMessage({ type: 'success', text: 'New avatar generated and saved!' });
            } else {
                 throw new Error("Failed to save new avatar.");
            }
        } catch (error) {
             setProfileMessage({ type: 'error', text: 'Could not generate avatar. Please try again.' });
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 8) {
             setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
            return;
        }
        
        setIsChangingPassword(true);
        setPasswordMessage({ type: '', text: '' });

        const result = await api.changeUserPassword(user.id, currentPassword, newPassword);
        if (result.success) {
            setPasswordMessage({ type: 'success', text: result.message });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPasswordMessage({ type: 'error', text: result.message });
        }
        setIsChangingPassword(false);
    };

    return (
        <div>
            <PageHeader title="My Profile" subtitle="Manage your personal information and account settings." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information Card */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Personal Information</h3>
                    
                    <div className="flex items-center mb-6">
                        <img src={user.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-primary" />
                        <div className="ml-6">
                             <button
                                onClick={handleAvatarRegenerate}
                                disabled={isGeneratingAvatar}
                                className="bg-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-secondary-dark transition duration-300 flex items-center disabled:bg-gray-400"
                            >
                                <Icon name="Sparkles" className={`h-5 w-5 mr-2 ${isGeneratingAvatar ? 'animate-spin' : ''}`} />
                                {isGeneratingAvatar ? 'Generating...' : 'Regenerate AI Avatar'}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Generate a unique new avatar for your profile.</p>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleProfileSave}>
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                             <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        {profileMessage.text && (
                            <div className={`p-3 rounded-md text-sm ${profileMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                {profileMessage.text}
                            </div>
                        )}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 disabled:bg-gray-400"
                            >
                                {isSavingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Card */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Change Password</h3>
                     <form className="space-y-4" onSubmit={handlePasswordChange}>
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                                required
                            />
                        </div>
                        {passwordMessage.text && (
                            <div className={`p-3 rounded-md text-sm ${passwordMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                {passwordMessage.text}
                            </div>
                        )}
                         <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 disabled:bg-gray-400"
                            >
                                {isChangingPassword ? 'Updating...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                 </div>
            </div>
        </div>
    );
};

export default InstructorMyProfilePage;
