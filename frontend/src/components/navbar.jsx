import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
      <Link to="/dashboard" className="font-semibold">Alumni–Student Platform</Link>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm">{user.fullName} · {user.role}</span>}
        {user ? (
          <button onClick={logout} className="px-3 py-1.5 rounded bg-gray-900 text-white">Logout</button>
        ) : (
          <Link to="/login" className="px-3 py-1.5 rounded bg-gray-900 text-white">Login</Link>
        )}
      </div>
    </div>
  );
}
