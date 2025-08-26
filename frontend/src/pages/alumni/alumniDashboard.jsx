import { useEffect, useState } from "react";
import { User, Users, Calendar, BookOpen, MessageCircle, Bot, X, ArrowRight, Home, Bell, MessageSquare, PlusCircle, Link as LinkIcon, MapPin, Handshake } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import AlumniProfile from "./AlumniProfile";
import ProfileMenu from "./ProfileMenu";
import api from "../../api/axios";
import ChatWindow from "../../components/ChatWindow";
import { useToast } from "../../components/ui/use-toast";
import { Briefcase } from "lucide-react";
import StudentCommunity from "./StudentCommunity";
import AlumniSidebar from "./AlumniSidebar";
import AlumniTopbar from "./AlumniTopbar";
import {X as CloseIcon }from "lucide-react";



const DashboardView = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await api.get("/stats/alumni-dashboard");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const calculateProfileCompletion = (profile) => {
        if (!profile) return 0;
        let score = 20; // Base score for existing
        const totalFields = 4;
        if (profile.skills?.length > 0) score += 20;
        if (profile.bio) score += 20;
        if (profile.currentJob) score += 20;
        if (profile.mentorshipAvailability === true) score += 20;
        return score > 100 ? 100 : score;
    };

    const profileCompletion = calculateProfileCompletion(stats?.alumniProfile);

    const quickStats = [
      { label: "Profile Completion", value: `${profileCompletion}%`, icon: <User className="h-5 w-5" />, color: "bg-blue-500" },
      { label: "Pending Requests", value: stats?.pendingRequests || 0, icon: <Handshake className="h-5 w-5" />, color: "bg-green-500" },
      { label: "Active Mentees", value: stats?.activeMentees || 0, icon: <Users className="h-5 w-5" />, color: "bg-purple-500" },
      { label: "Events Hosted", value: stats?.hostedEvents || 0, icon: <Calendar className="h-5 w-5" />, color: "bg-red-500" },
    ];

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, i) => (
                <Card key={i} className="border-0 shadow-xl bg-white/70 backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4"><div className={`p-3 rounded-xl text-white ${stat.color}`}>{stat.icon}</div></div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                            {stat.label === "Profile Completion" && <Progress value={profileCompletion} className="h-2 mt-2 bg-gray-200 [&>div]:bg-blue-500" />}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// --- Mentorship Requests Component ---
const MentorshipRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/mentorships/received-requests");
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (requestId, status) => {
    try {
      await api.put(`/mentorships/respond/${requestId}`, { status });
      setRequests(requests.filter((req) => req._id !== requestId));
      alert(`Request has been ${status}.`);
    } catch (error) {
      alert("Failed to respond to request.");
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Pending Mentorship Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-gray-500">You have no new mentorship requests.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li key={req._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>{req.student.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{req.student.fullName}</p>
                    <p className="text-sm text-gray-500 mb-2">Requested on: {new Date(req.requestedAt).toLocaleDateString()}</p>
                    <p className="text-sm bg-white p-3 rounded-md border">"{req.studentGoals}"</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <Button variant="outline" onClick={() => handleResponse(req._id, "Rejected")}>Reject</Button>
                  <Button onClick={() => handleResponse(req._id, "Accepted")}>Accept</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

// --- My Mentees Component ---
const MyMentees = ({ onStartChat }) => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        setLoading(true);
        const res = await api.get("/mentorships/my-mentees");
        setMentees(res.data);
      } catch (error) {
        console.error("Failed to fetch mentees", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  if (loading) return <p>Loading mentees...</p>;

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>My Mentees</CardTitle>
      </CardHeader>
      <CardContent>
        {mentees.length === 0 ? (
          <p className="text-gray-500">You have not accepted any mentees yet.</p>
        ) : (
          <ul className="space-y-4">
            {mentees.map((mentorship) => (
              <li key={mentorship._id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{mentorship.student.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{mentorship.student.fullName}</p>
                    <p className="text-sm text-gray-500">Accepted on: {new Date(mentorship.acceptedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button onClick={() => onStartChat(mentorship.student)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Now
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

// --- Host Event Form Component ---
const HostEventForm = ({ onEventProposed }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [form, setForm] = useState({ title: "", description: "", date: "", duration: "", type: "Webinar", mode: "Online", location: "", meetingLink: "" });

    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSelectChange = (value) => setForm({ ...form, type: value });
    const handleModeChange = (value) => setForm({ ...form, mode: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventData = { ...form, speaker: user.fullName, speakerRole: "Alumnus" };
            await api.post("/events/propose", eventData);
            toast({ title: "Proposal Submitted!", description: "Your event is now pending admin approval." });
            setForm({ title: "", description: "", date: "", duration: "", type: "Webinar", mode: "Online", location: "", meetingLink: "" });
            if (onEventProposed) onEventProposed();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to submit proposal." });
        }
    };
    
    return (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Propose a New Event</CardTitle>
                <CardDescription>Share your knowledge. Submit the details below for admin review.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input id="title" name="title" value={form.title} onChange={handleFormChange} required />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="description">Event Description</Label>
                            <Textarea id="description" name="description" value={form.description} onChange={handleFormChange} required />
                        </div>
                        <div className="md:col-span-2">
                            <Label>Event Mode</Label>
                            <RadioGroup defaultValue="Online" onValueChange={handleModeChange} className="flex items-center space-x-4 pt-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Online" id="online" /><Label htmlFor="online">Online</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Offline" id="offline" /><Label htmlFor="offline">Offline</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="md:col-span-2">
                            {form.mode === 'Online' ? (
                                <div>
                                    <Label htmlFor="meetingLink">Meeting Link (Google Meet, Zoom, etc.)</Label>
                                    <Input id="meetingLink" name="meetingLink" value={form.meetingLink} onChange={handleFormChange} placeholder="https://meet.google.com/..." required />
                                </div>
                            ) : (
                                <div>
                                    <Label htmlFor="location">Location (Venue Address)</Label>
                                    <Input id="location" name="location" value={form.location} onChange={handleFormChange} placeholder="e.g., VIT Pune Auditorium" required />
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="date">Proposed Date & Time</Label>
                            <Input id="date" name="date" type="datetime-local" value={form.date} onChange={handleFormChange} required />
                        </div>
                        <div>
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" name="duration" value={form.duration} onChange={handleFormChange} placeholder="e.g., 90 minutes" />
                        </div>
                        <div className="md:col-span-2">
                            <Label>Type</Label>
                            <Select onValueChange={handleSelectChange} defaultValue="Webinar">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Webinar">Webinar</SelectItem>
                                    <SelectItem value="Workshop">Workshop</SelectItem>
                                    <SelectItem value="Meetup">Meetup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-6">Submit for Approval</Button>
                </form>
            </CardContent>
        </Card>
    );
};

// --- My Hosted Events Component (Upgraded) ---
const MyHostedEvents = ({ keyProp }) => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                setLoading(true);
                const res = await api.get("/events/my-hosted");
                setMyEvents(res.data);
            } catch (error) {
                console.error("Failed to fetch hosted events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, [keyProp]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
            case 'Rejected': return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
            default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
        }
    };

    if (loading) return <p>Loading your events...</p>;
    
    return (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader><CardTitle>My Hosted Events</CardTitle></CardHeader>
            <CardContent>
                {myEvents.length === 0 ? <p className="text-gray-500">You have not proposed any events yet.</p> : (
                    <ul className="space-y-3">
                        {myEvents.map(event => (
                            <li key={event._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <p className="font-semibold">{event.title}</p>
                                      {getStatusBadge(event.status)}
                                    </div>
                                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                {/* ✅ NEW: "Join Now" button for approved online events */}
                                {event.status === 'Approved' && event.mode === 'Online' && (
                                    <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm">
                                            <LinkIcon className="h-4 w-4 mr-2"/>
                                            Join Now
                                        </Button>
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};


const JobPostForm = ({ onJobPosted }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    type: "Full-Time",
    applyLink: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = { ...form, postedBy: user._id, postedByName: user.fullName };
      await api.post("/jobs/post", jobData);
      toast({ title: "Job Posted!", description: "Your job is now visible to students." });
      setForm({ title: "", description: "", company: "", location: "", type: "Full-Time", applyLink: "" });
      if (onJobPosted) onJobPosted();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to post job." });
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
        <CardDescription>Share job opportunities with students.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" value={form.company} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={form.location} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="type">Job Type</Label>
              <Select onValueChange={(val) => setForm({ ...form, type: val })} defaultValue="Full-Time">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="applyLink">Application Link</Label>
              <Input id="applyLink" name="applyLink" value={form.applyLink} onChange={handleChange} placeholder="https://careers.company.com/job123" />
            </div>
          </div>
          <Button type="submit" className="w-full mt-6">Post Job</Button>
        </form>
      </CardContent>
    </Card>
  );
};


const MyJobPosts = ({ keyProp }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/jobs/my-posts");
        setJobs(res.data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [keyProp]);

  if (loading) return <p>Loading jobs...</p>;

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader><CardTitle>My Job Posts</CardTitle></CardHeader>
      <CardContent>
        {jobs.length === 0 ? <p className="text-gray-500">You have not posted any jobs yet.</p> : (
          <ul className="space-y-3">
            {jobs.map(job => (
              <li key={job._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{job.title} @ {job.company}</p>
                    <p className="text-sm text-gray-500">{job.location} · {job.type}</p>
                  </div>
                  {job.applyLink && (
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">Apply</Button>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};



// --- Main Alumni Dashboard Component ---

export default function AlumniDashboard() {
  const { user, logout, notifications, clearNotifications } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatReceiver, setChatReceiver] = useState(null);
  const [hostedEventsKey, setHostedEventsKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for the sidebar

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <AlumniSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <AlumniTopbar
          notifications={notifications}
          clearNotifications={clearNotifications}
          onToggleChatbot={() => setShowChatbot(!showChatbot)}
           setActiveTab={setActiveTab} // Pass the setActiveTab prop here
        />

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto container mx-auto px-4 py-8">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "mentorship" && (
            <Tabs defaultValue="requests" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-1/3 mb-6">
                <TabsTrigger value="requests">Pending Requests</TabsTrigger>
                <TabsTrigger value="mentees">My Mentees</TabsTrigger>
              </TabsList>
              <TabsContent value="requests">
                <MentorshipRequests />
              </TabsContent>
              <TabsContent value="mentees">
                <MyMentees onStartChat={setChatReceiver} />
              </TabsContent>
            </Tabs>
          )}
          {activeTab === "events" && (
            <Tabs defaultValue="host">
              <TabsList className="grid w-full grid-cols-2 md:w-1/3 mb-6">
                <TabsTrigger value="host">
                  <PlusCircle className="h-4 w-4 mr-2" /> Host an Event
                </TabsTrigger>
                <TabsTrigger value="my-events">
                  <Calendar className="h-4 w-4 mr-2" /> My Hosted Events
                </TabsTrigger>
              </TabsList>
              <TabsContent value="host">
                <HostEventForm onEventProposed={() => setHostedEventsKey((k) => k + 1)} />
              </TabsContent>
              <TabsContent value="my-events">
                <MyHostedEvents keyProp={hostedEventsKey} />
              </TabsContent>
            </Tabs>
          )}
          {activeTab === "community" && <StudentCommunity />}
          {activeTab === "profile" && <AlumniProfile />}
          {activeTab === "jobs" && (
            <Tabs defaultValue="post">
              <TabsList className="grid w-full grid-cols-2 md:w-1/3 mb-6">
                <TabsTrigger value="post">
                  <PlusCircle className="h-4 w-4 mr-2" /> Post a Job
                </TabsTrigger>
                <TabsTrigger value="my-jobs">
                  <Briefcase className="h-4 w-4 mr-2" /> My Job Posts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="post">
                <JobPostForm onJobPosted={() => setHostedEventsKey((k) => k + 1)} />
              </TabsContent>
              <TabsContent value="my-jobs">
                <MyJobPosts keyProp={hostedEventsKey} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      {showChatbot && (
                <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300">
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
                        <div className="flex items-center space-x-2"><Bot className="h-5 w-5 text-white" /><span className="text-white font-medium">AI Assistant</span></div>
                        <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)} className="text-white hover:bg-white/20 h-6 w-6 p-0"><CloseIcon className="h-4 w-4" /></Button>
                    </div>
                    <div className="p-4 h-64 overflow-y-auto"><div className="space-y-3"><div className="bg-gray-100 rounded-lg p-3"><p className="text-sm text-gray-700">Hi {user?.fullName?.split(" ")[0]}! I'm here to help.</p></div></div></div>
                    <div className="p-4 border-t"><div className="flex space-x-2"><Input placeholder="Ask me anything..." className="text-sm" /><Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600"><ArrowRight className="h-4 w-4" /></Button></div></div>
                </div>
        )}
      {chatReceiver && <ChatWindow receiver={chatReceiver} onClose={() => setChatReceiver(null)} />}
    </div>
  );
}