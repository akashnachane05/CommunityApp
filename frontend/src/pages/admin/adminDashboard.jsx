import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/navbar";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Users, Calendar, MessageSquare, Trash2, Flag, PlusCircle, Check, X, Clock } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";

// --- ManageUsers Component ---
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.filter(u => u.role !== 'Admin'));
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load users." });
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user and all their content? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast({ title: "User Deleted", description: "The user has been permanently removed." });
      fetchUsers();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Manage Platform Users</CardTitle>
        <CardDescription>View user details, moderation flags, and take administrative actions.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading users...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Flags</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{u.fullName}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3"><Badge variant={u.role === 'Alumni' ? 'default' : 'secondary'}>{u.role}</Badge></td>
                    <td className="p-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" disabled={!u.violations || u.violations.length === 0} className="flex items-center gap-2 px-2 h-8">
                            <Flag className={`h-4 w-4 ${u.violations?.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                            {u.violations?.length || 0}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Content Violations for {u.fullName}</DialogTitle></DialogHeader>
                          <div className="py-4 max-h-96 overflow-y-auto">
                            {u.violations?.length > 0 ? (
                              <ul className="space-y-2">
                                {u.violations.map((v, i) => (
                                  <li key={i} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                                    <p className="font-mono text-red-800">"{v.content}"</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(v.timestamp).toLocaleString()}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : <p>No violations recorded.</p>}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="p-3">
                      <Button onClick={() => deleteUser(u._id)} variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// --- ManageEvents Component ---
const ManageEvents = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: "", description: "", speaker: "", speakerRole: "", date: "", duration: "", type: "Webinar", mode: "Online", location: "", meetingLink: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsRes, pendingRes] = await Promise.all([
                api.get("/events/all-admin"),
                api.get("/events/pending")
            ]);
            setEvents(eventsRes.data);
            setPendingEvents(pendingRes.data);
        } catch (error) {
            console.error("Failed to fetch events data", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load event data." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSelectChange = (value) => setForm({ ...form, type: value });
    const handleModeChange = (value) => setForm({ ...form, mode: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventData = { ...form, speaker: form.speaker || user.fullName, speakerRole: form.speakerRole || "Administrator" };
            await api.post("/events/admin-create", eventData);
            toast({ title: "Event Created" });
            setForm({ title: "", description: "", speaker: "", speakerRole: "", date: "", duration: "", type: "Webinar", mode: "Online", location: "", meetingLink: "" });
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create event." });
        }
    };

    const handleStatusUpdate = async (eventId, status) => {
        try {
            await api.put(`/events/status/${eventId}`, { status });
            toast({ title: `Event ${status}`, description: "The event status has been updated." });
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not update event status." });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
            case 'Rejected': return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
            default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
        }
    };
    
    return (
        <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending"><Clock className="h-4 w-4 mr-2"/> Pending Approvals <Badge className="ml-2">{pendingEvents.length}</Badge></TabsTrigger>
                <TabsTrigger value="create"><PlusCircle className="h-4 w-4 mr-2"/> Create New</TabsTrigger>
                <TabsTrigger value="all"><Calendar className="h-4 w-4 mr-2"/> All Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="mt-4">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader><CardTitle>Create Admin Event</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Label htmlFor="admin-title">Title</Label>
                                    <Input id="admin-title" name="title" value={form.title} onChange={handleFormChange} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="admin-desc">Description</Label>
                                    <Textarea id="admin-desc" name="description" value={form.description} onChange={handleFormChange} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Event Mode</Label>
                                    <RadioGroup defaultValue="Online" onValueChange={handleModeChange} className="flex items-center space-x-4 pt-2">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Online" id="admin-online" /><Label htmlFor="admin-online">Online</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Offline" id="admin-offline" /><Label htmlFor="admin-offline">Offline</Label></div>
                                    </RadioGroup>
                                </div>
                                <div className="md:col-span-2">
                                    {form.mode === 'Online' ? (
                                        <div><Label htmlFor="admin-link">Meeting Link</Label><Input id="admin-link" name="meetingLink" value={form.meetingLink} onChange={handleFormChange} placeholder="https://meet.google.com/..." required /></div>
                                    ) : (
                                        <div><Label htmlFor="admin-loc">Location</Label><Input id="admin-loc" name="location" value={form.location} onChange={handleFormChange} placeholder="e.g., VIT Pune Auditorium" required /></div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="admin-speaker">Speaker</Label>
                                    <Input id="admin-speaker" name="speaker" value={form.speaker} onChange={handleFormChange} placeholder="Defaults to your name" />
                                </div>
                                <div>
                                    <Label htmlFor="admin-speakerRole">Speaker's Role</Label>
                                    <Input id="admin-speakerRole" name="speakerRole" value={form.speakerRole} onChange={handleFormChange} placeholder="Defaults to Administrator"/>
                                </div>
                                <div>
                                    <Label htmlFor="admin-date">Date & Time</Label>
                                    <Input id="admin-date" name="date" type="datetime-local" value={form.date} onChange={handleFormChange} required />
                                </div>
                                <div>
                                    <Label htmlFor="admin-duration">Duration</Label>
                                    <Input id="admin-duration" name="duration" value={form.duration} onChange={handleFormChange} placeholder="e.g., 90 minutes" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Type</Label>
                                    <Select onValueChange={handleSelectChange} defaultValue="Webinar"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Webinar">Webinar</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Meetup">Meetup</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-6">Create Event</Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
                 <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader><CardTitle>Pending Event Approvals</CardTitle></CardHeader>
                    <CardContent>
                        {loading ? <p>Loading...</p> : pendingEvents.length === 0 ? <p className="text-gray-500">No events are pending approval.</p> : (
                            <ul className="space-y-4">
                                {pendingEvents.map(event => (
                                    <li key={event._id} className="p-4 bg-gray-50 rounded-lg">
                                        <p className="font-semibold">{event.title}</p>
                                        <p className="text-sm text-gray-500">Proposed by: {event.hostedBy?.fullName || 'N/A'}</p>
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(event._id, 'Rejected')}><X className="h-4 w-4 mr-2"/> Reject</Button>
                                            <Button size="sm" onClick={() => handleStatusUpdate(event._id, 'Approved')}><Check className="h-4 w-4 mr-2"/> Approve</Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader><CardTitle>All Platform Events</CardTitle></CardHeader>
                    <CardContent>
                         {loading ? <p>Loading events...</p> : (
                             <ul className="space-y-3">
                                 {events.map(event => (
                                     <li key={event._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                         <div>
                                             <p className="font-semibold">{event.title}</p>
                                             <p className="text-sm text-gray-500">Hosted by: {event.hostedBy?.fullName || 'Admin'}</p>
                                         </div>
                                         {getStatusBadge(event.status)}
                                     </li>
                                 ))}
                             </ul>
                         )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};

// --- ManageForum Component ---
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

// --- Main Admin Dashboard Component ---
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-6">Admin Dashboard</h2>
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" /> Manage Users</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-2" /> Manage Events</TabsTrigger>
            <TabsTrigger value="forum"><MessageSquare className="h-4 w-4 mr-2" /> Manage Forum</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users"><ManageUsers /></TabsContent>
          <TabsContent value="events"><ManageEvents /></TabsContent>
          <TabsContent value="forum"><ManageForum /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}