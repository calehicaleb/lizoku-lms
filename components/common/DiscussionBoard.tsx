
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import { DiscussionPost, ContentItemDetails, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../icons';
import { RichTextEditor } from './RichTextEditor';

interface DiscussionBoardProps {
    discussionId: string;
    promptContent: ContentItemDetails | null;
    isLoadingPrompt: boolean;
}

type NestedPost = DiscussionPost & { children: NestedPost[] };

const buildPostTree = (posts: DiscussionPost[]): NestedPost[] => {
    const postMap = new Map<string, NestedPost>();
    const rootPosts: NestedPost[] = [];

    posts.forEach(post => {
        postMap.set(post.id, { ...post, children: [] });
    });

    postMap.forEach(post => {
        if (post.parentId && postMap.has(post.parentId)) {
            postMap.get(post.parentId)!.children.push(post);
        } else {
            rootPosts.push(post);
        }
    });

    const sortPosts = (a: NestedPost, b: NestedPost) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    };
    
    rootPosts.sort(sortPosts);
    postMap.forEach(p => p.children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));

    return rootPosts;
};

const PostItem: React.FC<{ 
    post: NestedPost; 
    onReply: (newPost: DiscussionPost) => void; 
    level: number 
}> = ({ post, onReply, level }) => {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [likes, setLikes] = useState(post.likes || 0);
    const [hasLiked, setHasLiked] = useState(false);

    const maxLevel = 4;
    const indentationClass = level > 0 && level <= maxLevel ? `ml-4 md:ml-12 border-l-2 border-gray-100 dark:border-gray-800 pl-4 md:pl-8` : '';

    const handlePostReply = async () => {
        if (!replyContent.trim() || !user) return;
        setIsSubmitting(true);
        try {
            const newPost = await api.createDiscussionPost(post.discussionId, replyContent, user, post.id);
            onReply(newPost);
            setReplyContent('');
            setIsReplying(false);
        } catch (err) {
            alert('Failed to post reply.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = () => {
        if (!hasLiked) {
            setLikes(prev => prev + 1);
            setHasLiked(true);
        } else {
            setLikes(prev => prev - 1);
            setHasLiked(false);
        }
    };

    return (
        <div className={`mt-6 ${indentationClass} group`}>
            <div className={`p-5 rounded-2xl border transition-all ${!post.isRead ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'}`}>
                <div className="flex items-start gap-4">
                    <img src={post.authorAvatarUrl} alt={post.authorName} className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 ring-white dark:ring-gray-900 shadow-sm" />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                             <div className="flex items-center gap-2">
                                <span className="font-black text-gray-900 dark:text-white text-sm md:text-base">{post.authorName}</span>
                                {post.authorRole === UserRole.Instructor && (
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary-dark px-2 py-0.5 rounded border border-primary/30">Instructor</span>
                                )}
                                {post.isPinned && <Icon name="Star" className="h-3.5 w-3.5 text-yellow-500 fill-current" />}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{new Date(post.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: post.content }} />
                        
                        <div className="mt-4 pt-3 border-t dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button onClick={() => setIsReplying(!isReplying)} className="text-xs font-black uppercase tracking-widest text-secondary dark:text-blue-400 hover:underline flex items-center gap-1.5">
                                    <Icon name="MessageSquare" className="h-4 w-4" /> Reply
                                </button>
                                <button onClick={handleLike} className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-primary-dark' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <Icon name="Star" className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} /> {likes > 0 ? likes : 'Like'}
                                </button>
                            </div>
                            {!post.isRead && <span className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div> New</span>}
                        </div>
                    </div>
                </div>
            </div>

            {isReplying && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border dark:border-gray-600 animate-in slide-in-from-top-2">
                    <RichTextEditor placeholder="Enter your response..." onChange={setReplyContent} initialContent={replyContent} />
                    <div className="mt-4 flex justify-end gap-3">
                        <button onClick={() => setIsReplying(false)} className="px-5 py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Cancel</button>
                        <button onClick={handlePostReply} disabled={isSubmitting} className="px-6 py-2 bg-primary text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50">
                            {isSubmitting ? 'Posting...' : 'Post Reply'}
                        </button>
                    </div>
                </div>
            )}

            {post.children.map(reply => (
                <PostItem key={reply.id} post={reply} onReply={onReply} level={level + 1} />
            ))}
        </div>
    );
};

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ discussionId, promptContent, isLoadingPrompt }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<DiscussionPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPromptExpanded, setIsPromptExpanded] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnread, setFilterUnread] = useState(false);

    // Compose State
    const [isComposing, setIsComposing] = useState(false);
    const [newThreadContent, setNewThreadContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.getPostsForDiscussion(discussionId)
            .then(data => {
                setPosts(data);
                // Background task: mark as read
                data.forEach(p => { if (!p.isRead) api.markDiscussionPostAsRead(p.id); });
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [discussionId]);

    const handleNewReply = (newPost: DiscussionPost) => setPosts(prev => [newPost, ...prev]);

    const handleNewThread = async () => {
        if (!newThreadContent.trim() || !user) return;
        setIsSubmitting(true);
        try {
            const newPost = await api.createDiscussionPost(discussionId, newThreadContent, user);
            setPosts(prev => [newPost, ...prev]);
            setNewThreadContent('');
            setIsComposing(false);
        } catch (error) {
            alert('Failed to start thread.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPosts = useMemo(() => {
        const tree = buildPostTree(posts);
        return tree.filter(p => {
            const matchesSearch = p.content.toLowerCase().includes(searchTerm.toLowerCase()) || p.authorName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesUnread = !filterUnread || !p.isRead;
            return matchesSearch && matchesUnread;
        });
    }, [posts, searchTerm, filterUnread]);

    return (
        <div className="flex flex-col h-full bg-light-cream dark:bg-gray-900 rounded-xl overflow-hidden border dark:border-gray-800">
            {/* Forum Sub-Header (Canvas Style) */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search discussions..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <button 
                        onClick={() => setFilterUnread(!filterUnread)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${filterUnread ? 'bg-primary text-gray-900 border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-600'}`}
                    >
                        {filterUnread ? 'Unread Only' : 'All Posts'}
                    </button>
                </div>
                <button onClick={() => setIsComposing(true)} className="w-full md:w-auto bg-slate-900 text-white dark:bg-primary dark:text-gray-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                    Start New Thread
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
                {/* Prompt Section */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] border dark:border-gray-700 shadow-sm overflow-hidden mb-12">
                    <button onClick={() => setIsPromptExpanded(!isPromptExpanded)} className="w-full p-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Icon name="ScrollText" className="h-5 w-5 text-primary-dark" />
                            </div>
                            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">Discussion Prompt</h2>
                        </div>
                        <Icon name={isPromptExpanded ? 'ChevronDown' : 'ChevronRight'} className="h-5 w-5 text-gray-400" />
                    </button>
                    {isPromptExpanded && (
                        <div className="p-8 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
                            {isLoadingPrompt ? (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: promptContent?.content || '<p>Review the course materials and share your analysis here.</p>' }} />
                            )}
                        </div>
                    )}
                </div>

                {/* Composing Section */}
                {isComposing && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border-2 border-primary shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">New Discussion Thread</h3>
                            <button onClick={() => setIsComposing(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400"><Icon name="X" className="h-6 w-6" /></button>
                        </div>
                        <RichTextEditor placeholder="Start the conversation..." onChange={setNewThreadContent} initialContent={newThreadContent} />
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsComposing(false)} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500">Discard</button>
                            <button onClick={handleNewThread} disabled={isSubmitting} className="bg-primary text-gray-900 px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50">
                                {isSubmitting ? 'Posting...' : 'Create Thread'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Posts Feed */}
                <div className="max-w-5xl mx-auto space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                             <p className="font-black uppercase text-xs tracking-widest">Loading threads...</p>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <PostItem key={post.id} post={post} onReply={handleNewReply} level={0} />
                        ))
                    ) : (
                        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700">
                            <Icon name="MessageSquare" className="h-20 w-20 mx-auto text-gray-200 mb-6" />
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white">No discussions yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">Be the first to share your thoughts and start a conversation with your peers.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
