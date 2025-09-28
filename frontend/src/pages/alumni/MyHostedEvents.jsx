
import { useEffect, useState } from "react";
import { User, Users, Calendar, BookOpen, MessageCircle, Bot, X, ArrowRight, Home, Bell, MessageSquare, PlusCircle, Link as LinkIcon, MapPin, Handshake } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import { Badge } from "../../components/ui/badge";

import api from "../../api/axios";

import { AlertCircle } from "lucide-react"; // Import an icon for the reason
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
                                    <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                                    <p className="text-sm text-gray-500 mt-1 italic">Type: {event.type} | Mode: {event.mode}</p>
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
                                {event.status === 'Approved' && event.mode === 'Offline' && (
                                    <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                                        <p className="text-sm text-gray-500 italic">Location: {event.location}</p>
                                    </a>
                                )}
                                {/* ✅ THE FIX: Display the rejection reason if it exists */}
                                {event.status === 'Rejected' && event.rejectionReason && (
                                    <div className="mt-3 p-3 bg-red-50/50 border-l-4 border-red-400 text-red-800 text-sm">
                                        <p className="font-semibold flex items-center"><AlertCircle className="h-4 w-4 mr-2"/>Admin's Reason:</p>
                                        <p className="pl-6 italic">"{event.rejectionReason}"</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default MyHostedEvents;