import { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  Briefcase,
  Edit3,
  Save,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";
import { useToast } from "../../components/ui/use-toast";
export default function AlumniProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    Bio: "",
    skills: "",
    mentorshipAvailability: true,
    currentJob: "",
    educationHistory: [],
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/alumni/me");
      setProfile(res.data);
    } catch (err) {
      if (err?.response?.status === 404) setProfile(null);
      else setError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setForm({
        Bio: profile.Bio || "",
        skills: (profile.skills || []).join(", "),
        mentorshipAvailability: !!profile.mentorshipAvailability,
        currentJob: profile.currentJob || "",
        educationHistory: profile.educationHistory || [],
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const payload = {
        Bio: form.Bio,
        currentJob: form.currentJob,
        mentorshipAvailability: !!form.mentorshipAvailability,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        educationHistory: form.educationHistory.map((edu) => ({
          degree: edu.degree || "",
          institution: edu.institution || "",
          yearOfGraduation: edu.yearOfGraduation ? Number(edu.yearOfGraduation) : null,
        })),
      };
      await api.put("/alumni/me", payload);
      await fetchProfile();
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your alumni profile has been updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err?.response?.data?.message || "Failed to update profile." });
      
    }
  };

  const createProfile = async () => {
    try {
      await api.post("/alumni", {});
      await fetchProfile();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err?.response?.data?.message || "Failed to create profile." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {loading && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">Loading your profile...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

        {!loading && !profile && (
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm text-center p-12">
                <CardTitle className="text-2xl mb-4">No Profile Found</CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                    You haven't created your alumni profile yet. Click the button below to get started.
                </CardDescription>
                <Button
                    onClick={createProfile}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    + Create Profile
                </Button>
            </Card>
        )}

      {/* VIEW MODE */}
      {!isEditing && profile && (
        <div className="space-y-8">
          {/* Header */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col md:flex-row items-center md:space-x-4 text-center md:text-left">
                <Avatar className="ring-2 ring-blue-100 h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {user?.fullName
                      ? (() => {
                          const parts = user.fullName.trim().split(/\s+/);
                          const first = parts[0]?.charAt(0) || "";
                          const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : "";
                          return first + last;
                        })()
                      : "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-semibold">{user?.fullName}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">{user?.email}</CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="mt-4 md:mt-0 border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardHeader>
          </Card>

          {/* About / Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {profile.Bio || "No bio added yet."}
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(profile.skills || []).length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </CardContent>
            </Card>

            {/* Current Job */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                  Current Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.currentJob || "Not specified."}</p>
              </CardContent>
            </Card>

            {/* Mentorship */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-6 w-6 text-purple-600" />
                  Mentorship
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {profile.mentorshipAvailability ? "Open for mentorship" : "Not available"}
                </p>
              </CardContent>
            </Card>

            {/* Education History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-orange-600" />
                  Education History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(profile.educationHistory || []).length > 0 ? (
                  profile.educationHistory.map((edu, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl text-sm">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-gray-500">{edu.yearOfGraduation}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No education history added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* EDIT MODE */}
      {isEditing && profile && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Edit Alumni Profile</CardTitle>
            <CardDescription className="text-lg">Update your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Bio */}
            <div className="space-y-3">
              <label className="text-lg font-medium">Bio</label>
              <Textarea
                rows={4}
                value={form.Bio}
                onChange={(e) => setForm((f) => ({ ...f, Bio: e.target.value }))}
                placeholder="Write something about yourself..."
                className="resize-none text-base"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-medium">Skills</label>
                <Input
                  value={form.skills}
                  onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                  placeholder="React, Python..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-medium">CurrentJob</label>
                <Input
                  value={form.currentJob}
                  onChange={(e) => setForm((f) => ({ ...f, currentJob: e.target.value }))}
                  placeholder="React, Python..."
                />
              </div>
              

              <div className="space-y-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.mentorshipAvailability}
                  onChange={(e) => setForm((f) => ({ ...f, mentorshipAvailability: e.target.checked }))}
                  className="h-5 w-5"
                />
                <label className="text-lg font-medium">Open for Mentorship</label>
              </div>
            </div>

            {/* Education History */}
            <div>
              <label className="text-lg font-medium">Education History</label>
              {form.educationHistory.map((edu, idx) => (
                <div key={idx} className="border rounded p-3 my-2 space-y-2 relative">
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...form.educationHistory];
                      updated[idx].degree = e.target.value;
                      setForm((f) => ({ ...f, educationHistory: updated }));
                    }}
                  />
                  <Input
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...form.educationHistory];
                      updated[idx].institution = e.target.value;
                      setForm((f) => ({ ...f, educationHistory: updated }));
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Year of Graduation"
                    value={edu.yearOfGraduation || ""}
                    onChange={(e) => {
                      const updated = [...form.educationHistory];
                      updated[idx].yearOfGraduation = Number(e.target.value);
                      setForm((f) => ({ ...f, educationHistory: updated }));
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      const updated = form.educationHistory.filter((_, i) => i !== idx);
                      setForm((f) => ({ ...f, educationHistory: updated }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                className="mt-2"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    educationHistory: [
                      ...f.educationHistory,
                      { degree: "", institution: "", yearOfGraduation: "" },
                    ],
                  }))
                }
              >
                + Add Education
              </Button>
            </div>

            {/* Save / Cancel */}
            <div className="flex justify-center space-x-4 pt-6 border-t">
              <Button variant="outline" size="lg" onClick={() => setIsEditing(false)}>
                <X className="h-5 w-5 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
