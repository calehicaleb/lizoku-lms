
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/icons';
import { Modal } from '../components/ui/Modal';
import { generatePasswordHint } from '../services/geminiService';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isHintModalOpen, setHintModalOpen] = useState(false);
    const [hintEmail, setHintEmail] = useState('');
    const [generatedHint, setGeneratedHint] = useState('');
    const [isHintLoading, setHintLoading] = useState(false);
    const [isSignupModalOpen, setSignupModalOpen] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = await login(email, password);
        if (user) {
            const path = user.role === 'student' ? '/dashboard' : `/${user.role}`;
            navigate(path);
        } else {
            setError('Invalid email or password. Please try again.');
        }
    };

    const handleRequestHint = async () => {
        setHintLoading(true);
        setGeneratedHint('');
        const hint = await generatePasswordHint({ name: hintEmail.split('@')[0], email: hintEmail });
        setGeneratedHint(hint);
        setHintLoading(false);
    };

    return (
        <div className="min-h-screen bg-light-cream flex flex-col lg:flex-row">
            <div className="flex-1 bg-secondary-light flex-col justify-center p-8 lg:p-12 hidden lg:flex">
                <h1 className="text-4xl font-bold text-secondary mb-4">Lizoku Learning Management System</h1>
                <p className="text-lg text-gray-700 mb-8">A modern, cloud-native, AI-enhanced educational platform for Kenya.</p>
                <ul className="space-y-4 text-gray-800">
                    <li className="flex items-center"><Icon name="CheckCircle" className="h-6 w-6 text-primary mr-3" /> AI-powered content generation</li>
                    <li className="flex items-center"><Icon name="BookOpen" className="h-6 w-6 text-primary mr-3" /> Comprehensive course management</li>
                    <li className="flex items-center"><Icon name="ListChecks" className="h-6 w-6 text-primary mr-3" /> Advanced assessment tools</li>
                    <li className="flex items-center"><Icon name="BarChart2" className="h-6 w-6 text-primary mr-3" /> Detailed reporting and analytics</li>
                </ul>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
                    <form onSubmit={handleLogin}>
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300">
                            Sign In
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <button onClick={() => setHintModalOpen(true)} className="text-sm text-secondary hover:underline">Forgot your password?</button>
                    </div>
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">Don't have an account? <button onClick={() => setSignupModalOpen(true)} className="font-bold text-secondary hover:underline">Sign up</button></p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isHintModalOpen} onClose={() => setHintModalOpen(false)} title="Forgot Password">
                <p className="text-sm text-gray-600 mb-4">Enter your email and we'll send you an AI-generated password hint.</p>
                <div className="mb-4">
                    <label htmlFor="hint-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="hint-email" value={hintEmail} onChange={(e) => setHintEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter your email" />
                </div>
                {isHintLoading && <p>Generating hint...</p>}
                {generatedHint && <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-800">{generatedHint}</div>}
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={() => setHintModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                    <button onClick={handleRequestHint} disabled={isHintLoading} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Send Hint</button>
                </div>
            </Modal>
            
            <Modal isOpen={isSignupModalOpen} onClose={() => setSignupModalOpen(false)} title="Create Account">
                <p className="text-sm text-gray-600 mb-4">Your new account will be in a "Pending Approval" state until activated by an Administrator.</p>
                 {/* Signup form fields would go here */}
                 <div className="mt-6 flex justify-end">
                     <button onClick={() => { alert('Sign up successful! Please wait for admin approval.'); setSignupModalOpen(false); }} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Create Account</button>
                 </div>
            </Modal>
        </div>
    );
};

export default LoginPage;
