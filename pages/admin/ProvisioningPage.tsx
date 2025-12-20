
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Icon } from '../../components/icons';
import * as api from '../../services/api';
import { InstitutionSettings, User, UserStatus, Program } from '../../types';

const ProvisioningPage: React.FC = () => {
    const [settings, setSettings] = useState<InstitutionSettings | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Policy State
    const [newDomain, setNewDomain] = useState('');

    // Import State
    const [csvContent, setCsvContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, u, p] = await Promise.all([
                    api.getInstitutionSettings(),
                    api.getAllUsers(),
                    api.getPrograms()
                ]);
                setSettings(s);
                setAllUsers(u);
                setPrograms(p);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const pendingInvites = useMemo(() => allUsers.filter(u => u.status === UserStatus.Pending && !u.isActivated), [allUsers]);

    const handleTogglePolicy = async () => {
        if (!settings) return;
        const next = !settings.restrictDomains;
        setSettings({ ...settings, restrictDomains: next });
        await api.updateInstitutionSettings({ restrictDomains: next });
    };

    const handleAddDomain = async () => {
        if (!settings || !newDomain.trim()) return;
        const next = [...settings.allowedDomains, newDomain.trim()];
        setSettings({ ...settings, allowedDomains: next });
        await api.updateInstitutionSettings({ allowedDomains: next });
        setNewDomain('');
    };

    const handleRemoveDomain = async (domain: string) => {
        if (!settings) return;
        const next = settings.allowedDomains.filter(d => d !== domain);
        setSettings({ ...settings, allowedDomains: next });
        await api.updateInstitutionSettings({ allowedDomains: next });
    };

    const handleProcessCsv = async () => {
        if (!csvContent.trim()) return;
        setIsProcessing(true);
        try {
            // Mock CSV Parsing: Name, Email, RegNo, ProgramID
            const rows = csvContent.split('\n').filter(r => r.trim());
            const students = rows.map(r => {
                const [name, email, regNo, programId] = r.split(',').map(s => s.trim());
                return { name, email, regNo, programId };
            });
            const newOnboarded = await api.bulkOnboardStudents(students);
            setAllUsers(prev => [...newOnboarded, ...prev]);
            setCsvContent('');
            alert(`Provisioned ${newOnboarded.length} student records.`);
        } catch (err) {
            alert("Failed to process CSV.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div>Initialising Provisioning Engine...</div>;

    return (
        <div className="space-y-8">
            <PageHeader title="Student Onboarding" subtitle="Manage campus access, domain policies, and bulk student provisioning." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Domain Policy */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Icon name="Globe" className="h-6 w-6 text-primary-dark" />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Domain Sovereignty</h3>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
                        <div>
                            <p className="font-bold text-sm">Restrict to Whitelist</p>
                            <p className="text-xs text-gray-500">Only allow specific email domains</p>
                        </div>
                        <button onClick={handleTogglePolicy} className={`w-12 h-6 rounded-full transition-colors relative ${settings?.restrictDomains ? 'bg-primary' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings?.restrictDomains ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {settings?.restrictDomains && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="e.g. uonbi.ac.ke" 
                                    value={newDomain}
                                    onChange={e => setNewDomain(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 ring-primary"
                                />
                                <button onClick={handleAddDomain} className="bg-primary text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-dark">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {settings.allowedDomains.map(d => (
                                    <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-light dark:bg-secondary/20 text-secondary dark:text-blue-300 rounded-full text-xs font-bold border border-secondary/10">
                                        {d}
                                        <button onClick={() => handleRemoveDomain(d)} className="hover:text-red-500"><Icon name="X" className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Bulk Provisioning */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-secondary-light dark:bg-secondary/20 rounded-xl">
                                <Icon name="Users" className="h-6 w-6 text-secondary" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Bulk Onboarding</h3>
                        </div>
                        <button className="text-xs font-black uppercase text-secondary hover:underline">Download CSV Template</button>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">Paste comma-separated data below. Format: <code className="bg-gray-100 px-1 rounded">Name, Email, RegNo, ProgramID</code></p>
                    
                    <textarea 
                        value={csvContent}
                        onChange={e => setCsvContent(e.target.value)}
                        placeholder="John Doe, john@school.edu, STU/101, p1&#10;Jane Smith, jane@gmail.com, STU/102, p2"
                        className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-2xl outline-none font-mono text-sm focus:ring-2 ring-primary mb-4"
                    />

                    <div className="flex justify-end">
                        <button 
                            onClick={handleProcessCsv}
                            disabled={isProcessing || !csvContent.trim()}
                            className="bg-slate-900 text-white dark:bg-primary dark:text-gray-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95"
                        >
                            {isProcessing ? 'Processing Records...' : 'Provision Students'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Management Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Pending Invitations</h3>
                    <div className="flex gap-2">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{pendingInvites.length} Pending Activation</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">Student</th>
                                <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">ADM/REG No</th>
                                <th className="px-4 py-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">Program</th>
                                <th className="px-4 py-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">Invite Link</th>
                                <th className="px-4 py-4 text-right font-black uppercase text-[10px] tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {pendingInvites.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-black">{p.name.charAt(0)}</div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100">{p.name}</p>
                                                <p className="text-xs text-gray-400">{p.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-secondary">{p.registrationNumber}</td>
                                    <td className="px-4 py-4">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold uppercase">{programs.find(pg => pg.id === p.programId)?.name || p.programId}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <input readOnly value={`/#/activate?token=${p.inviteToken}`} className="bg-gray-50 dark:bg-gray-900 px-2 py-1 border rounded text-[10px] flex-1 outline-none" />
                                            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/#/activate?token=${p.inviteToken}`); alert('Link copied'); }} className="text-gray-400 hover:text-primary"><Icon name="Link" className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="text-primary-dark font-black uppercase text-[10px] tracking-widest hover:underline">Resend Email</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pendingInvites.length === 0 && (
                        <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                            <Icon name="CheckCircle" className="h-12 w-12 mb-4 opacity-20" />
                            <p className="font-bold">No pending onboarding requests</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProvisioningPage;
