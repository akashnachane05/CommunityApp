import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Search, UserPlus, Send, Check, MessageSquare } from "lucide-react";
import api from "../../api/axios";
import ChatWindow from "../../components/ChatWindow";
import { useToast } from "../../components/ui/use-toast";

export default function StudentMentorship() {
  const [mentors, setMentors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goals, setGoals] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [chatReceiver, setChatReceiver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast(); // 💡 Initialize toast hook

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mentorsRes, requestsRes] = await Promise.all([
        api.get("/alumni?mentorshipAvailable=true"),
        api.get("/mentorships/my-requests"),
      ]);
      setMentors(mentorsRes.data);
      setMyRequests(requestsRes.data);
    } catch (err) {
      setError("Failed to load mentorship data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Optimized: Memoize the Set so it only recalculates when requests change
  const requestedMentorIds = useMemo(() =>
    new Set(myRequests.map((req) => req.mentor?._id)),
    [myRequests]
  );

  const handleRequestMentorship = async () => {
    // ✅ Safety check for incomplete mentor data
    if (!selectedMentor?.userId?._id) {
      toast({ variant: "destructive", title: "Error", description: "Mentor data is incomplete." });
   
      return;
    }
    if (!goals.trim()) {
      toast({ variant: "destructive", title: "Goal required", description: "Please state your goals." });
   
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
      fetchData(); // Refresh data to show the new request status
    } catch (err) {
      toast({ variant: "destructive", title: "Request Failed", description: err.response?.data?.message });

    }
  };

  const getStatusBadge = (status) => {
    if (status === "Accepted") return <Badge className="bg-green-100 text-green-700">Accepted</Badge>;
    if (status === "Rejected") return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };
  
  // ✅ Derived state for filtering the list based on search term
  const filteredMentors = mentors.filter(mentor =>
    mentor.userId?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Mentorship</h1>
        <p className="text-gray-600 mt-2">Connect with experienced alumni to guide your career path.</p>
      </header>

      <Tabs defaultValue="find">
        <TabsList className="grid w-full grid-cols-2 md:w-1/3 mb-6">
          <TabsTrigger value="find">Find a Mentor</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="find">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search mentors by name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading && <p>Loading mentors...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && filteredMentors.map((mentor) => (
              <Card key={mentor._id} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-500 text-white text-xl">
                      {/* ✅ Safe Access */}
                      {mentor.userId?.fullName?.substring(0, 2).toUpperCase() || 'NA'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {/* ✅ Safe Access */}
                    <CardTitle>{mentor.userId?.fullName || 'Unnamed Mentor'}</CardTitle>
                    <p className="text-sm text-gray-600">{mentor.currentJob}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.skills.slice(0, 3).map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                  </div>
                  <Dialog onOpenChange={(open) => !open && setSelectedMentor(null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedMentor(mentor)} disabled={requestedMentorIds.has(mentor.userId?._id)}>
                        {/* ✅ Safe Access */}
                        {requestedMentorIds.has(mentor.userId?._id) ? (<><Check className="h-4 w-4 mr-2" /> Requested</>) : (<><UserPlus className="h-4 w-4 mr-2" /> Request</>)}
                      </Button>
                    </DialogTrigger>
                    {selectedMentor && (
                      <DialogContent>
                        <DialogHeader>
                          {/* ✅ Safe Access */}
                          <DialogTitle>Request Mentorship from {selectedMentor.userId?.fullName}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <p className="text-sm text-gray-600">Briefly describe what you hope to achieve.</p>
                          <Textarea placeholder="E.g., I want to improve my React skills..." value={goals} onChange={(e) => setGoals(e.target.value)} />
                          <Button onClick={handleRequestMentorship} className="w-full"><Send className="h-4 w-4 mr-2" />Send Request</Button>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader><CardTitle>My Sent Requests</CardTitle></CardHeader>
            <CardContent>
              {loading && <p>Loading requests...</p>}
              {!loading && myRequests.length === 0 && <p className="text-gray-500">You haven't sent any mentorship requests yet.</p>}
              <ul className="space-y-4">
                {myRequests.map((req) => (
                  <li key={req._id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {/* ✅ Safe Access */}
                          {req.mentor?.fullName?.substring(0, 2).toUpperCase() || 'NA'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {/* ✅ Safe Access */}
                        <p className="font-semibold">{req.mentor?.fullName || 'Mentor Not Available'}</p>
                        <p className="text-sm text-gray-500">Requested on: {new Date(req.requestedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(req.status)}
                      {req.status === "Accepted" && (
                        <Button size="sm" onClick={() => setChatReceiver(req.mentor)}>
                          <MessageSquare className="h-4 w-4 mr-2" /> Chat with Mentor
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {chatReceiver && <ChatWindow receiver={chatReceiver} onClose={() => setChatReceiver(null)} />}
    </div>
  );
}