import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, GraduationCap, Briefcase } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userTypeParam = searchParams.get("type");

  const [formData, setFormData] = useState({
    FullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: userTypeParam || "",
    studentId: "",
    currentYear: "",
    branch: "",
    graduationYear: "",
    currentCompany: "",
    currentPosition: "",
    industry: "",
    experience: "",
    bio: "",
    skills: "",
    interests: "",
    agreeToTerms: false,
    careerGoal: "",
    industryInterestOrField: "",
  });

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep1 = () => {
    if (!formData.FullName || !formData.email || !formData.password || !formData.userType) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions.");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsLoading(true);

    try {
      const registerResponse = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FullName: formData.firstName,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        setError(errorData.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      const { user, token } = await registerResponse.json();
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      const profilePayload = {
        userId: user._id,
        userType: formData.userType,
        educationHistory:
          formData.userType === "student"
            ? [
                {
                  degree: "B.Tech",
                  institution: "VIIT",
                  yearOfEnrollment: Number(formData.currentYear),
                },
              ]
            : [
                {
                  degree: "B.Tech",
                  institution: "VIIT",
                  yearOfGraduation: Number(formData.graduationYear),
                },
              ],
        branch: formData.branch,
        currentCompany: formData.currentCompany,
        currentPosition: formData.currentPosition,
        industry: formData.industry,
        experience: Number(formData.experience),
        bio: formData.bio,
        skills: formData.skills.split(",").map((s) => s.trim()),
        interests: formData.interests.split(",").map((i) => i.trim()),
        careerGoal: formData.careerGoal,
        industryInterestOrField: formData.industryInterestOrField.split(",").map((f) => f.trim()),
        mentorshipAvailability: formData.userType === "alumni" ? true : undefined,
        verificationStatus: formData.userType === "alumni" ? false : undefined,
        studentId: formData.studentId,
      };

      const profileResponse = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profilePayload),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        setError(errorData.message || "Profile creation failed.");
        setIsLoading(false);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of your JSX remains unchanged)



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Join VIITAA</CardTitle>
            <CardDescription className="text-gray-600">
              Create your account to connect with the VIIT community
            </CardDescription>
            <div className="flex items-center justify-center mt-6 space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                  1
                </div>
                <span className="ml-2 text-sm">Basic Info</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              <div className={`flex items-center ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                  2
                </div>
                <span className="ml-2 text-sm">Profile Details</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>I am a:</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.userType === "student"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleSelectChange("userType", "student")}
                      >
                        <GraduationCap className="h-8 w-8 text-blue-600 mb-2" />
                        <h3 className="font-semibold">Student</h3>
                        <p className="text-sm text-gray-600">Current VIIT student</p>
                      </div>
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.userType === "alumni"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleSelectChange("userType", "alumni")}
                      >
                        <Briefcase className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold">Alumni</h3>
                        <p className="text-sm text-gray-600">VIIT graduate</p>
                      </div>
                    </div>
                  </div>

                    <div className="space-y-2">
                      <Label htmlFor="FullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="FullName"
                          name="FullName"
                          placeholder="Enter Full name"
                          value={formData.FullName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                 

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  {formData.userType === "student" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentYear">Current Year</Label>
                          <Input
                            id="currentYear"
                            name="currentYear"
                            placeholder="Enter your current year"
                            value={formData.currentYear}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2 mb-6">
                          <Label htmlFor="branch"> Branch</Label>
                          <Input
                            id="branch"
                            name="branch"
                            placeholder="Enter your branch"
                            value={formData.branch}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="careerGoal">Career Goal</Label>
                            <Input
                            id="careerGoal"
                            name="careerGoal"
                            placeholder="e.g., Become a Data Scientist"
                            value={formData.careerGoal}
                            onChange={handleInputChange}
                          />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industryInterestOrField">Industry Interest (comma-separated)</Label>
                            <Input
                              id="industryInterestOrField"
                              name="industryInterestOrField"
                              placeholder="e.g., AI, Web Development"
                              value={formData.industryInterestOrField}
                              onChange={handleInputChange}
                            />
                      </div>

                    </>
                  )}

                  {formData.userType === "alumni" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Graduation Year</Label>
                          <Input
                            id="graduationYear"
                            name="graduationYear"
                            placeholder="e.g., 2020"
                            value={formData.graduationYear}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2 mb-6">
                          <Label htmlFor="branch">Branch</Label>
                          <Input
                            id="branch"
                            name="branch"
                            placeholder="Enter your branch"
                            value={formData.branch}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 mb-6">
                          <Label htmlFor="industry">Industry</Label>
                          <Input
                            id="industry"
                            name="industry"
                            placeholder="Enter your industry"
                            value={formData.industry}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Input
                            id="experience"
                            name="experience"
                            placeholder="e.g., 3"
                            value={formData.experience}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      name="skills"
                      placeholder="e.g., JavaScript, React, Python"
                      value={formData.skills}
                      onChange={handleInputChange}
                    />
                  </div>

               

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked }))}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the{" "}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
