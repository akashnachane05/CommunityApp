import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Zap, TrendingUp, UserPlus, Send, Check, Search, Users } from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../components/ui/use-toast";
// --- AI Matches Component ---
const AiMatches = ({ requestedMentors, onConnect }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await api.get("/recommendations/matches");
                setMatches(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Could not fetch AI recommendations.");
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    if (loading) return <p>🧠 Analyzing your profile...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-4">
            {matches.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No matches found. Complete your profile for better recommendations!</p>
            ) : (
                matches.map(({ alumni, score }) => (
                    <AlumniCard key={alumni._id} alumni={alumni} score={score} requestedMentors={requestedMentors} onConnect={onConnect} />
                ))
            )}
        </div>
    );
};

// --- Alumni Directory Component ---
const AlumniDirectory = ({ requestedMentors, onConnect }) => {
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    

    const fetchDirectory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/alumni?search=${searchTerm}`);
            setDirectory(res.data);
        } catch (error) {
            console.error("Failed to fetch directory", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDirectory();
        }, 500); // Debounce search to avoid excessive API calls
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="Search by name, skill, or company..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {loading ? <p>Loading alumni...</p> : (
                 <div className="space-y-4">
                    {directory.map((alumni) => (
                        <AlumniCard key={alumni._id} alumni={alumni} requestedMentors={requestedMentors} onConnect={onConnect} />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Reusable Alumni Card ---
const AlumniCard = ({ alumni, score, requestedMentors, onConnect }) => {
    return (
        <div className="p-4 border rounded-lg bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 flex-grow">
                <Avatar className="h-12 w-12"><AvatarFallback className="bg-blue-100 text-blue-600">{alumni.userId.fullName.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div>
                    <p className="font-semibold text-gray-800">{alumni.userId.fullName}</p>
                    <p className="text-sm text-gray-600">{alumni.currentJob}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                {score && (
                    <div className="text-center">
                        <div className="flex items-center justify-center font-bold text-green-600"><TrendingUp className="h-4 w-4 mr-1"/> {score}</div>
                        <p className="text-xs text-gray-500">Match</p>
                    </div>
                )}
                <Button size="sm" onClick={() => onConnect(alumni)} disabled={requestedMentors.has(alumni.userId._id)}>
                    {requestedMentors.has(alumni.userId._id) ? (<><Check className="h-4 w-4 mr-2" /> Requested</>) : (<><UserPlus className="h-4 w-4 mr-2" /> Connect</>)}
                </Button>
            </div>
        </div>
    );
};


// --- Main Page Component ---
export default function StudentAlumni() {
    const [stats, setStats] = useState({ totalAlumni: 0, availableMentors: 0, studentConnections: 0 });
    const [goals, setGoals] = useState("");
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [requestedMentors, setRequestedMentors] = useState(new Set());
    const { toast } = useToast();
    const fetchData = async () => {
        try {
            const [statsRes, requestsRes] = await Promise.all([
                api.get("/stats/network"),
                api.get("/mentorships/my-requests")
            ]);
            setStats(statsRes.data);
            setRequestedMentors(new Set(requestsRes.data.map(req => req.mentor._id)));
        } catch (err) {
            console.error("Failed to fetch initial data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestMentorship = async () => {
        // ... (this function remains the same as before)
         if (!goals.trim()) {
              toast({ variant: "destructive", title: "Error", description: "Please state your goals for this mentorship." });
              return;
            }
            try {
              await api.post("/mentorships/request", {
                mentorId: selectedMentor.userId._id,
                studentGoals: goals,
              });
              toast({ title: "Success!", description: "Mentorship request sent." });
              setSelectedMentor(null);
              setGoals("");
              fetchData();
            } catch (err) {
              toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Failed to send request." });
              
            }
    };

    const handleConnectClick = (alumni) => {
        setSelectedMentor(alumni);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <header className="mb-8"><h1 className="text-4xl font-bold text-gray-800">Alumni Network</h1><p className="text-gray-600 mt-2">Discover, connect, and grow with our experienced alumni community.</p></header>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Tabs defaultValue="matches" className="w-full">
                        <TabsList>
                            <TabsTrigger value="matches"><Zap className="h-4 w-4 mr-2 text-yellow-500" /> AI Matches</TabsTrigger>
                            <TabsTrigger value="directory"><Search className="h-4 w-4 mr-2" /> Directory</TabsTrigger>
                        </TabsList>
                        <TabsContent value="matches" className="mt-4">
                             <AiMatches requestedMentors={requestedMentors} onConnect={handleConnectClick} />
                        </TabsContent>
                        <TabsContent value="directory" className="mt-4">
                            <AlumniDirectory requestedMentors={requestedMentors} onConnect={handleConnectClick} />
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-base">Network Stats</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Total Alumni</span><span className="font-semibold text-blue-600">{stats.totalAlumni}</span></div>
                            <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Your Connections</span><span className="font-semibold">{stats.studentConnections}</span></div>
                            <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Available Mentors</span><span className="font-semibold text-green-600">{stats.availableMentors}</span></div>
                        </CardContent>
                    </Card>
                    <Dialog open={!!selectedMentor} onOpenChange={(open) => !open && setSelectedMentor(null)}>
                        {selectedMentor && (
                            <DialogContent>
                                <DialogHeader><DialogTitle>Request Mentorship from {selectedMentor.userId.fullName}</DialogTitle></DialogHeader>
                                <div className="py-4 space-y-4">
                                    <p className="text-sm text-gray-600">Briefly describe what you hope to achieve from this mentorship.</p>
                                    <Textarea placeholder="E.g., I need help with my resume and interview preparation..." value={goals} onChange={(e) => setGoals(e.target.value)} />
                                    <Button onClick={handleRequestMentorship} className="w-full"><Send className="h-4 w-4 mr-2" />Send Request</Button>
                                </div>
                            </DialogContent>
                        )}
                    </Dialog>
                </div>
            </div>
        </div>
    );
}