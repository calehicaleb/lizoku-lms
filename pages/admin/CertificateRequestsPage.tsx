
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { CertificateRequest } from '../../types';
import { Icon } from '../../components/icons';

const CertificateRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<CertificateRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await api.getCertificateRequests();
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch certificate requests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleApprove = async (requestId: string) => {
        setActioningId(requestId);
        const result = await api.approveCertificateRequest(requestId);
        if (result.success) {
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } else {
            alert('Failed to approve request.');
        }
        setActioningId(null);
    };

    const handleDeny = async (requestId: string) => {
        if (window.confirm('Are you sure you want to deny this certificate request?')) {
            setActioningId(requestId);
            const result = await api.denyCertificateRequest(requestId);
            if (result.success) {
                setRequests(prev => prev.filter(r => r.id !== requestId));
            } else {
                alert('Failed to deny request.');
            }
            setActioningId(null);
        }
    };

    if (loading) return <div>Loading certificate requests...</div>;

    return (
        <div>
            <PageHeader title="Certificate Requests" subtitle="Review and process pending certificate requests from students." />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Student Name</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Course Name</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Request Date</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">{req.studentName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{req.courseName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(req.requestDate).toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap space-x-2">
                                        <button
                                            onClick={() => handleApprove(req.id)}
                                            disabled={actioningId === req.id}
                                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDeny(req.id)}
                                            disabled={actioningId === req.id}
                                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                                        >
                                            Deny
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && (
                        <div className="text-center py-16 px-6">
                            <Icon name="BadgeCheck" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">All Clear!</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no pending certificate requests to review.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateRequestsPage;
