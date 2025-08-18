import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/navbar";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow mt-8">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user.fullName}</h2>
        <p className="text-sm mb-4">Your role is <b>{user.role}</b>. Choose a dashboard:</p>
        <div className="flex gap-3">
          <Link to="/student" className="px-4 py-2 rounded bg-blue-600 text-white">Student</Link>
          <Link to="/alumni" className="px-4 py-2 rounded bg-indigo-600 text-white">Alumni</Link>
          <Link to="/admin" className="px-4 py-2 rounded bg-gray-900 text-white">Admin</Link>
        </div>
      </div>
    </div>
  );
}
