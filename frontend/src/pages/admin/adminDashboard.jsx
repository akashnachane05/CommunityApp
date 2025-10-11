import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Users, Calendar, MessageSquare, Trash2, Flag, PlusCircle, Check, X, Clock,Briefcase,Bot,ArrowRight,FileText } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import ManageEvents from "./ManageEvents";
import ManageUsers from "./ManageUsers";
import ManageForum from "./ManageForum";
import ManageJobs from "./ManageJobs";
import AdminActivity from "./AdminActivity";
// --- Dashboard View Component ---
const DashboardView = () => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/stats/admin-dashboard");
                setStats(res.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    // ✅ ADDED: Color properties to match other dashboards
    const statCards = [
        { label: "Total Users", value: stats.totalUsers, icon: <Users className="h-5 w-5"/>, color: "bg-blue-500" },
        { label: "Total Events", value: stats.totalEvents, icon: <Calendar className="h-5 w-5"/>, color: "bg-purple-500" },
        { label: "Pending Events", value: stats.pendingEvents, icon: <Clock className="h-5 w-5"/>, color: "bg-orange-500" },
        { label: "Total Jobs Posted", value: stats.totalJobs, icon: <Briefcase className="h-5 w-5"/>, color: "bg-green-500" },
    ];

    if (loading) return <p>Loading statistics...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(stat => (
                // ✅ UPDATED: New Card structure for consistent styling
                <Card key={stat.label} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color} text-white`}>{stat.icon}</div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value !== undefined ? stat.value : '...'}</p>
                            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default function AdminDashboard() {
  const { user,logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false); // ✅ State for chatbot visibility
 
 

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardView />;
      case "users": return <ManageUsers />;
      case "events": return <ManageEvents />;
      case "forum": return <ManageForum />;
      case "jobs": return <ManageJobs />;
      case "activity": return <AdminActivity />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />
      <div className="flex-1 flex flex-col">
        {/* ✅ Pass the toggle function to the Topbar */}
        <AdminTopbar onToggleChatbot={() => setShowChatbot(!showChatbot)} />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* ✅ Chatbot Popup UI */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl border z-50">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
            <div className="flex items-center space-x-2"><Bot className="h-5 w-5 text-white" /><span className="text-white font-medium">AI Assistant</span></div>
            <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)} className="text-white hover:bg-white/20 h-6 w-6 p-0"><X className="h-4 w-4" /></Button>
          </div>
          <div className="p-4 h-64 overflow-y-auto"><div className="space-y-3"><div className="bg-gray-100 rounded-lg p-3"><p className="text-sm text-gray-700">Hi {user?.fullName?.split(" ")[0]}! I'm here to help you manage the platform.</p></div></div></div>
          <div className="p-4 border-t"><div className="flex space-x-2"><Input placeholder="Ask me anything..." className="text-sm" /><Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600"><ArrowRight className="h-4 w-4" /></Button></div></div>
        </div>
      )}

    </div>
  );
}