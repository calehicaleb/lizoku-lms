

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { SecuritySettings } from '../../types';

const SecurityManagementPage: React.FC = () => {
    const [settings, setSettings] = useState<SecuritySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.getSecuritySettings();
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch security settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!settings) return;

        const target = e.target as HTMLInputElement;
        const { id, value, type, checked, name } = target;
        
        const key = id || name;

        if (key.startsWith('pw-')) {
            const policyKey = key.replace('pw-', '');
            setSettings({
                ...settings,
                passwordPolicy: {
                    ...settings.passwordPolicy,
                    [policyKey]: checked,
                }
            });
        } else if (type === 'checkbox') {
            setSettings({ ...settings, [key]: checked });
        } else {
            setSettings({ ...settings, [key]: value as SecuritySettings['aiSafetyFilter'] });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setSaving(true);
        try {
            await api.updateSecuritySettings(settings);
            alert('Security settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings", error);
            alert('An error occurred while saving settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading security settings...</div>;
    }
    
    if (!settings) {
         return <div>Could not load security settings. Please try again later.</div>;
    }

    return (
        <div>
            <PageHeader title="Security Management" subtitle="Configure platform-wide security settings." />
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <form className="space-y-8" onSubmit={handleSave}>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">AI Features</h3>
                        <div className="flex items-center">
                            <input
                                id="enableAiFeatures"
                                name="enableAiFeatures"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                checked={settings.enableAiFeatures}
                                onChange={handleSettingChange}
                            />
                            <label htmlFor="enableAiFeatures" className="ml-2 block text-sm text-gray-900">
                                Enable all AI-powered features
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="aiSafetyFilter" className="block text-lg font-bold text-gray-800 mb-2">AI Safety Filter</label>
                        <select
                            id="aiSafetyFilter"
                            name="aiSafetyFilter"
                            className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 bg-white text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            value={settings.aiSafetyFilter}
                            onChange={handleSettingChange}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Password Policy</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="pw-minLength"
                                    name="pw-minLength"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    checked={settings.passwordPolicy.minLength}
                                    onChange={handleSettingChange}
                                />
                                <label htmlFor="pw-minLength" className="ml-2 block text-sm text-gray-900">Minimum 8 characters</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="pw-requireUppercase"
                                    name="pw-requireUppercase"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    checked={settings.passwordPolicy.requireUppercase}
                                    onChange={handleSettingChange}
                                />
                                <label htmlFor="pw-requireUppercase" className="ml-2 block text-sm text-gray-900">Require uppercase letter</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="pw-requireNumber"
                                    name="pw-requireNumber"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    checked={settings.passwordPolicy.requireNumber}
                                    onChange={handleSettingChange}
                                />
                                <label htmlFor="pw-requireNumber" className="ml-2 block text-sm text-gray-900">Require number</label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-5">
                        <div className="flex justify-end">
                            <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-800 bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-300">
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SecurityManagementPage;