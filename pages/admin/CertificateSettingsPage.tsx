import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Icon } from '../../components/icons';
import * as api from '../../services/api';
import { CertificateSettings } from '../../types';

const CertificatePreview: React.FC<{ settings: CertificateSettings }> = ({ settings }) => {
    return (
        <div className="border-4 p-2 bg-white" style={{ borderColor: settings.primaryColor }}>
            <div className="border-2 p-6" style={{ borderColor: settings.primaryColor }}>
                <div className="text-center">
                    <img src={settings.logoUrl} alt="Institution Logo" className="h-20 mx-auto mb-4 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150x80?text=Logo'} />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Certificate of Completion</p>
                    <p className="text-gray-600 mt-4">This certificate is proudly presented to</p>
                    <h1 className="text-4xl font-bold text-gray-800 my-2" style={{ fontFamily: "'Times New Roman', serif" }}>
                        Student Name
                    </h1>
                    <p className="text-gray-600">for successfully completing the course</p>
                    <h2 className="text-2xl font-semibold my-2" style={{ color: settings.primaryColor }}>
                        Example Course Title
                    </h2>
                    <div className="flex justify-around items-end mt-12">
                        <div>
                            <p className="text-sm">{new Date().toLocaleDateString()}</p>
                            <hr className="border-gray-600 mt-1" />
                            <p className="text-xs text-gray-500">Date Issued</p>
                        </div>
                        <div>
                            <img src={settings.signatureImageUrl} alt="Signature" className="h-12 mx-auto object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/120x50?text=Signature'} />
                            <hr className="border-gray-600 mt-1" />
                            <p className="text-sm font-semibold">{settings.signatureSignerName}</p>
                            <p className="text-xs text-gray-500">{settings.signatureSignerTitle}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const CertificateSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<CertificateSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.getCertificateSettings();
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch certificate settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        const { id, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [id]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setSaving(true);
        setSaveMessage('');
        try {
            await api.updateCertificateSettings(settings);
            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save settings", error);
            setSaveMessage('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) return <div>Loading settings...</div>;
    if (!settings) return <div>Could not load settings.</div>;


    return (
        <div>
            <PageHeader title="Certificate Settings" subtitle="Design and configure the certificates issued to students." />

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">Institution Logo URL</label>
                            <input type="text" id="logoUrl" value={settings.logoUrl} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                        </div>
                        
                        <div className="border-t pt-6">
                             <h3 className="text-lg font-bold text-gray-800 mb-2">Signature Details</h3>
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="signatureImageUrl" className="block text-sm font-medium text-gray-700 mb-1">Signature Image URL</label>
                                    <input type="text" id="signatureImageUrl" value={settings.signatureImageUrl} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                                </div>
                                 <div>
                                    <label htmlFor="signatureSignerName" className="block text-sm font-medium text-gray-700 mb-1">Signer's Name</label>
                                    <input type="text" id="signatureSignerName" value={settings.signatureSignerName} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                                </div>
                                 <div>
                                    <label htmlFor="signatureSignerTitle" className="block text-sm font-medium text-gray-700 mb-1">Signer's Title</label>
                                    <input type="text" id="signatureSignerTitle" value={settings.signatureSignerTitle} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                                </div>
                             </div>
                        </div>

                         <div className="border-t pt-6">
                             <h3 className="text-lg font-bold text-gray-800 mb-2">Template & Automation</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" id="primaryColor" value={settings.primaryColor} onChange={handleFormChange} className="h-10 w-10 p-1 border rounded-md" />
                                        <input type="text" value={settings.primaryColor} onChange={handleFormChange} id="primaryColor" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="autoIssueOnCompletion"
                                        type="checkbox"
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        checked={settings.autoIssueOnCompletion}
                                        onChange={handleFormChange}
                                    />
                                    <label htmlFor="autoIssueOnCompletion" className="ml-2 block text-sm text-gray-900">
                                        Automatically issue on course completion
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="pt-6 mt-6 border-t flex justify-end items-center gap-4">
                        {saveMessage && <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{saveMessage}</p>}
                        <button type="submit" disabled={saving} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 disabled:bg-gray-300">
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="self-start sticky top-24">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Live Preview</h3>
                     <div className="bg-gray-100 p-4 rounded-lg">
                        <CertificatePreview settings={settings} />
                     </div>
                </div>
            </form>
        </div>
    );
};

export default CertificateSettingsPage;