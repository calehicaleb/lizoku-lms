
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    const [activeMethod, setActiveMethod] = useState<'paste' | 'upload'>('upload');
    const [csvContent, setCsvContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // --- FILE UPLOAD LOGIC ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setUploadedFile(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => setIsDragging(false);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
            setUploadedFile(file);
        } else {
            alert("Please upload a valid CSV or Excel file.");
        }
    };

    const handleProcessImport = async () => {
        setIsProcessing(true);
        try {
            let dataToParse = csvContent;

            if (activeMethod === 'upload' && uploadedFile) {
                // Read file content
                dataToParse = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsText(uploadedFile);
                });
            }

            if (!dataToParse.trim()) {
                alert("No data found to process.");
                setIsProcessing(false);
                return;
            }

            // Mock Parsing: Name, Email, RegNo, ProgramID
            const rows = dataToParse.split('\n').filter(r => r.trim());
            const students = rows.map(r => {
                const [name, email, regNo, programId] = r.split(',').map(s => s.trim());
                return { name, email, regNo, programId };
            });

            const newOnboarded = await api.bulkOnboardStudents(students);
            setAllUsers(prev => [...newOnboarded, ...prev]);
            setCsvContent('');
            setUploadedFile(null);
            alert(`Provisioned ${newOnboarded.length} student records.`);
        } catch (err) {
            alert("Failed to process data. Ensure the format is correct.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase tracking-widest text-gray-400">Initialising Provisioning Engine...</div>;

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
                                <button onClick={handleAddDomain} className="bg-primary text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {settings.allowedDomains.map(d => (
                                    <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-light dark:bg-secondary/20 text-secondary dark:text-blue-300 rounded-full text-xs font-bold border border-secondary/10">
                                        {d}
                                        <button onClick={() => handleRemoveDomain(d)} className="hover:text-red-500 transition-colors"><Icon name="X" className="h-3 w-3" /></button>
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
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Bulk Import</h3>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveMethod('upload')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeMethod === 'upload' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                            >
                                File Upload
                            </button>
                            <button 
                                onClick={() => setActiveMethod('paste')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeMethod === 'paste' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                            >
                                Paste CSV
                            </button>
                        </div>
                    </div>

                    <div className="min-h-[220px]">
                        {activeMethod === 'paste' ? (
                            <div className="animate-in fade-in duration-300">
                                <p className="text-sm text-gray-500 mb-4">Paste comma-separated data below. Format: <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-secondary font-bold">Name, Email, RegNo, ProgramID</code></p>
                                <textarea 
                                    value={csvContent}
                                    onChange={e => setCsvContent(e.target.value)}
                                    placeholder="John Doe, john@school.edu, STU/101, p1&#10;Jane Smith, jane@gmail.com, STU/102, p2"
                                    className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-2xl outline-none font-mono text-sm focus:ring-2 ring-primary mb-4"
                                />
                            </div>
                        ) : (
                            <div 
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                className={`animate-in fade-in duration-300 h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20'}`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".csv,.xlsx"
                                    className="hidden"
                                />
                                
                                {uploadedFile ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Icon name="FileText" className="h-6 w-6 text-green-600" />
                                        </div>
                                        <p className="font-bold text-gray-800 dark:text-white">{uploadedFile.name}</p>
                                        <p className="text-xs text-gray-400 mt-1">{(uploadedFile.size / 1024).toFixed(2)} KB • Ready for processing</p>
                                        <button onClick={() => setUploadedFile(null)} className="mt-3 text-[10px] font-black uppercase text-red-500 hover:underline">Remove File</button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Icon name="UploadCloud" className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            Drag & Drop your SIS CSV here or{' '}
                                            <button onClick={() => fileInputRef.current?.click()} className="text-secondary hover:underline">browse files</button>
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest">Supports .CSV and .XLSX</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-secondary hover:underline flex items-center gap-1.5">
                            <Icon name="Link" className="h-3 w-3" /> Get SIS Import Template
                        </button>
                        <button 
                            onClick={handleProcessImport}
                            disabled={isProcessing || (activeMethod === 'paste' ? !csvContent.trim() : !uploadedFile)}
                            className="bg-slate-900 text-white dark:bg-primary dark:text-gray-900 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95"
                        >
                            {isProcessing ? 'Processing Records...' : 'Start Provisioning'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Management Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Pending Invitations</h3>
                    <div className="flex gap-2">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Icon name="Clock" className="h-3 w-3 inline mr-1" /> {pendingInvites.length} Pending Activation
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">Student Identity</th>
                                <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">ADM/REG Number</th>
                                <th className="px-4 py-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">Academic Program</th>
                                <th className="px-4 py-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">Invite Link Token</th>
                                <th className="px-4 py-4 text-right font-black uppercase text-[10px] tracking-widest text-gray-400">Utility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {pendingInvites.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-secondary-light dark:bg-secondary/20 text-secondary flex items-center justify-center text-[11px] font-black border border-secondary/10">{p.name.charAt(0)}</div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100">{p.name}</p>
                                                <p className="text-[11px] text-gray-400 font-medium">{p.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs font-black text-secondary bg-secondary-light/50 px-2 py-1 rounded border border-secondary/10">
                                            {p.registrationNumber}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            {programs.find(pg => pg.id === p.programId)?.name || p.programId}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 group/link">
                                            <div className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 border dark:border-gray-700 rounded-lg text-[10px] font-mono text-gray-400 truncate max-w-[140px]">
                                                {p.inviteToken}
                                            </div>
                                            <button 
                                                onClick={() => { 
                                                    navigator.clipboard.writeText(`${window.location.origin}/#/activate?token=${p.inviteToken}`); 
                                                    alert('Activation link copied to clipboard.'); 
                                                }} 
                                                className="p-1.5 text-gray-400 hover:text-primary transition-colors bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-sm"
                                                title="Copy Secure Activation Link"
                                            >
                                                <Icon name="Link" className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="text-secondary dark:text-blue-400 font-black uppercase text-[10px] tracking-widest hover:bg-secondary-light dark:hover:bg-secondary/10 px-3 py-1.5 rounded-lg transition-all">Resend Email</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pendingInvites.length === 0 && (
                        <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                            <Icon name="CheckCircle" className="h-16 w-16 mb-4 opacity-10" />
                            <p className="text-xl font-black text-gray-300 uppercase tracking-tighter">Campus registry is clean</p>
                            <p className="text-sm font-medium">No pending student activation requests found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProvisioningPage;
