
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';
import { User, InstitutionSettings } from '../types';
import { Icon } from '../components/icons';

const ActivationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [record, setRecord] = useState<User | null>(null);
    const [settings, setSettings] = useState<InstitutionSettings | null>(null);

    // Form State
    const [regNo, setRegNo] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        const init = async () => {
            try {
                const [userRecord, instSettings] = await Promise.all([
                    api.getActivationRecord(token),
                    api.getInstitutionSettings()
                ]);
                setRecord(userRecord);
                setSettings(instSettings);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        init();
    }, [token]);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!record) return;

        if (regNo.toLowerCase() !== record.registrationNumber?.toLowerCase()) {
            setError('Registration Number verification failed. Please check your admission letter.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setVerifying(true);
        try {
            const success = await api.activateStudentAccount(record.id, regNo, password);
            if (success) {
                alert('Account activated successfully! You can now log in.');
                navigate('/login');
            } else {
                setError('Activation failed. The registration number does not match our records.');
            }
        } catch (err) {
            setError('An error occurred during activation.');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-gray-400">Verifying Invite Token...</div>;

    if (!token || !record) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg border border-red-100">
                    <Icon name="AlertTriangle" className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Invalid or Expired Link</h1>
                    <p className="text-gray-500 leading-relaxed font-medium mb-8">This invite link is no longer valid. Please contact your institution's registrar for a new activation link.</p>
                    <Link to="/" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest">Back to Portal</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="p-8 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-1.5 rounded-xl">
                        <Icon name="GraduationCap" className="h-7 w-7 text-gray-900" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase">{settings?.institutionName || 'LIZOKU'}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Official Activation Link</span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 py-12">
                <div className="w-full max-w-xl">
                    <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.05)] border border-gray-100">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">Complete Your Enrollment</h1>
                            <p className="text-gray-500 font-medium">Welcome, <span className="text-primary-dark font-black">{record.name}</span>! Verify your identity to activate your student portal.</p>
                        </div>

                        <form onSubmit={handleActivate} className="space-y-6">
                            {error && <p className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">Error: {error}</p>}
                            
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Identity Verification</label>
                                <input 
                                    required
                                    type="text"
                                    value={regNo}
                                    onChange={e => setRegNo(e.target.value)}
                                    placeholder="Enter Registration / Admission No"
                                    className="w-full px-6 py-4 bg-white border border-transparent focus:border-primary transition-all rounded-2xl outline-none font-bold text-lg"
                                />
                                <p className="text-[10px] text-gray-400 mt-2 ml-2 italic">Must match your institutional record (e.g. STU/101)</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Set Password</label>
                                    <input 
                                        required
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-primary font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                                    <input 
                                        required
                                        type="password"
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-primary font-bold"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={verifying}
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {verifying ? 'Verifying Identity...' : 'Activate My Portal'}
                            </button>
                        </form>
                        
                        <p className="mt-8 text-center text-xs text-gray-400 font-medium">By activating, you agree to the institution's terms of service and data privacy policy.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ActivationPage;
