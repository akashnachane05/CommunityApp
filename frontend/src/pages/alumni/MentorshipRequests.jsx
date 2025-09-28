
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import { Avatar, AvatarFallback } from "../../components/ui/avatar";

import api from "../../api/axios";

import { useToast } from "../../components/ui/use-toast";

const MentorshipRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
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
      toast({ title: `Request ${status}`, description: `You have ${status.toLowerCase()} the mentorship request.` });
      
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to respond to request." });
     
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
                    <AvatarFallback>{req.student?.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{req.student?.fullName}</p>
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
export default MentorshipRequests;