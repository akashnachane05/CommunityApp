import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Calendar, Clock, Users, CheckCircle, MapPin, Link as LinkIcon } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";

// --- Reusable Event Card Component (Upgraded) ---
const EventCard = ({ event, onRegister, isPast = false }) => {
    const { user } = useAuth();
    const isRegistered = event.attendees?.includes(user?._id);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    return (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
                <div className="md:flex">
                    <div className="md:w-1/3 bg-gray-100 p-6 flex flex-col justify-center items-center text-center">
                        <Avatar className="h-20 w-20 mb-3 border-4 border-white shadow-md">
                            <AvatarFallback className="bg-blue-500 text-white text-xl">{event.speaker?.substring(0, 2).toUpperCase() || 'EV'}</AvatarFallback>
                        </Avatar>
                        <h4 className="font-semibold">{event.speaker || 'Event Speaker'}</h4>
                        <p className="text-xs text-gray-500">{event.speakerRole || 'Presenter'}</p>
                    </div>
                    <div className="p-6 md:w-2/3">
                        <Badge className="mb-2">{event.type}</Badge>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                        
                        {/* ✅ NEW: Display for Online/Offline Mode */}
                        <div className="border-t pt-4 space-y-3">
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-2 text-blue-500"/> {formatDate(event.date)}
                            </div>
                            {event.mode === 'Offline' ? (
                                <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 mr-2 text-blue-500"/> {event.location}
                                </div>
                            ) : (
                                <div className="flex items-center text-sm text-gray-500">
                                    <LinkIcon className="h-4 w-4 mr-2 text-blue-500"/> Online Event
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50/50 flex flex-col items-center justify-center space-y-2 md:w-1/4">
                        {isPast ? (
                             <Button disabled className="w-full bg-gray-400"><CheckCircle className="h-4 w-4 mr-2"/> Concluded</Button>
                        ) : isRegistered ? (
                            <>
                                <Button disabled className="w-full bg-green-500"><CheckCircle className="h-4 w-4 mr-2"/> Registered</Button>
                                {event.mode === 'Online' && (
                                    <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="w-full">
                                        <Button className="w-full">Join Online</Button>
                                    </a>
                                )}
                            </>
                        ) : (
                            <Button onClick={() => onRegister(event._id)} className="w-full">Register Now</Button>
                        )}
                        <p className="text-xs text-gray-500">{event.attendees?.length || 0} registered</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Main Student Events Page ---
export default function StudentEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (err) {
      setError("Failed to load events.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      setEvents(events.map(e => e._id === eventId ? { ...e, attendees: [...e.attendees, user._id] } : e));
      await api.put(`/events/register/${eventId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
      setEvents(events.map(e => e._id === eventId ? { ...e, attendees: e.attendees.filter(id => id !== user._id) } : e));
    }
  };

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastEvents = events.filter(event => new Date(event.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Events & Webinars</h1>
        <p className="text-gray-600 mt-2">Discover opportunities to learn, connect, and grow.</p>
      </header>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-2 md:w-1/3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {loading && <p>Loading events...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && upcomingEvents.length === 0 && (
             <div className="text-center py-12"><Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">No Upcoming Events</h3><p className="text-gray-600">Check back soon for new webinars!</p></div>
          )}
          {upcomingEvents.map((event) => (
            <EventCard key={event._id} event={event} onRegister={handleRegister} />
          ))}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-6">
           {loading && <p>Loading events...</p>}
           {error && <p className="text-red-500">{error}</p>}
           {!loading && pastEvents.length === 0 && (
             <div className="text-center py-12"><h3 className="text-lg font-medium">No Past Events</h3><p className="text-gray-600">Your event history will appear here.</p></div>
           )}
           {pastEvents.map((event) => (
            <EventCard key={event._id} event={event} isPast={true} />
           ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}