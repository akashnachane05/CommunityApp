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
  Hash, 
  GitBranch
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
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { useAuth } from "../../auth/AuthContext"
import api from "../../api/axios"
import { useToast } from "../../components/ui/use-toast"
import Select from 'react-select'

const branchOptions = [
  "Computer Engineering", "IT", "Electronics", "Mechanical", "Civil", "Electrical"
];
const skillOptions = [
  { value: "React", label: "React" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "C++", label: "C++" },
  { value: "Machine Learning", label: "Machine Learning" },
  { value: "UI/UX", label: "UI/UX" },
  { value: "Node.js", label: "Node.js" },
  { value: "SQL", label: "SQL" }
];
const interestOptions = [
  { value: "AI", label: "AI" },
  { value: "Design", label: "Design" },
  { value: "Robotics", label: "Robotics" },
  { value: "Finance", label: "Finance" },
  { value: "Web Development", label: "Web Development" },
  { value: "Gaming", label: "Gaming" },
  { value: "Data Science", label: "Data Science" }
];
const degreeOptions = [
  "B.Tech", "B.E.", "M.Tech", "M.E.", "Diploma", "PhD",
  "High School", "Intermediate"
];
const institutionOptions = [
  "VIT", "VIIT"
];

export default function StudentProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    Bio: "",
    skills: "",
    interests: "",
    educationHistory: [],
    industryInterestOrField: "",
    careerGoal: "",
    branch: "", // ✅ ADDED
    grNo: "",   // ✅ ADDED
  })

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get("/students/me")
      setProfile(res.data)
      setError("")
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
        educationHistory: profile.educationHistory || [],
        industryInterestOrField: (profile.industryInterestOrField || []).join(", "),
        careerGoal: profile.careerGoal || "",
        branch: profile.branch || "", // ✅ ADDED
        grNo: profile.grNo || "",   // ✅ ADDED
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
        industryInterestOrField: form.industryInterestOrField.split(",").map((s) => s.trim()).filter(Boolean),
        educationHistory: form.educationHistory,
      }
      await api.put("/students/me", payload)
      await fetchProfile()
      setIsEditing(false)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.message || "Failed to update profile"
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">Loading your profile...</p>
        </CardContent>
      </Card>
  );

  if (error) return (
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* VIEW MODE */}
      {!isEditing && profile && (
        <div className="space-y-8">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between p-6">
              <div className="flex flex-col md:flex-row items-center md:space-x-4 text-center md:text-left">
                <Avatar className="h-16 w-16 mb-4 md:mb-0">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                    {user?.fullName?.match(/\b(\w)/g)?.join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">{user?.fullName}</CardTitle>
                  <CardDescription className="text-md text-gray-600">{user?.email}</CardDescription>
                  <div className="flex items-center justify-center md:justify-start space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">{profile.branch }</div>
                      <div className="flex items-center">{profile.grNo }</div>
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} size="sm" className="mt-4 md:mt-0">
                <Edit3 className="h-4 w-4 mr-2" />Edit Profile
              </Button>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3"><User className="h-6 w-6 text-blue-600" />About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-base">
                {profile.Bio || "No bio added yet. Click 'Edit Profile' to add your bio."}
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><BookOpen className="h-6 w-6 text-green-600" />Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(profile.skills || []).length > 0 ? (
                    profile.skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm">{skill}</Badge>
                    ))
                  ) : ( <p className="text-gray-500 text-sm">No skills added yet</p> )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><Heart className="h-6 w-6 text-purple-600" />Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(profile.interests || []).length > 0 ? (
                    profile.interests.map((interest, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 text-sm">{interest}</Badge>
                    ))
                  ) : ( <p className="text-gray-500 text-sm">No interests added yet</p> )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><GraduationCap className="h-6 w-6 text-orange-600" />Education History</CardTitle>
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
                  ) : ( <p className="text-gray-500 text-sm">No education history added yet</p> )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><Briefcase className="h-6 w-6 text-indigo-600" />Industry Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(profile.industryInterestOrField || []).length > 0 ? (
                    profile.industryInterestOrField.map((field, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800 px-3 py-1 text-sm">{field}</Badge>
                    ))
                  ) : ( <p className="text-gray-500 text-sm">No industry interests added yet</p> )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3"><Target className="h-6 w-6 text-red-600" />Career Goal</CardTitle>
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
          <CardHeader className="text-center p-6"><CardTitle className="text-2xl">Edit Your Profile</CardTitle></CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="font-medium">Branch</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={form.branch}
                      onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    >
                      <option value="">Select Branch</option>
                      {branchOptions.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="font-medium">GR No.</label>
                    <Input value={form.grNo} onChange={(e) => setForm({ ...form, grNo: e.target.value })} placeholder="e.g., 21210XXXX"/>
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="font-medium">Bio</label>
                <Textarea rows={4} placeholder="Tell us about yourself..." value={form.Bio} onChange={(e) => setForm({ ...form, Bio: e.target.value })}/>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-medium">Skills</label>
                <Select
                  isMulti
                  options={skillOptions}
                  value={skillOptions.filter(opt => form.skills.split(',').map(s => s.trim()).includes(opt.value))}
                  onChange={(selected) => setForm({ ...form, skills: selected.map(opt => opt.value).join(', ') })}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select skills..."
                />
              </div>
              <div className="space-y-2">
                <label className="font-medium">Interests</label>
                <Select
                  isMulti
                  options={interestOptions}
                  value={interestOptions.filter(opt => form.interests.split(',').map(s => s.trim()).includes(opt.value))}
                  onChange={(selected) => setForm({ ...form, interests: selected.map(opt => opt.value).join(', ') })}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select interests..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Education History</label>
              <div className="grid grid-cols-3 gap-4">
                {/* Degree Dropdown */}
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.educationHistory[0]?.degree || ""}
                  onChange={e => {
                    const updatedHistory = [...form.educationHistory];
                    if (!updatedHistory[0]) updatedHistory[0] = {};
                    updatedHistory[0].degree = e.target.value;
                    setForm({ ...form, educationHistory: updatedHistory });
                  }}
                >
                  <option value="">Select Degree</option>
                  {degreeOptions.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
                {/* Institution Text Input */}
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Institution"
                  value={form.educationHistory[0]?.institution || ""}
                  onChange={e => {
                    const updatedHistory = [...form.educationHistory];
                    if (!updatedHistory[0]) updatedHistory[0] = {};
                    updatedHistory[0].institution = e.target.value;
                    setForm({ ...form, educationHistory: updatedHistory });
                  }}
                />
                {/* Passing Year Text Input */}
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Passing Year"
                  value={form.educationHistory[0]?.passingYear || ""}
                  onChange={e => {
                    const updatedHistory = [...form.educationHistory];
                    if (!updatedHistory[0]) updatedHistory[0] = {};
                    updatedHistory[0].passingYear = e.target.value;
                    setForm({ ...form, educationHistory: updatedHistory });
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Industry Interest</label>
              <Input value={form.industryInterestOrField} onChange={(e) => setForm({ ...form, industryInterestOrField: e.target.value })} placeholder="Separate with commas: Tech, Finance..."/>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Career Goal</label>
              <Textarea rows={4} value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} placeholder="Describe your aspirations..."/>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button variant="outline" size="lg" onClick={() => setIsEditing(false)}><X className="h-5 w-5 mr-2" />Cancel</Button>
              <Button onClick={handleSave} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600"><Save className="h-5 w-5 mr-2" />Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}