import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { MessageCircle, Heart, PlusCircle, Send, XCircle, Trash2 } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/ui/use-toast";

// --- ForumPost Component ---
const ForumPost = ({ post, onLike, onComment, onDeletePost, onDeleteComment }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const isLiked = post.likes.includes(user?._id);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
    setShowCommentBox(false);
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
    <div className="flex items-start space-x-4 py-4">
      <Avatar>
        <AvatarImage />
        <AvatarFallback className="bg-gray-200">
          {post.author?.fullName ? post.author.fullName.substring(0, 2).toUpperCase() : '??'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{post.author?.fullName || 'Anonymous'}</p>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-gray-500">{timeSince(post.createdAt)}</p>
            {post.author?._id === user._id && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onDeletePost(post._id)}>
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </Button>
            )}
          </div>
        </div>
        <h3 className="text-lg font-bold mt-1">{post.title}</h3>
        <p className="text-gray-600 mt-1">{post.content}</p>
        <div className="flex items-center space-x-4 mt-3 text-sm">
          <Badge variant="secondary">{post.category}</Badge>
          <button onClick={() => onLike(post._id)} className={`flex items-center space-x-1 hover:text-red-500 ${isLiked ? "text-red-500" : "text-gray-500"}`}>
            <Heart className="h-4 w-4" />
            <span>{post.likes.length} Likes</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments.length} Replies</span>
          </button>
        </div>
        
        {showCommentBox && (
          <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center space-x-2">
            <Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." />
            <Button type="submit" size="sm">Reply</Button>
          </form>
        )}

        {post.comments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {post.comments.map(comment => (
              <div key={comment._id} className="flex items-start space-x-3 group">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-100 text-xs">
                    {comment.author?.fullName ? comment.author.fullName.substring(0, 2).toUpperCase() : '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm">{comment.author?.fullName || 'Anonymous'}</p>
                    {comment.author?._id === post.author?._id && (
                      <Badge variant="outline" className="h-5 text-xs border-blue-500 text-blue-500">Author</Badge>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
                {comment.author?._id === user._id && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => onDeleteComment(post._id, comment._id)}>
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Community Page ---
export default function StudentCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "" });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts");
      setPosts(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content || !newPost.category) {
      return toast({ title: "Please fill all fields.", variant: "destructive" });
    }
    try {
      await api.post("/posts", newPost);
      setNewPost({ title: "", content: "", category: "" });
      fetchPosts();
      toast({ title: "Success!", description: "Your post has been published." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Post Blocked by AI Moderator",
        description: err.response?.data?.message || "Failed to create post.",
        action: <XCircle />,
      });
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await api.put(`/posts/like/${postId}`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: response.data } : p));
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const response = await api.post(`/posts/comment/${postId}`, { content });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: response.data } : p));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Comment Blocked by AI Moderator",
        description: err.response?.data?.message || "Failed to add comment.",
        action: <XCircle />,
      });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast({ title: "Post Deleted", description: "Your post has been successfully removed." });
      fetchPosts();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete the post." });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
      // ✅ THE CRITICAL FIX: The typo `p._-id` is now `p._id`. This will make the UI update instantly.
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: response.data } : p));
      toast({ title: "Comment Deleted", description: "Your comment has been successfully removed." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete the comment." });
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Student & Alumni Community</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader><CardTitle className="flex items-center"><PlusCircle className="h-5 w-5 mr-2 text-blue-600" />Create a New Post</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Input placeholder="Post Title" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
                <Textarea placeholder={`What's on your mind, ${user?.fullName}?`} value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} />
                <div className="flex items-center justify-between">
                  <Input placeholder="Category (e.g., Tech)" className="w-1/2" value={newPost.category} onChange={(e) => setNewPost({...newPost, category: e.target.value})} />
                  <Button type="submit"><Send className="h-4 w-4 mr-2" />Post</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="divide-y divide-gray-200">
              {loading && <p className="text-center py-8">Loading posts...</p>}
              {error && <p className="text-center py-8 text-red-500">{error}</p>}
              {!loading && posts.length === 0 && (
                <p className="text-center py-8 text-gray-500">No posts yet. Be the first to start a conversation!</p>
              )}
              {!loading && posts.map((post) => (
                <ForumPost 
                  key={post._id} 
                  post={post} 
                  onLike={handleLikePost}
                  onComment={handleAddComment}
                  onDeletePost={handleDeletePost}
                  onDeleteComment={handleDeleteComment}
                />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-base">Community Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Total Posts</span><span className="font-semibold">{posts.length}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}