

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/icons';
import { Modal } from '../components/ui/Modal';
import { generatePasswordHint } from '../services/geminiService';
import * as api from '../services/api';
import { SecuritySettings, UserRole, UserStatus } from '../types';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isHintModalOpen, setHintModalOpen] = useState(false);
    const [hintEmail, setHintEmail] = useState('');
    const [generatedHint, setGeneratedHint] = useState('');
    const [isHintLoading, setHintLoading] = useState(false);
    const [isSignupModalOpen, setSignupModalOpen] = useState(false);
    
    // Sign up form state
    const [signupFullName, setSignupFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
    const [isFetchingSettings, setIsFetchingSettings] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSignupModalOpen) {
            const fetchSettings = async () => {
                setIsFetchingSettings(true);
                try {
                    const settings = await api.getSecuritySettings();
                    setSecuritySettings(settings);
                } catch (error) {
                    console.error("Failed to fetch security settings", error);
                } finally {
                    setIsFetchingSettings(false);
                }
            };
            fetchSettings();
        }
    }, [isSignupModalOpen]);

    const passwordValidation = useMemo(() => {
        if (!securitySettings) {
            return {
                minLength: false,
                requireUppercase: false,
                requireNumber: false,
                passwordsMatch: false,
                isValid: false,
            };
        }

        const { passwordPolicy } = securitySettings;
        const validations = {
            minLength: !passwordPolicy.minLength || signupPassword.length >= 8,
            requireUppercase: !passwordPolicy.requireUppercase || /[A-Z]/.test(signupPassword),
            requireNumber: !passwordPolicy.requireNumber || /[0-9]/.test(signupPassword),
            passwordsMatch: signupPassword === confirmPassword && signupPassword.length > 0,
        };
        
        const isValid = Object.values(validations).every(Boolean);

        return { ...validations, isValid };
    }, [signupPassword, confirmPassword, securitySettings]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        const user = await login(email, password);
        if (user) {
            const path = user.role === 'student' ? '/dashboard' : `/${user.role}`;
            navigate(path);
        } else {
            setError('Invalid email or password. Please try again.');
            setIsLoggingIn(false);
        }
    };

    const handleRequestHint = async () => {
        setHintLoading(true);
        setGeneratedHint('');
        const hint = await generatePasswordHint({ name: hintEmail.split('@')[0], email: hintEmail });
        setGeneratedHint(hint);
        setHintLoading(false);
    };
    
    const handleSignup = async () => {
        setIsSigningUp(true);
        try {
            const newUser = await api.signupUser({
                name: signupFullName,
                email: signupEmail,
                // Defaulting new signups to Student role and Pending status
                role: UserRole.Student,
                status: UserStatus.Pending,
            });
            if (newUser) {
                alert('Sign up successful! Please wait for admin approval.');
                setSignupModalOpen(false);
                // Reset form
                setSignupFullName('');
                setSignupEmail('');
                setSignupPassword('');
                setConfirmPassword('');
            } else {
                throw new Error("Signup failed on the backend.");
            }
        } catch (error) {
            console.error("Signup failed", error);
            alert("An error occurred during signup. Please try again.");
        } finally {
            setIsSigningUp(false);
        }
    }

    return (
        <div className="min-h-screen bg-light-cream dark:bg-gray-900 flex flex-col lg:flex-row">
            <div className="flex-1 bg-secondary-light dark:bg-gray-900/50 flex-col justify-center p-8 lg:p-12 hidden lg:flex">
                <h1 className="text-4xl font-bold text-secondary dark:text-blue-300 mb-4">Lizoku Learning Management System</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">A modern, cloud-native, AI-enhanced educational platform for Kenya.</p>
                <ul className="space-y-4 text-gray-800 dark:text-gray-200">
                    <li className="flex items-center"><Icon name="CheckCircle" className="h-6 w-6 text-primary mr-3" /> AI-powered content generation</li>
                    <li className="flex items-center"><Icon name="BookOpen" className="h-6 w-6 text-primary mr-3" /> Comprehensive course management</li>
                    <li className="flex items-center"><Icon name="ListChecks" className="h-6 w-6 text-primary mr-3" /> Advanced assessment tools</li>
                    <li className="flex items-center"><Icon name="BarChart2" className="h-6 w-6 text-primary mr-3" /> Detailed reporting and analytics</li>
                </ul>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Welcome Back</h2>
                    <form onSubmit={handleLogin}>
                        {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button type="submit" disabled={isLoggingIn} className="w-full bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">
                            {isLoggingIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <button onClick={() => setHintModalOpen(true)} className="text-sm text-secondary dark:text-blue-400 hover:underline">Forgot your password?</button>
                    </div>
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Don't have an account? <button onClick={() => setSignupModalOpen(true)} className="font-bold text-secondary dark:text-blue-400 hover:underline">Sign up</button></p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isHintModalOpen} onClose={() => setHintModalOpen(false)} title="Forgot Password">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter your email and we'll send you an AI-generated password hint.</p>
                <div className="mb-4">
                    <label htmlFor="hint-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" id="hint-email" value={hintEmail} onChange={(e) => setHintEmail(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter your email" />
                </div>
                {isHintLoading && <p>Generating hint...</p>}
                {generatedHint && <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-md text-blue-800 dark:text-blue-300">{generatedHint}</div>}
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={() => setHintModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleRequestHint} disabled={isHintLoading} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Send Hint</button>
                </div>
            </Modal>
            
            <Modal isOpen={isSignupModalOpen} onClose={() => setSignupModalOpen(false)} title="Create Account">
                {isFetchingSettings ? <p>Loading settings...</p> : (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Your new account will be in a "Pending Approval" state until activated by an Administrator.</p>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                             <div>
                                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input type="text" id="signup-name" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" id="signup-email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input type="password" id="signup-password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                            </div>
                             <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                            </div>
                        </form>
                        
                        {securitySettings && signupPassword.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-medium">Password requirements:</h4>
                                <ul className="text-xs list-disc list-inside space-y-1">
                                    {securitySettings.passwordPolicy.minLength && <li className={passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>At least 8 characters</li>}
                                    {securitySettings.passwordPolicy.requireUppercase && <li className={passwordValidation.requireUppercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>Contains an uppercase letter</li>}
                                    {securitySettings.passwordPolicy.requireNumber && <li className={passwordValidation.requireNumber ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>Contains a number</li>}
                                    <li className={passwordValidation.passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>Passwords match</li>
                                </ul>
                            </div>
                        )}
                        
                        <div className="pt-4 flex justify-end space-x-2">
                            <button onClick={() => setSignupModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                            <button onClick={handleSignup} disabled={isSigningUp || !passwordValidation.isValid} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed">
                                {isSigningUp ? 'Signing Up...' : 'Sign Up'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

// Fix: Add default export to make the component available for import in other files.
export default LoginPage;
