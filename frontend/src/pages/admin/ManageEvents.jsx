
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "../../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Users, Calendar, MessageSquare, Trash2, Flag, PlusCircle, Check, X, Clock,Briefcase,Bot,ArrowRight,FileText } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";

const ManageEvents = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null); // State for attendee list
    const [form, setForm] = useState({ title: "", description: "", speaker: "", speakerRole: "", date: "", duration: "", type: "Webinar", mode: "Online", location: "", meetingLink: "" });
      const viewAttendees = async (eventId) => {
        try {
            const res = await api.get(`/events/admins/${eventId}`);
            setSelectedEvent(res.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch event attendees." });
        }
    };
    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsRes, pendingRes] = await Promise.all([
                api.get("/events/all-admin"),
                api.get("/events/pending")
            ]);
            setEvents(eventsRes.data);
            setPendingEvents(pendingRes.data);
        } catch (error) {
            console.error("Failed to fetch events data", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load event data." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSelectChange = (value) => setForm({ ...form, type: value });
    const handleModeChange = (value) => setForm({ ...form, mode: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventData = { ...form, speaker: form.speaker || user.fullName, speakerRole: form.speakerRole || "Administrator" };
            await api.post("/events/admin-create", eventData);
            toast({ title: "Event Created" });
            setForm({ title: "", description: "", speaker: "", speakerRole: "", date: "", duration: "", type: "Webinar", mode: "Online", location: "", meetingLink: "" });
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create event." });
        }
    };

    const handleStatusUpdate = async (eventId, status) => {
        let rejectionReason = '';
        if (status === 'Rejected') {
            rejectionReason = prompt("Please provide a reason for rejecting this event:");
            if (rejectionReason === null || rejectionReason.trim() === "") {
                return toast({ title: "Action cancelled.", variant: "info" });
            }
        }

        try {
            await api.put(`/events/status/${eventId}`, { status, rejectionReason });
            toast({ title: `Event ${status}` });
            fetchData(); // Refresh the list
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not update event status." });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
            case 'Rejected': return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
            default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
        }
    };
    
    return (
        <>
        <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending"><Clock className="h-4 w-4 mr-2"/> Pending Approvals <Badge className="ml-2">{pendingEvents.length}</Badge></TabsTrigger>
                <TabsTrigger value="create"><PlusCircle className="h-4 w-4 mr-2"/> Create New</TabsTrigger>
                <TabsTrigger value="all"><Calendar className="h-4 w-4 mr-2"/> All Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="mt-4">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader><CardTitle>Create Admin Event</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Label htmlFor="admin-title">Title</Label>
                                    <Input id="admin-title" name="title" value={form.title} onChange={handleFormChange} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="admin-desc">Description</Label>
                                    <Textarea id="admin-desc" name="description" value={form.description} onChange={handleFormChange} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Event Mode</Label>
                                    <RadioGroup defaultValue="Online" onValueChange={handleModeChange} className="flex items-center space-x-4 pt-2">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Online" id="admin-online" /><Label htmlFor="admin-online">Online</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Offline" id="admin-offline" /><Label htmlFor="admin-offline">Offline</Label></div>
                                    </RadioGroup>
                                </div>
                                <div className="md:col-span-2">
                                    {form.mode === 'Online' ? (
                                        <div><Label htmlFor="admin-link">Meeting Link</Label><Input id="admin-link" name="meetingLink" value={form.meetingLink} onChange={handleFormChange} placeholder="https://meet.google.com/..." required /></div>
                                    ) : (
                                        <div><Label htmlFor="admin-loc">Location</Label><Input id="admin-loc" name="location" value={form.location} onChange={handleFormChange} placeholder="e.g., VIT Pune Auditorium" required /></div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="admin-speaker">Speaker</Label>
                                    <Input id="admin-speaker" name="speaker" value={form.speaker} onChange={handleFormChange} placeholder="Defaults to your name" />
                                </div>
                                <div>
                                    <Label htmlFor="admin-speakerRole">Speaker's Role</Label>
                                    <Input id="admin-speakerRole" name="speakerRole" value={form.speakerRole} onChange={handleFormChange} placeholder="Defaults to Administrator"/>
                                </div>
                                <div>
                                    <Label htmlFor="admin-date">Date & Time</Label>
                                    <Input id="admin-date" name="date" type="datetime-local" value={form.date} onChange={handleFormChange} required />
                                </div>
                                <div>
                                    <Label htmlFor="admin-duration">Duration</Label>
                                    <Input id="admin-duration" name="duration" value={form.duration} onChange={handleFormChange} placeholder="e.g., 90 minutes" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Type</Label>
                                    <Select onValueChange={handleSelectChange} defaultValue="Webinar"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Webinar">Webinar</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Meetup">Meetup</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-6">Create Event</Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
                 <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader><CardTitle>Pending Event Approvals</CardTitle></CardHeader>
                    <CardContent>
                        {loading ? <p>Loading...</p> : pendingEvents.length === 0 ? <p className="text-gray-500">No events are pending approval.</p> : (
                            <ul className="space-y-4">
                                {pendingEvents.map(event => (
                                   <li key={event._id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                                <p className="font-semibold text-lg">{event.title}</p>
                                <p className="text-sm text-gray-600">{event.description}</p>
                                <p className="text-sm"><span className="font-semibold">Speaker:</span> {event.speaker} ({event.speakerRole})</p>
                                <p className="text-sm"><span className="font-semibold">Date & Time:</span> {new Date(event.date).toLocaleString()}</p>
                                <p className="text-sm"><span className="font-semibold">Duration:</span> {event.duration || "N/A"}</p>
                                <p className="text-sm"><span className="font-semibold">Type:</span> {event.type}</p>
                                <p className="text-sm"><span className="font-semibold">Mode:</span> {event.mode}</p>
                                {event.mode === "Online" ? (
                                    <p className="text-sm"><span className="font-semibold">Meeting Link:</span> <a href={event.meetingLink} target="_blank" className="text-blue-600 underline">{event.meetingLink}</a></p>
                                ) : (
                                    <p className="text-sm"><span className="font-semibold">Location:</span> {event.location}</p>
                                )}
                                <p className="text-sm text-gray-500">Proposed by: {event.hostedBy?.fullName || 'N/A'}</p>

                                <div className="flex justify-end space-x-2 mt-2">
                                    <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(event._id, 'Rejected')}>
                                    <X className="h-4 w-4 mr-2"/> Reject
                                    </Button>
                                    <Button size="sm" onClick={() => handleStatusUpdate(event._id, 'Approved')}>
                                    <Check className="h-4 w-4 mr-2"/> Approve
                                    </Button>
                                </div>
                                </li>

                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader><CardTitle>All Platform Events</CardTitle></CardHeader>
                    <CardContent>
                         {loading ? <p>Loading events...</p> : (
                             <ul className="space-y-3">
                                 {events.map(event => (
                                     <li key={event._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                         <div>
                                             <p className="font-semibold">{event.title}</p>
                                             <p className="text-sm text-gray-500">Hosted by: {event.hostedBy?.fullName || 'Admin'}</p>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                                {getStatusBadge(event.status)}
                                                {/* ✅ NEW: Button to view attendees */}
                                                <Button size="sm" variant="outline" onClick={() => viewAttendees(event._id)}>
                                                    <Users className="h-4 w-4 mr-2" />
                                                    View Attendees ({event.attendees.length})
                                                </Button>
                                        </div>
                                     </li>
                                 ))}
                             </ul>
                         )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        {/* ✅ NEW: Dialog to display event attendees */}
        {/* ✅ Attendees Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Attendees for "{selectedEvent?.title}"</DialogTitle>
            <DialogDescription>Total Registered: {selectedEvent?.attendees.length || 0}</DialogDescription>
            </DialogHeader>

            <div className="py-4 max-h-[60vh] overflow-y-auto">
            {selectedEvent?.attendees.length > 0 ? (
                <ul className="space-y-2">
                {selectedEvent.attendees.map((attendee, index) => (
                    <li
                    key={`${attendee.studentId}-${index}`} // ✅ unique key
                    className="text-sm p-2 bg-gray-100 rounded"
                    >
                    <p className="font-medium">{attendee.fullName}</p>
                    <p className="text-xs text-gray-500">
                        {attendee.branch} | GR No: {attendee.grNo} | Email: {attendee.email || "N/A"}
                    </p>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No students have registered for this event yet.</p>
            )}
            </div>
        </DialogContent>
        </Dialog>

        </>
    );
};
export default ManageEvents;