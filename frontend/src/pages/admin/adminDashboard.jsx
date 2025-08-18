import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/navbar";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true); setErr("");
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load users");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow mt-8">
        <h2 className="text-xl font-semibold mb-4">Admin · Manage Users</h2>
        {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
        {loading ? <p>Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t">
                    <td className="p-2">{u.fullName}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">
                      <button onClick={()=>deleteUser(u._id)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr><td className="p-3 text-sm text-gray-500" colSpan={4}>No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
