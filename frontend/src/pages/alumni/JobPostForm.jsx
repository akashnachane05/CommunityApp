
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import api from "../../api/axios";

import {useToast } from "../../components/ui/use-toast";


const JobPostForm = ({ onJobPosted }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", company: "", location: "", type: "Full-Time", applyLink: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // The backend automatically knows who the user is from the token,
      // so we don't need to send the user ID.
      await api.post("/jobs/create", form);
      toast({ title: "Job Posted!", description: "Your job is now visible to students." });
      setForm({ title: "", description: "", company: "", location: "", type: "Full-Time", applyLink: "" });
      if (onJobPosted) onJobPosted();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to post job." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
        <CardDescription>Share job or internship opportunities with students.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label htmlFor="title">Job Title</Label><Input id="title" name="title" value={form.title} onChange={handleChange} required /></div>
            <div><Label htmlFor="company">Company</Label><Input id="company" name="company" value={form.company} onChange={handleChange} required /></div>
            <div><Label htmlFor="location">Location</Label><Input id="location" name="location" value={form.location} onChange={handleChange} required /></div>
            <div><Label htmlFor="type">Job Type</Label><Select onValueChange={(val) => setForm({ ...form, type: val })} defaultValue="Full-Time"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full-Time">Full-Time</SelectItem><SelectItem value="Part-Time">Part-Time</SelectItem><SelectItem value="Internship">Internship</SelectItem></SelectContent></Select></div>
            <div className="md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={form.description} onChange={handleChange} required /></div>
            <div className="md:col-span-2"><Label htmlFor="applyLink">Application Link</Label><Input id="applyLink" name="applyLink" value={form.applyLink} onChange={handleChange} placeholder="https://careers.company.com/job123" required /></div>
          </div>
          <Button type="submit" className="w-full mt-6" disabled={loading}>{loading ? "Posting..." : "Post Job"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};
export default JobPostForm;