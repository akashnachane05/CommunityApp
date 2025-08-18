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
      const res = await api.get("/alumni");
      const mine = (res.data || []).find((d) =>
        (d.userId === user._id) || (d.userId?._id === user._id) || (d.userId === user.id)
      );
      setDoc(mine || null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load alumni");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) refresh(); }, [user]);
  return { doc, loading, error, refresh };
}

export default function AlumniDashboard() {
  const { doc, loading, error, refresh } = useSelfProfile();
  const [form, setForm] = useState({ Bio: "", skills: "", mentorshipAvailability: true, currentJob: "" });

  useEffect(() => {
    if (doc) setForm({
      Bio: doc.Bio || "",
      skills: (doc.skills || []).join(", "),
      mentorshipAvailability: !!doc.mentorshipAvailability,
      currentJob: doc.currentJob || "",
    });
  }, [doc]);

  const createIfMissing = async () => {
    await api.post("/alumni", {});
    await refresh();
  };

  const save = async () => {
    if (!doc?._id) return;
    await api.put(`/alumni/${doc._id}`, {
      Bio: form.Bio,
      currentJob: form.currentJob,
      mentorshipAvailability: !!form.mentorshipAvailability,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
    });
    await refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow mt-8">
        <h2 className="text-xl font-semibold mb-4">Alumni Dashboard</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {!doc && (
          <div className="mb-4 p-3 bg-yellow-50 border rounded">
            <p className="mb-2">No alumni profile found. Create one?</p>
            <button onClick={createIfMissing} className="px-3 py-1.5 rounded bg-indigo-600 text-white">Create Profile</button>
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
                <label className="text-sm">Current Job</label>
                <input className="w-full border rounded-lg p-2" value={form.currentJob} onChange={(e)=>setForm(f=>({...f, currentJob:e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Skills (comma separated)</label>
                <input className="w-full border rounded-lg p-2" value={form.skills} onChange={(e)=>setForm(f=>({...f, skills:e.target.value}))} />
              </div>
              <div className="flex items-center gap-2">
                <input id="ment" type="checkbox" className="h-4 w-4" checked={form.mentorshipAvailability} onChange={(e)=>setForm(f=>({...f, mentorshipAvailability:e.target.checked}))} />
                <label htmlFor="ment">Open for Mentorship</label>
              </div>
            </div>
            <button onClick={save} className="px-4 py-2 rounded bg-emerald-600 text-white">Save</button>
          </div>
        )}
      </div>
    </div>
  );
}
