import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { Communication, User, UserRole } from '../../types';
import { Icon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';

type RecipientType = 'all' | 'role' | 'individual';

const CommunicationsPage: React.FC = () => {
    const { user: adminUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [history, setHistory] = useState<Communication[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Form State
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Recipient State
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [recipientType, setRecipientType] = useState<RecipientType>('all');
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [userSearchTerm, setUserSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoadingHistory(true);
            try {
                const [historyData, usersData] = await Promise.all([
                    api.getCommunications(),
                    api.getAllUsers()
                ]);
                setHistory(historyData);
                setAllUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch communications data", error);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!userSearchTerm) return [];
        return allUsers.filter(u => 
            u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
        ).slice(0, 10); // Limit results for performance
    }, [allUsers, userSearchTerm]);

    const handleRoleToggle = (role: UserRole) => {
        setSelectedRoles(prev => 
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleUserSelect = (user: User) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(user.id)) {
                newSet.delete(user.id);
            } else {
                newSet.add(user.id);
            }
            return newSet;
        });
        setUserSearchTerm('');
    };
    
    const getRecipientSummary = (): string => {
        if (recipientType === 'all') return 'All Users';
        if (recipientType === 'role') {
            if (selectedRoles.length === 0) return 'No roles selected';
            return `Roles: ${selectedRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}`;
        }
        if (recipientType === 'individual') {
            if (selectedUserIds.size === 0) return 'No users selected';
            if (selectedUserIds.size > 3) return `${selectedUserIds.size} users selected`;
            return Array.from(selectedUserIds).map(id => allUsers.find(u => u.id === id)?.name || '').join(', ');
        }
        return '';
    };

    const handleSend = async () => {
        if (!subject.trim() || !content.trim() || !adminUser) {
            alert('Subject and message content are required.');
            return;
        }
        setIsSending(true);
        try {
            const newComm = await api.sendCommunication({
                subject,
                content,
                recipientsSummary: getRecipientSummary(),
                authorName: adminUser.name
            });
            setHistory(prev => [newComm, ...prev]);
            setSubject('');
            setContent('');
            setActiveTab('history'); // Switch to history tab after sending
        } catch (error) {
            console.error("Failed to send communication", error);
            alert("An error occurred while sending the message.");
        } finally {
            setIsSending(false);
        }
    };
    
    const selectedUsers = useMemo(() => {
        return allUsers.filter(u => selectedUserIds.has(u.id));
    }, [selectedUserIds, allUsers]);


    return (
        <div>
            <PageHeader title="Communications" subtitle="Send messages to users and view history." />

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'compose' ? 'border-primary text-secondary dark:text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        Compose Message
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'history' ? 'border-primary text-secondary dark:text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        History
                    </button>
                </nav>
            </div>

            {activeTab === 'compose' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">New Message</h3>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                <textarea
                                    id="content"
                                    rows={10}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm self-start">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Recipients</h3>
                        <div className="space-y-4">
                            <select value={recipientType} onChange={e => setRecipientType(e.target.value as RecipientType)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                <option value="all">All Users</option>
                                <option value="role">By Role</option>
                                <option value="individual">Specific Individuals</option>
                            </select>

                            {recipientType === 'role' && (
                                <div className="space-y-2">
                                    {Object.values(UserRole).map(role => (
                                        <label key={role} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.includes(role)}
                                                onChange={() => handleRoleToggle(role)}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{role}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {recipientType === 'individual' && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search for users..."
                                        value={userSearchTerm}
                                        onChange={e => setUserSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                                    />
                                    {userSearchTerm && filteredUsers.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white dark:bg-gray-600 border dark:border-gray-500 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredUsers.map(u => (
                                                <li key={u.id} onClick={() => handleUserSelect(u)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer text-sm">
                                                    {u.name} ({u.email})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="mt-2 space-x-1">
                                        {selectedUsers.map(u => (
                                            <span key={u.id} className="inline-flex items-center bg-secondary-light dark:bg-secondary/20 text-secondary dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                                                {u.name}
                                                <button onClick={() => handleUserSelect(u)} className="ml-1 text-secondary dark:text-blue-300 hover:text-secondary-dark dark:hover:text-blue-100">
                                                    <Icon name="X" className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={handleSend} disabled={isSending} className="mt-6 w-full bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center justify-center disabled:bg-gray-300">
                             {isSending ? 'Sending...' : <><Icon name="Send" className="h-5 w-5 mr-2" /> Send Message</>}
                        </button>
                    </div>
                </div>
            )}
            
            {activeTab === 'history' && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    {loadingHistory ? <p>Loading history...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Subject</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Recipients</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Sent Date</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Author</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {history.map(comm => (
                                        <tr key={comm.id}>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">{comm.subject}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{comm.recipientsSummary}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(comm.sentAt).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{comm.authorName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunicationsPage;