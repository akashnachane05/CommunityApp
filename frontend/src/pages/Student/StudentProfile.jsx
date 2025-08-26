import { useState, useEffect } from "react"
import {
  User,
  Heart,
  GraduationCap,
  Briefcase,
  Target,
  Edit3,
  Save,
  X,
  BookOpen,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { useAuth } from "../../auth/AuthContext"
import api from "../../api/axios"

export default function StudentProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState({
    Bio: "",
    skills: "",
    interests: "",
    educationHistory: [],   // ✅ now array of objects
    industryInterestOrField: "",
    careerGoal: "",
  })

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get("/students/me")
      setProfile(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile) {
      setForm({
        Bio: profile.Bio || "",
        skills: (profile.skills || []).join(", "),
        interests: (profile.interests || []).join(", "),
        educationHistory: profile.educationHistory || [], // ✅ keep as array
        industryInterestOrField: (profile.industryInterestOrField || []).join(", "),
        careerGoal: profile.careerGoal || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
        industryInterestOrField: form.industryInterestOrField.split(",").map((s) => s.trim()).filter(Boolean),
        educationHistory: form.educationHistory, // ✅ send structured array
      }
      await api.put("/students/me", payload)
      await fetchProfile()
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update profile")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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

      {/* VIEW MODE */}
      {!isEditing && profile && (
        <div className="space-y-8">
          {/* Header with Edit button */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col md:flex-row items-center md:space-x-4 text-center md:text-left">
                <Avatar className="ring-2 ring-blue-100 h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {user?.fullName
                      ? (() => {
                          const parts = user.fullName.trim().split(/\s+/)
                          const first = parts[0]?.charAt(0) || ""
                          const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : ""
                          return first + last
                        })()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{user?.fullName}</CardTitle>
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

          {/* About Me */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-base">
                {profile.Bio || "No bio added yet. Click 'Edit Profile' to add your bio."}
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
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(profile.skills || []).length > 0 ? (
                    profile.skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-purple-600" />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(profile.interests || []).length > 0 ? (
                    profile.interests.map((interest, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 text-sm">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No interests added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                  Education History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                </div>
              </CardContent>
            </Card>

            {/* Industry Interest */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                  Industry Interest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(profile.industryInterestOrField || []).length > 0 ? (
                    profile.industryInterestOrField.map((field, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800 px-3 py-1 text-sm">
                        {field}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No industry interests added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Career Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-6 w-6 text-red-600" />
                Career Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-base">
                {profile.careerGoal || "No career goal set yet. Click 'Edit Profile' to add your career aspirations."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EDIT MODE */}
      {isEditing && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Edit Profile</CardTitle>
            <CardDescription className="text-lg">Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Bio */}
            <div className="space-y-3">
              <label htmlFor="bio" className="text-lg font-medium">Bio</label>
              <Textarea
                id="bio"
                rows={5}
                placeholder="Tell us about yourself..."
                value={form.Bio}
                onChange={(e) => setForm((f) => ({ ...f, Bio: e.target.value }))}
                className="resize-none text-base"
              />
            </div>

            {/* Inputs in grid */}
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
                <label className="text-lg font-medium">Interests</label>
                <Input
                  value={form.interests}
                  onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
                  placeholder="AI, Design..."
                />
              </div>
            </div>

              {/* Education History - Editable */}
            <div>
              <label className="text-lg font-medium">Education History</label>
              {form.educationHistory.map((edu, idx) => (
                <div key={idx} className="border rounded p-3 my-2 space-y-2 relative">
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...form.educationHistory]
                      updated[idx].degree = e.target.value
                      setForm((f) => ({ ...f, educationHistory: updated }))
                    }}
                  />
                  <Input
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...form.educationHistory]
                      updated[idx].institution = e.target.value
                      setForm((f) => ({ ...f, educationHistory: updated }))
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Year of Graduation"
                    value={edu.yearOfGraduation || ""}
                    onChange={(e) => {
                      const updated = [...form.educationHistory]
                      updated[idx].yearOfGraduation = Number(e.target.value)
                      setForm((f) => ({ ...f, educationHistory: updated }))
                    }}
                  />

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      const updated = form.educationHistory.filter((_, i) => i !== idx)
                      setForm((f) => ({ ...f, educationHistory: updated }))
                    }}
                  >
                    Delete
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


            {/* Industry Interest */}
            <div className="space-y-3">
              <label className="text-lg font-medium">Industry Interest</label>
              <Input
                value={form.industryInterestOrField}
                onChange={(e) => setForm((f) => ({ ...f, industryInterestOrField: e.target.value }))}
                placeholder="Tech, Finance..."
              />
            </div>

            {/* Career Goal */}
            <div className="space-y-3">
              <label className="text-lg font-medium">Career Goal</label>
              <Textarea
                rows={4}
                value={form.careerGoal}
                onChange={(e) => setForm((f) => ({ ...f, careerGoal: e.target.value }))}
                placeholder="Describe your aspirations..."
              />
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
  )
}
