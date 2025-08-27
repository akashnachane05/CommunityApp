import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { MessageCircle, Heart, PenSquare, Send, Trash2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ui/use-toast";
import { cn } from "../lib/utils";

// --- Single Comment Component ---
const Comment = ({ comment, postAuthorId, onDeleteComment, postId }) => {
    const { user } = useAuth();
    return (
        <div className="flex items-start space-x-3 group">
            <Avatar className="h-8 w-8"><AvatarFallback className="bg-gray-100 text-xs">{comment.author?.fullName?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback></Avatar>
            <div className="bg-gray-100 rounded-lg p-2 flex-1">
                <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm">{comment.author?.fullName || 'Anonymous'}</p>
                    {comment.author?._id === postAuthorId && (<Badge variant="outline" className="h-5 text-xs">Author</Badge>)}
                </div>
                <p className="text-gray-700 text-sm">{comment.content}</p>
            </div>
            {comment.author?._id === user._id && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => onDeleteComment(postId, comment._id)}>
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
            )}
        </div>
    );
};

// --- Forum Post Component (Redesigned with Collapsible Comments) ---
const ForumPost = ({ post, onLike, onComment, onDeletePost, onDeleteComment }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    await onLike(post._id);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
  };
  
  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${Math.floor(seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
            <div className="flex items-start space-x-4">
                <Avatar><AvatarFallback className="bg-gray-200">{post.author?.fullName?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback></Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">{post.author?.fullName || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{timeSince(post.createdAt)}</p>
                        </div>
                        {post.author?._id === user._id && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onDeletePost(post._id)}>
                                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </Button>
                        )}
                    </div>
                    <h3 className="text-lg font-bold mt-2">{post.title}</h3>
                    <p className="text-gray-700 mt-1 text-sm">{post.content}</p>
                    <div className="flex items-center space-x-6 mt-4">
                        <button onClick={handleLike} className={cn("flex items-center space-x-1 hover:text-red-500", isLiked ? "text-red-500" : "text-gray-500")}>
                            <Heart className="h-5 w-5" />
                            <span className="text-sm font-medium">{likeCount}</span>
                        </button>
                        <button onClick={() => setAreCommentsVisible(!areCommentsVisible)} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">{post.comments.length}</span>
                        </button>
                    </div>
                </div>
            </div>
            {areCommentsVisible && (
                <div className="mt-4 pt-4 border-t pl-14">
                    <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 mb-4">
                        <Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." />
                        <Button type="submit" size="sm">Reply</Button>
                    </form>
                    <div className="space-y-3">
                        {post.comments.map(comment => (
                            <Comment key={comment._id} comment={comment} postAuthorId={post.author?._id} onDeleteComment={onDeleteComment} postId={post._id} />
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
};

// --- Create Post Dialog Component ---
const CreatePostDialog = ({ onPostCreated }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", content: "", category: "" });

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await api.post("/posts", newPost);
            setNewPost({ title: "", content: "", category: "" });
            toast({ title: "Success!", description: "Your post has been published." });
            setOpen(false);
            onPostCreated();
        } catch (err) {
            toast({ variant: "destructive", title: "Post Blocked", description: err.response?.data?.message || "Failed to create post." });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card className="mb-6 border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <Avatar><AvatarFallback>{user?.fullName?.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <div className="flex-1 text-gray-500">What's on your mind?</div>
                        <Button className="bg-blue-600 hover:bg-blue-700"><PenSquare className="h-4 w-4 mr-2" />Create Post</Button>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Create a New Post</DialogTitle></DialogHeader>
                <form onSubmit={handleCreatePost} className="space-y-4 pt-4">
                    <Input placeholder="Post Title" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} required />
                    <Textarea placeholder={`Share your thoughts, ${user?.fullName}...`} value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} required />
                    <div className="flex items-center justify-between">
                        <Input placeholder="Category (e.g., Tech)" className="w-1/2" value={newPost.category} onChange={(e) => setNewPost({...newPost, category: e.target.value})} required />
                        <Button type="submit"><Send className="h-4 w-4 mr-2" />Post</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// --- Main Community Page ---
export default function CommunityForum() {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts");
      setPosts(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLikePost = async (postId) => {
    try {
      await api.put(`/posts/like/${postId}`);
      // The local UI state is already handled optimistically in the ForumPost component
    } catch (err) {
      console.error("Failed to like post:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not update like." });
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      await api.post(`/posts/comment/${postId}`, { content });
      fetchPosts(); // Re-fetch to get the latest comments
    } catch (err) {
      toast({ variant: "destructive", title: "Comment Blocked", description: err.response?.data?.message || "Failed to add comment." });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast({ title: "Post Deleted" });
      fetchPosts();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete the post." });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/posts/${postId}/comment/${commentId}`);
      toast({ title: "Comment Deleted" });
      fetchPosts(); // Re-fetch to update comments list
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete the comment." });
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Student & Alumni Community</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CreatePostDialog onPostCreated={fetchPosts} />
          {loading && <p>Loading posts...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && posts.length === 0 && (
            <p className="text-center text-gray-500 py-10">No posts yet. Be the first to start a conversation!</p>
          )}
          {!loading && !error && posts.map((post) => (
            <ForumPost 
              key={post._id} 
              post={post} 
              onLike={handleLikePost}
              onComment={handleAddComment}
              onDeletePost={handleDeletePost}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-base">Community Guidelines</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
                <p>1. Be respectful and constructive.</p>
                <p>2. Share knowledge and opportunities.</p>
                <p>3. Keep discussions professional.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}