import { useEffect, useState } from "react";
import { User, Users, Calendar, BookOpen, MessageCircle, Bot, X, ArrowRight, Home, Bell, Award, Zap, Star } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import StudentProfile from "./StudentProfile";
import StudentAlumni from "./StudentAlumni";
import StudentCommunity from "./StudentCommunity";
import StudentEvents from "./StudentEvents";
import StudentResources from "./StudentResources";
import StudentMentorship from "./StudentMentorship";
import ProfileMenu from "./ProfileMenu";

// --- Main Dashboard View ---
const DashboardView = ({ setActiveTab }) => {
    const [stats, setStats] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch stats and AI matches at the same time
                const [statsRes, matchesRes] = await Promise.all([
                    api.get("/stats/student-dashboard"),
                    api.get("/recommendations/matches")
                ]);
                setStats(statsRes.data);
                setMatches(matchesRes.data);
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

    const profileCompletion = calculateProfileCompletion(stats?.studentProfile);

    const quickStats = [
        { label: "Profile Completion", value: `${profileCompletion}%`, icon: <User className="h-5 w-5" />, color: "bg-blue-500" },
        { label: "Mentor Connections", value: stats?.acceptedMenteeships || 0, icon: <Users className="h-5 w-5" />, color: "bg-green-500" },
        { label: "Events Attended", value: stats?.eventsAttended || 0, icon: <Calendar className="h-5 w-5" />, color: "bg-purple-500" },
        { label: "AI Matches Found", value: matches.length, icon: <Zap className="h-5 w-5" />, color: "bg-orange-500" },
    ];

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.color} text-white`}>{stat.icon}</div>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                {stat.label === "Profile Completion" && <Progress value={profileCompletion} className="h-2 mt-2" />}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
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
                        <div key={alumni._id} className="p-4 border rounded-xl flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12"><AvatarFallback>{alumni.userId.fullName.charAt(0)}</AvatarFallback></Avatar>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{alumni.userId.fullName}</h4>
                                    <p className="text-sm text-gray-600">{alumni.currentJob}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-green-600">
                                <Star className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">{score} Match Score</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};


// --- Main StudentDashboard Component ---
export default function StudentDashboard() {
  const { user, logout, notifications, clearNotifications} = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showChatbot, setShowChatbot] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
        case "dashboard": return <DashboardView setActiveTab={setActiveTab} />;
        case "alumni": return <StudentAlumni />;
        case "mentorship": return <StudentMentorship />;
        case "events": return <StudentEvents />;
        case "resources": return <StudentResources />;
        case "community": return <StudentCommunity />;
        case "profile": return <StudentProfile />;
        default: return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 px-4 py-2">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">V</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">VITAA</span>
                </div>
                <div className="hidden md:flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("dashboard")} className={`${activeTab === "dashboard" ? "font-semibold text-blue-700" : "text-gray-700"}`}><Home className="h-5 w-5 mr-2" /> Dashboard</Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("alumni")} className={`${activeTab === "alumni" ? "font-semibold text-blue-700" : "text-gray-700"}`}><Users className="h-5 w-5 mr-2" /> Alumni</Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("mentorship")} className={`${activeTab === "mentorship" ? "font-semibold text-blue-700" : "text-gray-700"}`}><Award className="h-5 w-5 mr-2" /> Mentorship</Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("events")} className={`${activeTab === "events" ? "font-semibold text-blue-700" : "text-gray-700"}`}><Calendar className="h-5 w-5 mr-2" /> Events</Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("resources")} className={`${activeTab === "resources" ? "font-semibold text-blue-700" : "text-gray-700"}`}><BookOpen className="h-5 w-5 mr-2" /> Resources</Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("community")} className={`${activeTab === "community" ? "font-semibold text-blue-700" : "text-gray-700"}`}><MessageCircle className="h-5 w-5 mr-2" /> Community</Button>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="relative" onClick={() => { alert(`You have ${notifications.length} new messages.`); clearNotifications(); }}>
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (<span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>)}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowChatbot(!showChatbot)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Bot className="h-4 w-4" /></Button>
                <ProfileMenu user={user} setActiveTab={setActiveTab} logout={logout} />
            </div>
        </div>
      </nav>
      {showChatbot && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
                <div className="flex items-center space-x-2"><Bot className="h-5 w-5 text-white" /><span className="text-white font-medium">AI Assistant</span></div>
                <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)} className="text-white hover:bg-white/20 h-6 w-6 p-0"><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 h-64 overflow-y-auto"><div className="space-y-3"><div className="bg-gray-100 rounded-lg p-3"><p className="text-sm text-gray-700">Hi {user?.fullName?.split(" ")[0]}! I'm here to help.</p></div></div></div>
            <div className="p-4 border-t"><div className="flex space-x-2"><Input placeholder="Ask me anything..." className="text-sm" /><Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600"><ArrowRight className="h-4 w-4" /></Button></div></div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
}