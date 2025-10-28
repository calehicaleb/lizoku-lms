
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Icon } from '../../components/icons';
import * as api from '../../services/api';
import { Message, MessageThread, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const MyMessagesPage: React.FC = () => {
    const { user } = useAuth();
    const { threadId } = useParams<{ threadId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const isComposing = location.pathname === '/my-messages/new';

    const [threads, setThreads] = useState<MessageThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Effect to fetch the list of threads
    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        setLoadingThreads(true);
        api.getMessageThreads(user.id)
            .then(data => {
                if (isMounted) setThreads(data);
            })
            .catch(err => console.error("Failed to fetch message threads", err))
            .finally(() => {
                if (isMounted) setLoadingThreads(false);
            });
        return () => { isMounted = false; };
    }, [user, location.pathname]); // Re-fetch when leaving compose view

    // Effect to fetch details of a specific thread when URL changes
    useEffect(() => {
        if (threadId && threads.length > 0) {
            if (selectedThread?.id === threadId) return;

            setLoadingMessages(true);
            api.getMessageThreadDetails(threadId)
                .then(threadDetails => {
                    setSelectedThread(threadDetails);
                    if (threadDetails) {
                        setThreads(prevThreads => prevThreads.map(t => t.id === threadId ? { ...t, isRead: true } : t));
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch thread details", error);
                    navigate('/my-messages');
                })
                .finally(() => {
                    setLoadingMessages(false);
                });
        } else if (!threadId && !isComposing) {
            setSelectedThread(null);
        }
    }, [threadId, threads, navigate, selectedThread?.id, isComposing]);

    return (
        <div>
            <PageHeader title="My Messages" subtitle="Communicate with instructors and peers." />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[75vh] flex overflow-hidden">
                {/* Threads List (Left Pane) */}
                <aside className="w-full md:w-1/3 border-r dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Inbox</h2>
                            <button onClick={() => navigate('/my-messages/new')} className="bg-primary text-gray-800 font-bold py-2 px-3 rounded-md hover:bg-primary-dark flex items-center text-sm">
                                <Icon name="PenSquare" className="h-4 w-4 mr-2" />
                                New
                            </button>
                        </div>
                    </div>
                    {loadingThreads ? (
                        <div className="flex-1 flex items-center justify-center"><p>Loading conversations...</p></div>
                    ) : (
                        <ul className="flex-1 overflow-y-auto">
                            {threads.map(thread => (
                                <li key={thread.id}>
                                    <button 
                                        onClick={() => navigate(`/my-messages/${thread.id}`)}
                                        className={`w-full text-left p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedThread?.id === thread.id ? 'bg-secondary-light dark:bg-secondary/20' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className={`font-bold ${!thread.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>{thread.subject}</p>
                                            {!thread.isRead && <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1.5 ml-2"></span>}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{thread.lastMessage.content}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">{new Date(thread.lastMessage.createdAt).toLocaleDateString()}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>
                
                {/* Right Pane */}
                <main className="w-2/3 flex-col hidden md:flex">
                    {isComposing ? (
                        <ComposeView prefill={location.state?.prefill} />
                    ) : loadingMessages ? (
                        <div className="flex-1 flex items-center justify-center"><p>Loading messages...</p></div>
                    ) : !selectedThread ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8">
                            <Icon name="MessageSquare" className="h-16 w-16 mb-4" />
                            <h2 className="text-xl font-medium">Select a conversation</h2>
                            <p>Choose a conversation from the left or start a new one.</p>
                        </div>
                    ) : (
                        <ThreadView thread={selectedThread} />
                    )}
                </main>
            </div>
        </div>
    );
};

const ThreadView: React.FC<{ thread: MessageThread }> = ({ thread }) => {
    const { user } = useAuth();
    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState(thread.messages || []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !user) return;
        
        setIsSending(true);
        try {
            const newMessage = await api.sendMessage(thread.id, replyContent, user);
            setMessages(prev => [...prev, newMessage]);
            setReplyContent('');
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Could not send your message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{thread.subject}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Participants: {thread.participants.map(p => p.name).join(', ')}
                </p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
                {messages.map(message => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.authorId === user?.id ? 'flex-row-reverse' : ''}`}>
                        <img src={message.authorAvatarUrl} alt={message.authorName} className="w-10 h-10 rounded-full" />
                        <div className={`max-w-md p-3 rounded-lg ${message.authorId === user?.id ? 'bg-primary-dark/20 dark:bg-primary/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                {message.authorName}
                                {message.authorId === user?.id && <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">(me)</span>}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">{new Date(message.createdAt).toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                    <textarea
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        rows={1}
                        placeholder="Type your reply..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        disabled={isSending}
                    />
                    <button type="submit" className="bg-primary text-gray-800 font-bold p-2 rounded-full hover:bg-primary-dark transition-colors disabled:bg-gray-300" disabled={!replyContent.trim() || isSending}>
                        <Icon name="Send" className="h-6 w-6" />
                    </button>
                </form>
            </div>
        </>
    );
};

const ComposeView: React.FC<{ prefill?: { participantIds: string[], subject: string } }> = ({ prefill }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [participants, setParticipants] = useState<User[]>([]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        api.getAllUsers().then(setAllUsers);
    }, []);

    useEffect(() => {
        if (prefill && allUsers.length > 0) {
            const prefilledParticipants = allUsers.filter(u => prefill.participantIds.includes(u.id));
            setParticipants(prefilledParticipants);
            setSubject(prefill.subject);
        }
    }, [prefill, allUsers]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return [];
        const participantIds = new Set(participants.map(p => p.id));
        return allUsers.filter(u => 
            !participantIds.has(u.id) &&
            u.id !== user?.id &&
            (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        ).slice(0, 5);
    }, [searchTerm, allUsers, participants, user]);

    const addParticipant = (userToAdd: User) => {
        setParticipants(prev => [...prev, userToAdd]);
        setSearchTerm('');
    };

    const removeParticipant = (userId: string) => {
        setParticipants(prev => prev.filter(p => p.id !== userId));
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !content.trim() || participants.length === 0 || !user) {
            alert("Please fill in all fields and select at least one recipient.");
            return;
        }

        setIsSending(true);
        try {
            const allParticipants = [...participants, { id: user.id, name: user.name, avatarUrl: user.avatarUrl }];
            const newThread = await api.createNewThread(allParticipants, subject, content, user);
            navigate(`/my-messages/${newThread.id}`);
        } catch (error) {
            console.error("Failed to create new thread", error);
            alert("An error occurred while sending the message.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form onSubmit={handleSend} className="flex-1 flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">New Message</h3>
            </div>
            <div className="p-4 space-y-4">
                <div>
                    <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To:</label>
                    <div className="relative border dark:border-gray-600 rounded-md p-2 flex flex-wrap gap-2 min-h-12 bg-white dark:bg-gray-700">
                         {participants.map(p => (
                            <span key={p.id} className="inline-flex items-center bg-secondary-light dark:bg-secondary/20 text-secondary dark:text-blue-300 text-sm font-medium px-2 py-1 rounded-full">
                                {p.name}
                                <button type="button" onClick={() => removeParticipant(p.id)} className="ml-1 text-secondary dark:text-blue-300 hover:text-secondary-dark dark:hover:text-blue-100">
                                    <Icon name="X" className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={participants.length === 0 ? "Search for users..." : ""}
                            className="flex-1 outline-none bg-transparent"
                        />
                        {filteredUsers.length > 0 && (
                            <ul className="absolute z-10 top-full left-0 w-full bg-white dark:bg-gray-600 border dark:border-gray-500 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                                {filteredUsers.map(u => (
                                    <li key={u.id} onClick={() => addParticipant(u)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer text-sm flex items-center gap-2">
                                        <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-full" />
                                        {u.name} <span className="text-gray-400">({u.email})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</label>
                    <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                </div>
            </div>
            <div className="flex-1 p-4 pt-0 flex flex-col">
                 <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your message here..."
                    className="flex-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md resize-none"
                    required
                />
            </div>
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                <button type="submit" className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark disabled:bg-gray-300" disabled={isSending}>
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </div>
        </form>
    );
};


export default MyMessagesPage;
