import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Separator } from "../components/ui/separator"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Mail, Lock, User, Shield, ArrowLeft } from "lucide-react"
import api from "../api/axios"; 
import { useToast } from "../components/ui/use-toast"
export default function Register() {
  const { register, loading, error } = useAuth()
  const { toast } = useToast()
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Student",
    secretCode: "",
  })

  const navigate = useNavigate()

  const [showVerify, setShowVerify] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [code, setCode] = useState("");
  const [registerError, setRegisterError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setRegisterError(""); 
    const allowedDomains = ["@vit.edu", "@viit.ac.in"];
    if (
      form.role === "Student" &&
      !allowedDomains.some(domain => form.email.endsWith(domain))
    ) {
      setRegisterError("Only VIT/VIIT students can register with a valid email.");
      return;
    }
    const payload = { ...form };
    if (payload.role !== "Admin") delete payload.secretCode;
    const success = await register(payload);
    if (success && (form.role === "Student" || form.role === "Alumni")) {
      setShowVerify(true); // Show code entry form
    } else if (success) {
      navigate("/dashboard");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError("");
    try {
      await api.post("/users/verify-code", { email: form.email, code });
      toast({ title: "Email Verified", description: "You can now log in." });
      navigate("/login");
    } catch (err) {
      setVerifyError(
        err?.response?.data?.message || "Verification failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Create an Account</CardTitle>
            <CardDescription className="text-gray-600">
              Sign up for your VIITAA account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Registration form */}
            {showVerify ? (
              <form onSubmit={handleVerify}>
                <Label>Enter the 6-digit code sent to your email</Label>
                <Input value={code} onChange={e => setCode(e.target.value)} required />
                <Button type="submit">Verify Email</Button>
                {verifyError && <Alert>{verifyError}</Alert>}
              </form>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                 {/* ADD THIS BLOCK */}
                  {registerError && (
                    <Alert variant="destructive">
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full border rounded-lg p-2"
                  >
                    <option>Student</option>
                    <option>Alumni</option>
                    <option>Admin</option>
                  </select>
                </div>

                {/* Secret Code (only for Admins) */}
                {form.role === "Admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="secretCode">Admin Secret Code</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="secretCode"
                        name="secretCode"
                        placeholder="Enter secret code"
                        value={form.secretCode}
                        onChange={(e) => setForm((f) => ({ ...f, secretCode: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Login redirect */}
            <div className="text-center text-sm text-gray-600">
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
