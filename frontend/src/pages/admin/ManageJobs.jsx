
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

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchJobs = async () => {
        try {
            const res = await api.get("/jobs/all");
            setJobs(res.data);
        } catch (err) { console.error("Failed to load jobs", err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchJobs(); }, []);

    const deleteJob = async (jobId) => {
        if (!window.confirm("Permanently delete this job posting?")) return;
        try {
            await api.delete(`/jobs/${jobId}`);
            toast({ title: "Job Deleted" });
            fetchJobs();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete job." });
        }
    };

    if (loading) return <p>Loading jobs...</p>;

    return (
        <Card>
            <CardHeader><CardTitle>Manage Job Postings</CardTitle></CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {jobs.map(job => (
                        <li key={job._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{job.title} @ {job.company}</p>
                                <p className="text-sm text-gray-500">Posted by: {job.postedBy?.fullName}</p>
                            </div>
                            <Button size="sm" variant="destructive" onClick={() => deleteJob(job._id)}><Trash2 className="h-4 w-4"/></Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
export default ManageJobs;