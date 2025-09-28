
import { useEffect, useState } from "react";
import { User, Users, Calendar, BookOpen, MessageCircle, Bot, X, ArrowRight, Home, Bell, MessageSquare, PlusCircle, Link as LinkIcon, MapPin, Handshake } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import { Avatar, AvatarFallback } from "../../components/ui/avatar";

import api from "../../api/axios";

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
                    <AvatarFallback>{mentorship.student?.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{mentorship.student?.fullName}</p>
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

export default MyMentees;