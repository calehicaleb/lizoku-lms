import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { DiscussionThread, DiscussionPost } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../icons';

interface DiscussionBoardProps {
    discussionId: string;
}

const Post: React.FC<{ post: DiscussionPost }> = ({ post }) => (
    <div className="flex items-start space-x-4 py-4">
        <img src={post.authorAvatarUrl} alt={post.authorName} className="h-10 w-10 rounded-full" />
        <div className="flex-1">
            <div className="flex items-baseline space-x-2">
                <p className="font-bold text-gray-800">{post.authorName}</p>
                <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
            <p className="text-gray-700 mt-1">{post.content}</p>
        </div>
    </div>
);

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ discussionId }) => {
    const { user } = useAuth();
    const [threads, setThreads] = useState<DiscussionThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [isCreatingThread, setIsCreatingThread] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');

    useEffect(() => {
        const fetchThreads = async () => {
            setIsLoading(true);
            setSelectedThread(null);
            try {
                const data = await api.getThreadsForDiscussion(discussionId);
                setThreads(data);
            } catch (err) {
                setError('Failed to load discussions.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchThreads();
    }, [discussionId]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !user || !selectedThread) return;

        try {
            const newPost = await api.createPost(selectedThread.id, replyContent, user);
            setSelectedThread(prev => prev ? { ...prev, posts: [...(prev.posts || []), newPost] } : null);
            setReplyContent('');
        } catch (err) {
            alert('Failed to post reply.');
        }
    };
    
    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThreadTitle.trim() || !newThreadContent.trim() || !user) return;

        try {
            const newThread = await api.createThread(discussionId, newThreadTitle, newThreadContent, user);
            setThreads(prev => [newThread, ...prev]);
            setNewThreadTitle('');
            setNewThreadContent('');
            setIsCreatingThread(false);
            setSelectedThread(newThread); // Automatically view the new thread
        } catch (err) {
            alert('Failed to create thread.');
        }
    };

    if (isLoading) return <div className="text-center p-8">Loading discussions...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    if (selectedThread) {
        return (
            <div>
                <button onClick={() => setSelectedThread(null)} className="text-sm text-secondary hover:underline mb-4">&larr; Back to All Threads</button>
                <h2 className="text-2xl font-bold text-gray-800">{selectedThread.title}</h2>
                <div className="mt-4 divide-y">
                    {selectedThread.posts?.map(post => <Post key={post.id} post={post} />)}
                </div>
                <div className="mt-6 pt-6 border-t">
                    <h3 className="font-bold mb-2">Post a Reply</h3>
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            rows={3}
                            placeholder="Write your reply..."
                            required
                        />
                        <div className="text-right mt-2">
                            <button type="submit" className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark">
                                Post Reply
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    if (isCreatingThread) {
        return (
             <div>
                <button onClick={() => setIsCreatingThread(false)} className="text-sm text-secondary hover:underline mb-4">&larr; Cancel</button>
                <h2 className="text-2xl font-bold text-gray-800">Start a New Discussion Thread</h2>
                 <form onSubmit={handleCreateThread} className="mt-4 space-y-4">
                     <div>
                         <label htmlFor="thread-title" className="block text-sm font-medium text-gray-700">Title</label>
                         <input
                            id="thread-title"
                            type="text"
                            value={newThreadTitle}
                            onChange={e => setNewThreadTitle(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            required
                         />
                     </div>
                     <div>
                         <label htmlFor="thread-content" className="block text-sm font-medium text-gray-700">Your Message</label>
                         <textarea
                            id="thread-content"
                            value={newThreadContent}
                            onChange={e => setNewThreadContent(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            rows={4}
                            required
                         />
                     </div>
                     <div className="text-right">
                         <button type="submit" className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark">
                            Post Thread
                         </button>
                     </div>
                 </form>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Discussion Threads</h2>
                <button onClick={() => setIsCreatingThread(true)} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark flex items-center">
                    <Icon name="PenSquare" className="h-5 w-5 mr-2" />
                    New Thread
                </button>
            </div>
            {threads.length === 0 ? (
                <p className="text-gray-500">No discussions have been started yet. Be the first!</p>
            ) : (
                <div className="space-y-2">
                    {threads.map(thread => (
                        <button key={thread.id} onClick={() => setSelectedThread(thread)} className="w-full text-left p-4 bg-gray-50 rounded-md hover:bg-secondary-light transition-colors border">
                            <h3 className="font-bold text-lg text-secondary">{thread.title}</h3>
                            <p className="text-sm text-gray-500">
                                Started by {thread.authorName} on {new Date(thread.createdAt).toLocaleDateString()} &bull; {thread.postCount} posts
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};