import { useEffect, useState } from "react";
import { User, Users, Calendar, BookOpen, MessageCircle, Bot, X, ArrowRight, Home, Bell, Award, Zap, Star, Briefcase, Menu, X as CloseIcon, LogOut, UserPlus } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../components/ui/use-toast";
import StudentProfile from "./StudentProfile";
import StudentAlumni from "./StudentAlumni";
import StudentCommunity from "./StudentCommunity";
import StudentEvents from "./StudentEvents";
import StudentResources from "./StudentResources";
import StudentMentorship from "./StudentMentorship";
import ProfileMenu from "./ProfileMenu";
import StudentJobs from "./StudentJobs";
import CommunityForum from "../../components/CommunityForum";
import NotificationDropdown from "../../components/NotificationDropdown";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import ChatWindow from "../../components/ChatWindow";
// --- DashboardView Component (No changes to logic, just cleaned up) ---
const DashboardView = ({ setActiveTab }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [stats, setStats] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [goals, setGoals] = useState("");
    const [requestedMentors, setRequestedMentors] = useState(new Set());
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, matchesRes, requestsRes] = await Promise.all([
                    api.get("/stats/student-dashboard"),
                    api.get("/recommendations/matches"),
                    api.get("/mentorships/my-requests")
                ]);
                setStats(statsRes.data);
                setMatches(matchesRes.data);
                setRequestedMentors(new Set(requestsRes.data.map(req => req.mentor._id)));
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateProfileCompletion = (profile) => {
        if (!profile) return 0;
        let score = 0;
        const totalFields = 5;
        if (profile.bio) score++;
        if (profile.skills?.length > 0) score++;
        if (profile.interests?.length > 0) score++;
        if (profile.careerGoal) score++;
        if (profile.industryInterestOrField?.length > 0) score++;
        return Math.round((score / totalFields) * 100);
    };

    const handleConnectClick = (alumni) => {
        setSelectedMentor(alumni);
    };

    const handleSendRequest = async () => {
        if (!selectedMentor) return;
        setIsRequesting(true);
        try {
            await api.post("/mentorships/request", {
                mentorId: selectedMentor.userId._id,
                goals,
            });
            toast({
                title: "Request Sent!",
                description: `Your mentorship request has been sent to ${selectedMentor.userId.fullName}.`,
            });
            setRequestedMentors(prev => new Set(prev).add(selectedMentor.userId._id));
            setSelectedMentor(null);
            setGoals("");
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to Send Request",
                description: err.response?.data?.message || "There was an error sending your request.",
            });
        } finally {
            setIsRequesting(false);
        }
    };

    const profileCompletion = calculateProfileCompletion(stats?.studentProfile);

    const quickStats = [
        { label: "Profile Completion", value: `${profileCompletion}%`, icon: <User className="h-5 w-5" />, color: "bg-blue-500" },
        { label: "Mentor Connections", value: stats?.acceptedMenteeships || 0, icon: <Users className="h-5 w-5" />, color: "bg-green-500" },
        { label: "Events Attended", value: stats?.eventsAttended || 0, icon: <Calendar className="h-5 w-5" />, color: "bg-purple-500" },
        { label: "AI Matches Found", value: matches.length, icon: <Zap className="h-5 w-5" />, color: "bg-orange-500" },
    ];

    if (loading) return <p className="text-center text-gray-500 py-10">Loading dashboard...</p>;

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-xl bg-white/70 backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.color} text-white`}>{stat.icon}</div>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                                {stat.label === "Profile Completion" && <Progress value={profileCompletion} className="h-2 mt-2 bg-gray-200 [&>div]:bg-blue-500" />}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-600" /> Your Top AI Matches</CardTitle>
                            <CardDescription>Connect with alumni based on your profile and career goals.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("alumni")}>View All</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {matches.length === 0 ? <p className="text-center text-gray-500 py-4">No matches found. Complete your profile for better recommendations!</p> :
                        matches.slice(0, 3).map(({ alumni, score }) => (
                            <div key={alumni._id} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between transition-colors duration-200 hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarFallback className="bg-blue-200 text-blue-700 text-xl font-medium">{alumni.userId.fullName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{alumni.userId.fullName}</h4>
                                        <p className="text-sm text-gray-600">{alumni.currentJob}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center text-green-600 font-semibold">
                                        <Star className="h-4 w-4 mr-1" />
                                        <span className="text-sm">{score} Match Score</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleConnectClick(alumni)}
                                        disabled={requestedMentors.has(alumni.userId._id)}
                                        className="h-8"
                                    >
                                        {requestedMentors.has(alumni.userId._id) ? "Requested" : "Connect"}
                                        <UserPlus className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                </CardContent>
            </Card>
            {/* Connection Request Dialog */}
            <Dialog open={!!selectedMentor} onOpenChange={(open) => !open && setSelectedMentor(null)}>
                {selectedMentor && (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Request Mentorship from {selectedMentor.userId.fullName}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <p className="text-sm text-gray-600">Briefly describe what you hope to achieve from this mentorship.</p>
                            <Textarea placeholder="E.g., I need help with my resume and interview preparation..." value={goals} onChange={(e) => setGoals(e.target.value)} />
                            <Button onClick={handleSendRequest} disabled={isRequesting} className="w-full">
                                {isRequesting ? "Sending..." : "Send Request"}
                            </Button>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
};

// --- Main StudentDashboard Component ---
export default function StudentDashboard() {
    const { user, logout, notifications, clearNotifications } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showChatbot, setShowChatbot] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [chatReceiver, setChatReceiver] = useState(null);

    const navItems = [
        { name: "Dashboard", tab: "dashboard", icon: <Home className="h-5 w-5" /> },
        { name: "Alumni", tab: "alumni", icon: <Users className="h-5 w-5" /> },
        { name: "Mentorship", tab: "mentorship", icon: <Award className="h-5 w-5" /> },
        { name: "Events", tab: "events", icon: <Calendar className="h-5 w-5" /> },
        { name: "Resources", tab: "resources", icon: <BookOpen className="h-5 w-5" /> },
        { name: "Community", tab: "community", icon: <MessageCircle className="h-5 w-5" /> },
        { name: "Jobs", tab: "jobs", icon: <Briefcase className="h-5 w-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard": return <DashboardView setActiveTab={setActiveTab} />;
            case "alumni": return <StudentAlumni />;
            case "mentorship": return <StudentMentorship />;
            case "events": return <StudentEvents />;
            case "resources": return <StudentResources />;
            case "community": return <CommunityForum />;
            case "profile": return <StudentProfile />;
            case "jobs": return <StudentJobs />;
            default: return <DashboardView setActiveTab={setActiveTab} />;
        }
    };

    const handleNotificationClick = (sender) => {
        // This function will be passed down to open the chat window
        setChatReceiver(sender);
    };


    return (
        <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar 
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            logout={logout}
            
        />
        <div className="flex-1 flex flex-col">
            <StudentTopbar 
            onToggleChatbot={() => setShowChatbot(!showChatbot)}
            setActiveTab={setActiveTab}
            onNotificationClick={handleNotificationClick}
            />
            <main className="flex-1 p-8 overflow-y-auto">
            {renderContent()}
            </main>
        </div>

        {chatReceiver && <ChatWindow receiver={chatReceiver} onClose={() => setChatReceiver(null)} />}
        {showChatbot && (
            <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl border z-50">
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
                    <div className="flex items-center space-x-2"><Bot className="h-5 w-5 text-white" /><span className="text-white font-medium">AI Assistant</span></div>
                    <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)} className="text-white hover:bg-white/20 h-6 w-6 p-0"><X className="h-4 w-4" /></Button>
                </div>
                <div className="p-4 h-64 overflow-y-auto"><div className="space-y-3"><div className="bg-gray-100 rounded-lg p-3"><p className="text-sm text-gray-700">Hi {user?.fullName?.split(" ")[0]}! I'm here to help.</p></div></div></div>
                <div className="p-4 border-t"><div className="flex space-x-2"><Input placeholder="Ask me anything..." className="text-sm" /><Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600"><ArrowRight className="h-4 w-4" /></Button></div></div>
            </div>
        )}
        </div>
    );
}