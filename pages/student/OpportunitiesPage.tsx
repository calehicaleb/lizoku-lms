
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { JobOpportunity, JobType, JobApplication, ApplicationStatus } from '../../types';

const OpportunitiesPage: React.FC = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<JobOpportunity[]>([]);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [jobsData, appsData] = await Promise.all([
                    api.getJobOpportunities(),
                    api.getStudentApplications(user.id)
                ]);
                setJobs(jobsData);
                setApplications(appsData);
            } catch (error) {
                console.error("Failed to fetch career data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  job.company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || 
                                (filterType === 'gig' && (job.type === JobType.Gig || job.type === JobType.Contract)) ||
                                (filterType === 'full-time' && job.type === JobType.FullTime);
            return matchesSearch && matchesType;
        });
    }, [jobs, searchTerm, filterType]);

    const handleApply = async () => {
        if (!user || !selectedJob) return;
        setIsApplying(true);
        try {
            const newApp = await api.applyForJob(user.id, selectedJob.id);
            setApplications(prev => [...prev, newApp]);
            alert(`Successfully applied to ${selectedJob.title} at ${selectedJob.company}!`);
            setIsModalOpen(false);
        } catch (error) {
            alert("Failed to apply. Please try again.");
        } finally {
            setIsApplying(false);
        }
    };

    const hasApplied = (jobId: string) => applications.some(app => app.jobId === jobId);

    if (loading) return <div>Loading Career Hub...</div>;

    return (
        <div>
            <PageHeader title="Career Hub" subtitle="Find your next gig, internship, or full-time role." />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Job Feed */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-1/2">
                            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-x-0 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search jobs, skills, or companies..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'all' ? 'bg-primary text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>All</button>
                            <button onClick={() => setFilterType('gig')} className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'gig' ? 'bg-primary text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Gigs & Contract</button>
                            <button onClick={() => setFilterType('full-time')} className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'full-time' ? 'bg-primary text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Full-Time</button>
                        </div>
                    </div>

                    {/* Job List */}
                    <div className="grid grid-cols-1 gap-4">
                        {filteredJobs.length > 0 ? filteredJobs.map(job => (
                            <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer group" onClick={() => { setSelectedJob(job); setIsModalOpen(true); }}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary-dark transition-colors">{job.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 font-medium flex items-center mt-1">
                                            <Icon name="Building2" className="h-4 w-4 mr-1" /> {job.company}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                                {job.type}
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                                <Icon name="DollarSign" className="h-3 w-3 mr-1" /> {job.salaryRange || 'Competitive'}
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                <Icon name="MapPin" className="h-3 w-3 mr-1" /> {job.location}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {hasApplied(job.id) ? (
                                            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                                                <Icon name="CheckCircle" className="h-3 w-3 mr-1" /> Applied
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400 group-hover:text-primary transition-colors">View Details &rarr;</span>
                                        )}
                                        <span className="text-xs text-gray-400 mt-2">{new Date(job.postedDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                                <Icon name="Briefcase" className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No jobs found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: My Applications */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm sticky top-6">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                            <Icon name="FileText" className="h-5 w-5 mr-2 text-primary" /> My Applications
                        </h3>
                        {applications.length > 0 ? (
                            <ul className="space-y-4">
                                {applications.map(app => {
                                    const job = jobs.find(j => j.id === app.jobId);
                                    return (
                                        <li key={app.id} className="border-b dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{job?.title || 'Unknown Job'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{job?.company}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                    app.status === ApplicationStatus.Applied ? 'bg-blue-100 text-blue-800' :
                                                    app.status === ApplicationStatus.Interviewing ? 'bg-yellow-100 text-yellow-800' :
                                                    app.status === ApplicationStatus.Offered ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {app.status}
                                                </span>
                                                <span className="text-xs text-gray-400">{new Date(app.appliedDate).toLocaleDateString()}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">You haven't applied to any jobs yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Job Details Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedJob?.title || 'Job Details'} size="3xl">
                {selectedJob && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedJob.company}</h2>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-4">
                                    <span className="flex items-center"><Icon name="MapPin" className="h-4 w-4 mr-1" /> {selectedJob.location}</span>
                                    <span className="flex items-center"><Icon name="Briefcase" className="h-4 w-4 mr-1" /> {selectedJob.type}</span>
                                    <span className="flex items-center text-green-600 dark:text-green-400 font-medium"><Icon name="DollarSign" className="h-4 w-4 mr-1" /> {selectedJob.salaryRange}</span>
                                </div>
                            </div>
                            {hasApplied(selectedJob.id) ? (
                                <button disabled className="px-6 py-2 bg-green-100 text-green-800 rounded-md font-bold cursor-default">Applied</button>
                            ) : (
                                <button onClick={handleApply} disabled={isApplying} className="px-6 py-2 bg-primary text-gray-900 rounded-md font-bold hover:bg-primary-dark transition-colors disabled:opacity-50">
                                    {isApplying ? 'Applying...' : 'Apply Now'}
                                </button>
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">About the Role</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{selectedJob.description}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Requirements</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                                {selectedJob.requirements.map((req, i) => (
                                    <li key={i}>{req}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedJob.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OpportunitiesPage;
