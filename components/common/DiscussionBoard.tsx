import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
// Fix: Import ContentItemDetails type.
import { DiscussionPost, ContentItemDetails, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../icons';

interface DiscussionBoardProps {
    discussionId: string;
    promptContent: ContentItemDetails | null;
    isLoadingPrompt: boolean;
}

// Type for a post that has been processed into a tree structure
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

    const sortPosts = (a: NestedPost, b: NestedPost) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    
    rootPosts.sort(sortPosts);
    postMap.forEach(p => p.children.sort(sortPosts));

    return rootPosts;
};

interface PostItemProps {
    post: NestedPost;
    onReply: (newPost: DiscussionPost) => void;
    level: number;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}


const PostItem: React.FC<PostItemProps> = ({ post, onReply, level, isCollapsed: isParentCollapsed, onToggleCollapse }) => {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocallyCollapsed, setLocallyCollapsed] = useState(level > 1); // Auto-collapse deeper replies

    const isControlled = level === 0;
    const isCollapsed = isControlled ? isParentCollapsed : isLocallyCollapsed;
    const toggleCollapse = isControlled ? onToggleCollapse : () => setLocallyCollapsed(!isLocallyCollapsed);
    
    const canCollapse = post.children && post.children.length > 0;

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <div className="flex items-start space-x-3">
            {!post.isRead && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-3.5"></div>}
            <img src={post.authorAvatarUrl} alt={post.authorName} className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-600">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <p className="font-bold text-gray-800 dark:text-gray-200">{post.authorName}</p>
                            {post.authorRole === UserRole.Instructor && (
                                <span className="text-xs bg-primary text-gray-800 font-semibold px-2 py-0.5 rounded-full">Instructor</span>
                            )}
                             {level === 0 && (
                                <span className="text-xs bg-secondary-light dark:bg-secondary/20 text-secondary dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">Thread Starter</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{post.content}</p>
                </div>

                <div className="mt-2 flex items-center space-x-4">
                    <button onClick={() => setIsReplying(!isReplying)} className="text-xs font-bold text-secondary dark:text-blue-400 hover:underline">
                        Reply
                    </button>
                    {canCollapse && (
                        <button onClick={toggleCollapse} className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1">
                            {isCollapsed ? <Icon name="ChevronRight" className="h-4 w-4" /> : <Icon name="ChevronDown" className="h-4 w-4" />}
                            <span>
                                {isCollapsed 
                                    ? (level === 0 ? 'Show Thread' : `Show ${post.children.length} ${post.children.length > 1 ? 'Replies' : 'Reply'}`)
                                    : (level === 0 ? 'Hide Thread' : 'Hide Replies')
                                }
                            </span>
                        </button>
                    )}
                </div>

                {isReplying && (
                     <form onSubmit={handlePostReply} className="mt-2">
                        <textarea
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            className="w-full p-2 border dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600"
                            rows={2}
                            placeholder={`Replying to ${post.authorName}...`}
                            required
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsReplying(false)} className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-500 rounded-md">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-3 py-1 text-xs font-medium text-gray-800 bg-primary rounded-md disabled:bg-gray-300">
                                {isSubmitting ? 'Posting...' : 'Post Reply'}
                            </button>
                        </div>
                    </form>
                )}
                
                <div className={`pl-5 border-l-2 border-gray-200 dark:border-gray-600 space-y-4 transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-[5000px] opacity-100 mt-4'}`}>
                    {post.children.map(reply => (
                        <PostItem key={reply.id} post={reply} onReply={onReply} level={level + 1} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ discussionId, promptContent, isLoadingPrompt }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<DiscussionPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [newThreadContent, setNewThreadContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set());

    const postTree = useMemo(() => buildPostTree(posts), [posts]);
    const areAllCollapsed = postTree.length > 0 && postTree.every(p => collapsedThreads.has(p.id));

    useEffect(() => {
        setLoading(true);
        api.getPostsForDiscussion(discussionId)
            .then(data => {
                setPosts(data);
                data.forEach(p => {
                    if (!p.isRead) {
                        api.markDiscussionPostAsRead(p.id);
                    }
                });
            })
            .catch(err => console.error("Failed to load discussion", err))
            .finally(() => setLoading(false));
    }, [discussionId]);

    const handleNewReply = (newPost: DiscussionPost) => {
        // Fix: Add new post to the flat list. `buildPostTree` will correctly place it in the hierarchy.
        // Adding an empty children array helps with type consistency within the list.
        setPosts(prev => [...prev, {...newPost, children: []}]);
    };

    const handleNewThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThreadContent.trim() || !user) return;
        setIsSubmitting(true);
        try {
            const newPost = await api.createDiscussionPost(discussionId, newThreadContent, user);
            // Fix: Add new post to the flat list. `buildPostTree` will correctly place it in the hierarchy.
            // Prepending the new post with an explicit `children` property avoids potential type inference issues.
            setPosts(prev => [{ ...newPost, children: [] }, ...prev]);
        } catch (error) {
            alert('Failed to create new thread.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const toggleThreadCollapse = (postId: string) => {
        setCollapsedThreads(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };
    
    const toggleCollapseAll = () => {
        if (areAllCollapsed) {
            setCollapsedThreads(new Set());
        } else {
            const allThreadIds = postTree.map(p => p.id);
            setCollapsedThreads(new Set(allThreadIds));
        }
    };

    return (
        <div className="h-full flex flex-col">
            {isLoadingPrompt ? <p>Loading prompt...</p> : (
                <div
                    className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-primary dark:border-primary-dark prose prose-sans max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: promptContent?.content || '<p>No prompt available.</p>' }}
                />
            )}
            
            <div className="my-8 pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Start a New Thread</h3>
                <form onSubmit={handleNewThread} className="flex items-start space-x-4">
                    <img src={user?.avatarUrl} alt="Your avatar" className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                        <textarea
                            value={newThreadContent}
                            onChange={e => setNewThreadContent(e.target.value)}
                            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                            rows={3}
                            placeholder="Share your thoughts..."
                            required
                        />
                        <button type="submit" disabled={isSubmitting} className="mt-2 px-4 py-2 text-sm font-bold text-gray-800 bg-primary rounded-md disabled:bg-gray-300">
                             {isSubmitting ? 'Posting...' : 'Post Thread'}
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                {postTree.length > 0 && (
                    <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{postTree.length} Thread{postTree.length > 1 ? 's' : ''}</h3>
                        <button onClick={toggleCollapseAll} className="text-sm font-medium text-secondary dark:text-blue-400 hover:underline">
                            {areAllCollapsed ? 'Show All' : 'Hide All'}
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {loading ? <p>Loading discussion...</p> : postTree.map(post => (
                        <PostItem 
                            key={post.id} 
                            post={post} 
                            onReply={handleNewReply} 
                            level={0} 
                            isCollapsed={collapsedThreads.has(post.id)}
                            onToggleCollapse={() => toggleThreadCollapse(post.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
