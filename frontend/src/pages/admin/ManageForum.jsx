
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "../../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Users, Calendar, MessageSquare, Trash2, Flag, PlusCircle, Check, X, Clock,Briefcase,Bot,ArrowRight,FileText } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";

const ManageForum = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/posts");
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Delete this post permanently?")) return;
        try {
            await api.delete(`/posts/admin/${postId}`);
            toast({ title: "Post Deleted", description: "The post has been removed." });
            fetchPosts();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete the post." });
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm("Delete this comment permanently?")) return;
        try {
            await api.delete(`/posts/admin/${postId}/comment/${commentId}`);
            toast({ title: "Comment Deleted", description: "The comment has been removed." });
            fetchPosts();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete the comment." });
        }
    };

    if (loading) return <p>Loading posts...</p>;

    return (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Manage Community Forum</CardTitle>
                <CardDescription>View and moderate all user-submitted posts and comments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {posts.map(post => (
                    <div key={post._id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold">{post.title}</h4>
                                <p className="text-sm text-gray-500">by {post.author.fullName}</p>
                                <p className="mt-2 text-gray-700">{post.content}</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post._id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Post
                            </Button>
                        </div>
                        {post.comments.length > 0 && (
                            <div className="mt-4 pt-4 border-t space-y-2">
                                <h5 className="text-sm font-semibold">Comments:</h5>
                                {post.comments.map(comment => (
                                    <div key={comment._id} className="pl-4 flex justify-between items-center bg-white p-2 rounded">
                                        <div>
                                            <p className="text-sm">"{comment.content}"</p>
                                            <p className="text-xs text-gray-500">- {comment.author.fullName}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeleteComment(post._id, comment._id)}>
                                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
export default ManageForum;