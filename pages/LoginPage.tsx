import React, { useState, useEffect, useMemo } from 'react';
// Fix: Added Link to the imports from react-router-dom.
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon, IconName } from '../components/icons';
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
    const location = useLocation();
    
    // Get institutional context from landing page state
    const institutionSlug = location.state?.institution;

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

    const handleQuickLogin = async (role: UserRole) => {
        setIsLoggingIn(true);
        setError('');
        
        let demoEmail = '';
        switch(role) {
            case UserRole.Admin: demoEmail = 'admin@lizoku.com'; break;
            case UserRole.Instructor: demoEmail = 'sam@lizoku.com'; break;
            case UserRole.Student: demoEmail = 'alice@lizoku.com'; break;
        }

        const user = await login(demoEmail, 'demo'); // Password ignored by mock api
        if (user) {
            const path = user.role === 'student' ? '/dashboard' : `/${user.role}`;
            navigate(path);
        } else {
            setError('Failed to log in as ' + role);
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
                role: UserRole.Student,
                status: UserStatus.Pending,
            });
            if (newUser) {
                alert('Sign up successful! Please wait for admin approval.');
                setSignupModalOpen(false);
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
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            {/* Minimal Login Header */}
            <header className="p-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-primary p-1 rounded-md group-hover:rotate-12 transition-transform">
                        <Icon name="GraduationCap" className="h-6 w-6 text-gray-900" />
                    </div>
                    <span className="text-xl font-black tracking-tighter">LIZOKU</span>
                </Link>
                {institutionSlug && (
                    <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                        <Icon name="Building2" className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-bold uppercase text-gray-500">{institutionSlug} Portal</span>
                    </div>
                )}
            </header>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Portal Login</h2>
                        {institutionSlug ? (
                             <p className="text-gray-500 mt-2 font-medium">Welcome back to <span className="text-primary-dark font-black capitalize">{institutionSlug}</span>.</p>
                        ) : (
                            <p className="text-gray-500 mt-2 font-medium">Please sign in to access your dashboard.</p>
                        )}
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && <p className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">{error}</p>}
                        
                        <div>
                            <label htmlFor="email" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border border-transparent focus:border-primary focus:bg-white transition-all rounded-2xl outline-none font-bold"
                                placeholder="name@school.edu"
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label htmlFor="password" className="block text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                                <button type="button" onClick={() => setHintModalOpen(true)} className="text-xs font-bold text-primary-dark hover:underline">Forgot?</button>
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border border-transparent focus:border-primary focus:bg-white transition-all rounded-2xl outline-none font-bold"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={isLoggingIn} className="w-full bg-primary text-gray-900 font-black py-4 px-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none disabled:active:scale-100 uppercase tracking-widest text-sm">
                            {isLoggingIn ? 'Verifying...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="relative flex py-8 items-center">
                        <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Demo Access</span>
                        <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-10">
                        <button onClick={() => handleQuickLogin(UserRole.Admin)} className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group">
                            <Icon name="Shield" className="h-5 w-5 text-gray-400 group-hover:text-primary-dark" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">Admin</span>
                        </button>
                        <button onClick={() => handleQuickLogin(UserRole.Instructor)} className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group">
                            <Icon name="Presentation" className="h-5 w-5 text-gray-400 group-hover:text-primary-dark" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">Prof</span>
                        </button>
                        <button onClick={() => handleQuickLogin(UserRole.Student)} className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group">
                            <Icon name="GraduationCap" className="h-5 w-5 text-gray-400 group-hover:text-primary-dark" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">Student</span>
                        </button>
                    </div>

                    <p className="text-center text-sm font-bold text-gray-400">
                        New here? <button onClick={() => setSignupModalOpen(true)} className="text-primary-dark hover:underline">Create institutional account</button>
                    </p>
                </div>
            </div>

            {/* Hint Modal */}
            <Modal isOpen={isHintModalOpen} onClose={() => setHintModalOpen(false)} title="Security Hint">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">Enter your institutional email. Our AI will analyze your profile and provide a secure mnemonic hint.</p>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Institutional Email</label>
                        <input type="email" value={hintEmail} onChange={(e) => setHintEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 ring-primary outline-none font-bold" placeholder="name@school.edu" />
                    </div>
                    {isHintLoading && <p className="text-center py-4 animate-pulse text-primary-dark font-black uppercase text-xs tracking-widest">Generating secure hint...</p>}
                    {generatedHint && (
                        <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 animate-in zoom-in-95">
                            <p className="text-xs font-black text-primary-dark uppercase tracking-widest mb-1">AI-Generated Hint:</p>
                            <p className="text-gray-800 dark:text-gray-200 font-bold italic leading-relaxed">"{generatedHint}"</p>
                        </div>
                    )}
                    <div className="flex justify-end pt-4">
                        <button onClick={handleRequestHint} disabled={isHintLoading} className="bg-primary text-gray-900 font-black px-8 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50">Generate</button>
                    </div>
                </div>
            </Modal>

            {/* Signup Modal */}
            <Modal isOpen={isSignupModalOpen} onClose={() => setSignupModalOpen(false)} title="Account Request">
                {isFetchingSettings ? <p className="text-center py-12">Loading security policy...</p> : (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500 font-medium">Requested accounts are placed in a 'Pending' state for registrar verification.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                <input type="text" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</label>
                                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl outline-none font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Password</label>
                                    <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirm</label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl outline-none font-bold" />
                                </div>
                            </div>
                        </div>

                        {securitySettings && signupPassword.length > 0 && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Policy Validation</h4>
                                <ul className="text-xs font-bold space-y-1">
                                    <ValidationItem isValid={passwordValidation.minLength}>8+ Characters</ValidationItem>
                                    <ValidationItem isValid={passwordValidation.requireUppercase}>Uppercase Letter</ValidationItem>
                                    <ValidationItem isValid={passwordValidation.requireNumber}>Contains Number</ValidationItem>
                                    <ValidationItem isValid={passwordValidation.passwordsMatch}>Passwords Match</ValidationItem>
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6">
                            <button onClick={() => setSignupModalOpen(false)} className="px-6 py-3 font-bold text-gray-400">Cancel</button>
                            <button onClick={handleSignup} disabled={isSigningUp || !passwordValidation.isValid} className="bg-primary text-gray-900 font-black px-10 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-primary-dark transition-all disabled:opacity-30">Request Access</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const ValidationItem: React.FC<{isValid: boolean, children: React.ReactNode}> = ({ isValid, children }) => (
    <li className={`flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-gray-400 opacity-60'}`}>
        <Icon name={isValid ? "CheckCircle" : "ChevronRight"} className="h-3 w-3" />
        {children}
    </li>
);

export default LoginPage;
