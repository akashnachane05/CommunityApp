// src/pages/student/StudentJobs.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/all"); // ✅ Students endpoint
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs available right now.</p>
      ) : (
        jobs.map((job, index) => (
          <Card key={index} className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>{job.company} — {job.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">{job.description}</p>
              <p className="text-sm text-gray-500 mb-3">Posted by: {job.postedByName}</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                  Apply Now
                </a>
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
