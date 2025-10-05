import { useEffect, useState, useRef } from "react";
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
import { toast, useToast } from "../../components/ui/use-toast";
import { Briefcase } from "lucide-react";
import AlumniSidebar from "./AlumniSidebar";
import AlumniTopbar from "./AlumniTopbar";
import {X as CloseIcon }from "lucide-react";
import { Trash2 } from "lucide-react";
import CommunityForum from "../../components/CommunityForum";
import MentorshipRequests from "./MentorshipRequests";
import { AlertCircle } from "lucide-react"; // Import an icon for the reason
import MyMentees from "./MyMentees";
import HostEventForm from "./HostEventForm";
import JobPostForm from "./JobPostForm";
import MyHostedEvents from "./MyHostedEvents";
import MyJobPosts from "./MyJobPosts";
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

      const completionCriteria = [
        {
         
          key: 'Bio', 
          weight: 20,
          isValid: (val) => val && val.trim() !== '',
        },
        {
          key: 'skills',
          weight: 20,
          isValid: (val) => Array.isArray(val) && val.length > 0,
        },
        {
          key: 'currentJob',
          weight: 20,
          isValid: (val) => val && val.trim() !== '',
        },
        {
          key: 'mentorshipAvailability',
          weight: 20,
          // This fix handles both true booleans and the strings "true" or "false"
          isValid: (val) => val === true || val === false,
        },
        {
          key: 'educationHistory',
          weight: 20,
          isValid: (val) => Array.isArray(val) && val.length > 0,
        },
      ];

      let completedScore = 0;
      const totalPossibleScore = 100;

      for (const criterion of completionCriteria) {
        const profileValue = profile[criterion.key];
        if (criterion.isValid(profileValue)) {
          completedScore += criterion.weight;
        }
      }
      
      const percentage = (completedScore / totalPossibleScore) * 100;
      
      return Math.round(percentage);
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


// --- Main Alumni Dashboard Component ---

export default function AlumniDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: `Hi ${user?.fullName?.split(" ")[0]}! I'm here to help.` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBoxRef = useRef(null);
  const [chatReceiver, setChatReceiver] = useState(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jobPostKey, setJobPostKey] = useState(0); // Key to trigger re-fetch

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardView />;
      case "mentorship": return (<Tabs defaultValue="requests" className="w-full"><TabsList className="grid w-full grid-cols-2 md:w-1/3 mb-6"><TabsTrigger value="requests">Pending Requests</TabsTrigger><TabsTrigger value="mentees">My Mentees</TabsTrigger></TabsList><TabsContent value="requests"><MentorshipRequests /></TabsContent><TabsContent value="mentees"><MyMentees onStartChat={setChatReceiver} /></TabsContent></Tabs>);
      case "events": return (<Tabs defaultValue="host"><TabsList className="grid w-full grid-cols-2 md:w-1/3 mb-6"><TabsTrigger value="host"><PlusCircle className="h-4 w-4 mr-2" /> Host an Event</TabsTrigger><TabsTrigger value="my-events"><Calendar className="h-4 w-4 mr-2" /> My Hosted Events</TabsTrigger></TabsList><TabsContent value="host"><HostEventForm onEventProposed={() => {}} /></TabsContent><TabsContent value="my-events"><MyHostedEvents /></TabsContent></Tabs>);
      case "community": return <CommunityForum />;
      case "jobs": return (<Tabs defaultValue="post-job"><TabsList className="grid w-full grid-cols-2 md:w-1/3 mb-6"><TabsTrigger value="post-job"><PlusCircle className="h-4 w-4 mr-2"/>Post a Job</TabsTrigger><TabsTrigger value="my-posts"><Briefcase className="h-4 w-4 mr-2"/>My Posts</TabsTrigger></TabsList><TabsContent value="post-job"><JobPostForm onJobPosted={() => setJobPostKey(k => k + 1)} /></TabsContent><TabsContent value="my-posts"><MyJobPosts keyProp={jobPostKey} onJobDeleted={() => setJobPostKey(k => k + 1)} /></TabsContent></Tabs>);
      case "profile": return <AlumniProfile />;
      default: return <DashboardView />;
    }
  };

  const handleNotificationClick = (sender) => {
        // This function will be passed down to open the chat window
        setChatReceiver(sender);
    };

  const sendChatMessage = async (text) => {
    setChatMessages(msgs => [...msgs, { sender: "user", text }]);
    setChatLoading(true);
    try {
      const res = await api.post("/chatbot", { message: text });
      setChatMessages(msgs => [...msgs, { sender: "bot", text: res.data.reply }]);
    } catch {
      setChatMessages(msgs => [...msgs, { sender: "bot", text: "Error connecting to AI." }]);
    }
    setChatLoading(false);
    setTimeout(() => {
      if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, 100);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AlumniSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        onLogout={logout}
        
      />
      <div className="flex-1 flex flex-col">
        <AlumniTopbar 
          onToggleChatbot={() => setShowChatbot(!showChatbot)}
          setActiveTab={setActiveTab}
          // ✅ Pass the notification handler to the Topbar
          onNotificationClick={handleNotificationClick}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {chatReceiver && <ChatWindow receiver={chatReceiver} onClose={() => setChatReceiver(null)} />}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-white" />
              <span className="text-white font-medium">AI Assistant</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)} className="text-white hover:bg-white/20 h-6 w-6 p-0">
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
          <div ref={chatBoxRef} className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`rounded-lg p-3 text-sm ${msg.sender === "bot" ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-900 text-right"}`}>
                  {msg.text}
                </div>
              ))}
              {chatLoading && <div className="text-gray-400 text-sm">AI is typing...</div>}
            </div>
          </div>
          <div className="p-4 border-t">
            <form
              className="flex space-x-2"
              onSubmit={e => {
                e.preventDefault();
                if (chatInput.trim()) {
                  sendChatMessage(chatInput.trim());
                  setChatInput("");
                }
              }}
            >
              <Input
                placeholder="Ask me anything..."
                className="text-sm"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600" disabled={chatLoading || !chatInput.trim()}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}