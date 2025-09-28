
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import api from "../../api/axios";

import {  useToast } from "../../components/ui/use-toast";

import { Trash2 } from "lucide-react";

const MyJobPosts = ({ keyProp, onJobDeleted }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/jobs/my-jobs");
        setJobs(res.data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [keyProp]);

  const handleDelete = async (jobId) => {
      if (!window.confirm("Are you sure you want to delete this job posting?")) return;
      try {
          await api.delete(`/jobs/${jobId}`);
          toast({ title: "Job Deleted", description: "The job posting has been removed." });
          if (onJobDeleted) onJobDeleted();
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not delete the job." });
      }
  };

  if (loading) return <p>Loading jobs...</p>;

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader><CardTitle>My Job Posts</CardTitle></CardHeader>
      <CardContent>
        {jobs.length === 0 ? <p className="text-gray-500">You have not posted any jobs yet.</p> : (
          <ul className="space-y-3">
            {jobs.map(job => (
              <li key={job._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{job.title} @ {job.company}</p>
                    <p className="text-sm text-gray-500">{job.location} · {job.type}</p>
                    <p className="text-sm text-gray-500">{job.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">View</Button></a>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(job._id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MyJobPosts;