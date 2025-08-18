import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/navbar";
import { useAuth } from "../../auth/AuthContext";

function useSelfProfile() {
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setLoading(true); setError("");
      const res = await api.get("/students");
      const mine = (res.data || []).find((d) =>
        (d.userId === user._id) || (d.userId?._id === user._id) || (d.userId === user.id)
      );
      setDoc(mine || null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load students");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) refresh(); }, [user]);
  return { doc, loading, error, refresh };
}

export default function StudentDashboard() {
  const { doc, loading, error, refresh } = useSelfProfile();
  const [form, setForm] = useState({ Bio: "", skills: "" });

  useEffect(() => {
    if (doc) setForm({ Bio: doc.Bio || "", skills: (doc.skills || []).join(", ") });
  }, [doc]);

  const createIfMissing = async () => {
    await api.post("/students", {}); // backend uses token user.id
    await refresh();
  };

  const save = async () => {
    if (!doc?._id) return;
    await api.put(`/students/${doc._id}`, {
      Bio: form.Bio,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
    });
    await refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow mt-8">
        <h2 className="text-xl font-semibold mb-4">Student Dashboard</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {!doc && (
          <div className="mb-4 p-3 bg-yellow-50 border rounded">
            <p className="mb-2">No student profile found. Create one?</p>
            <button onClick={createIfMissing} className="px-3 py-1.5 rounded bg-blue-600 text-white">Create Profile</button>
          </div>
        )}
        {doc && (
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Bio</label>
                <textarea className="w-full border rounded-lg p-2" rows={4} value={form.Bio} onChange={(e)=>setForm(f=>({...f, Bio:e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Skills (comma separated)</label>
                <input className="w-full border rounded-lg p-2" value={form.skills} onChange={(e)=>setForm(f=>({...f, skills:e.target.value}))} />
              </div>
            </div>
            <button onClick={save} className="px-4 py-2 rounded bg-emerald-600 text-white">Save</button>
          </div>
        )}
      </div>
    </div>
  );
}
