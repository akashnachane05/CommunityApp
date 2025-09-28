

import { useEffect, useState } from "react";
import { User, Users, Calendar, BookOpen, MessageCircle, Bot, X, ArrowRight, Home, Bell, MessageSquare, PlusCircle, Link as LinkIcon, MapPin, Handshake } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import api from "../../api/axios";

import {useToast} from "../../components/ui/use-toast";

const HostEventForm = ({ onEventProposed }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({ title: "", description: "", date: "", duration: "", type: "Webinar", mode: "Online", location: "", meetingLink: "" });
    const {toast}=useToast();
    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSelectChange = (value) => setForm({ ...form, type: value });
    const handleModeChange = (value) => setForm({ ...form, mode: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventData = { ...form, speaker: user.fullName, speakerRole: "Alumnus" };
            await api.post("/events/propose", eventData);
            toast({ title: "Proposal Submitted!", description: "Your event is now pending admin approval." });
            setForm({ title: "", description: "", date: "", duration: "", type: "Webinar", mode: "Online", location: "", meetingLink: "" });
            if (onEventProposed) onEventProposed();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to submit proposal." });
        }
    };
    
    return (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Propose a New Event</CardTitle>
                <CardDescription>Share your knowledge. Submit the details below for admin review.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input id="title" name="title" value={form.title} onChange={handleFormChange} required />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="description">Event Description</Label>
                            <Textarea id="description" name="description" value={form.description} onChange={handleFormChange} required />
                        </div>
                        <div className="md:col-span-2">
                            <Label>Event Mode</Label>
                            <RadioGroup defaultValue="Online" onValueChange={handleModeChange} className="flex items-center space-x-4 pt-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Online" id="online" /><Label htmlFor="online">Online</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Offline" id="offline" /><Label htmlFor="offline">Offline</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="md:col-span-2">
                            {form.mode === 'Online' ? (
                                <div>
                                    <Label htmlFor="meetingLink">Meeting Link (Google Meet, Zoom, etc.)</Label>
                                    <Input id="meetingLink" name="meetingLink" value={form.meetingLink} onChange={handleFormChange} placeholder="https://meet.google.com/..." required />
                                </div>
                            ) : (
                                <div>
                                    <Label htmlFor="location">Location (Venue Address)</Label>
                                    <Input id="location" name="location" value={form.location} onChange={handleFormChange} placeholder="e.g., VIT Pune Auditorium" required />
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="date">Proposed Date & Time</Label>
                            <Input id="date" name="date" type="datetime-local" value={form.date} onChange={handleFormChange} required />
                        </div>
                        <div>
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" name="duration" value={form.duration} onChange={handleFormChange} placeholder="e.g., 90 minutes" />
                        </div>
                        <div className="md:col-span-2">
                            <Label>Type</Label>
                            <Select onValueChange={handleSelectChange} defaultValue="Webinar">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Webinar">Webinar</SelectItem>
                                    <SelectItem value="Workshop">Workshop</SelectItem>
                                    <SelectItem value="Meetup">Meetup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-6">Submit for Approval</Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default HostEventForm;