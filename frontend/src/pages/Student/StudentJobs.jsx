// src/pages/student/StudentJobs.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Briefcase } from "lucide-react";

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/all");
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p>Loading job opportunities...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Job Board</h2>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Job Opportunities</h3>
            <p className="text-gray-600">Alumni have not posted any jobs yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job._id} className="shadow-md border border-gray-200 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>{job.company} — {job.location}</CardDescription>
                    </div>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-gray-700 mb-4 text-sm flex-1">{job.description}</p>
                  {/* ✅ THE FIX: Access the name from the populated 'postedBy' object */}
                  <p className="text-xs text-gray-500 mb-4">Posted by: {job.postedBy?.fullName || 'Alumnus'}</p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 mt-auto">
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                      Apply Now
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}