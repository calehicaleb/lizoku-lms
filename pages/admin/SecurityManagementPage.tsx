
import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';

const SecurityManagementPage: React.FC = () => {
    return (
        <div>
            <PageHeader title="Security Management" subtitle="Configure platform-wide security settings." />
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <form className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">AI Features</h3>
                        <div className="flex items-center">
                            <input id="ai-toggle" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" defaultChecked />
                            <label htmlFor="ai-toggle" className="ml-2 block text-sm text-gray-900">
                                Enable all AI-powered features
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="safety-filter" className="block text-lg font-bold text-gray-800 mb-2">AI Safety Filter</label>
                        <select id="safety-filter" className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                            <option>Low</option>
                            <option selected>Medium</option>
                            <option>High</option>
                        </select>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Password Policy</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input id="pw-length" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" defaultChecked />
                                <label htmlFor="pw-length" className="ml-2 block text-sm text-gray-900">Minimum 8 characters</label>
                            </div>
                            <div className="flex items-center">
                                <input id="pw-uppercase" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" defaultChecked />
                                <label htmlFor="pw-uppercase" className="ml-2 block text-sm text-gray-900">Require uppercase letter</label>
                            </div>
                            <div className="flex items-center">
                                <input id="pw-number" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" defaultChecked />
                                <label htmlFor="pw-number" className="ml-2 block text-sm text-gray-900">Require number</label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-5">
                        <div className="flex justify-end">
                            <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Cancel
                            </button>
                            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-800 bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                                Save Settings
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SecurityManagementPage;
