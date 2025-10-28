
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Icon } from '../../components/icons';
import * as api from '../../services/api';
import { Certificate } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MyCertificatesPage: React.FC = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchCertificates = async () => {
            try {
                const data = await api.getStudentCertificates(user.id);
                setCertificates(data);
            } catch (error) {
                console.error("Failed to fetch certificates", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, [user]);

    const handleDownload = (courseName: string) => {
        alert(`Downloading certificate for "${courseName}"...`);
    };

    if (loading) {
        return <div className="text-center p-8">Loading your certificates...</div>;
    }

    return (
        <div>
            <PageHeader title="My Certificates" subtitle="View and download your earned course completion certificates." />

            {certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {certificates.map(cert => (
                        <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-4 border-primary/20">
                            <div className="p-6 bg-secondary-light/30 dark:bg-secondary/10 text-center border-b-2 border-dashed border-primary/30 dark:border-primary/50">
                                <Icon name="BadgeCheck" className="h-16 w-16 text-primary mx-auto mb-4" />
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Certificate of Completion</p>
                                <h2 className="text-xl font-bold text-secondary dark:text-blue-300 mt-2">{cert.courseName}</h2>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Issued to:</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{cert.studentName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Issued on:</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <button
                                    onClick={() => handleDownload(cert.courseName)}
                                    className="mt-6 w-full bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center justify-center"
                                >
                                    <Icon name="FileText" className="h-5 w-5 mr-2" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Icon name="BadgeCheck" className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No Certificates Yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't earned any certificates. Complete a course to receive one!</p>
                </div>
            )}
        </div>
    );
};

export default MyCertificatesPage;
