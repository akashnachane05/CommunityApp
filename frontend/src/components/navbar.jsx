import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
       <div className="flex items-center space-x-2"><div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-lg">V</span></div><span className="text-xl font-bold text-gray-900">VITAA</span></div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm">{user.fullName}</span>}
        {user ? (
          <button onClick={logout} className="px-3 py-1.5 rounded bg-gray-900 text-white">Logout</button>
        ) : (
          <Link to="/login" className="px-3 py-1.5 rounded bg-gray-900 text-white">Login</Link>
        )}
      </div>
    </div>
  );
}
