

import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "../../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Users, Calendar, MessageSquare, Trash2, Flag, PlusCircle, Check, X, Clock,Briefcase,Bot,ArrowRight,FileText } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.filter(u => u.role !== 'Admin'));
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load users." });
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user and all their content? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast({ title: "User Deleted", description: "The user has been permanently removed." });
      fetchUsers();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
    }
  };

   const viewUserActivity = async (user) => {
        try {
            const res = await api.get(`/admins/activity/${user._id}`);
            setActivities(res.data);
            setSelectedUser(user);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load user activity." });
        }
    };

  return (
    <>
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Manage Platform Users</CardTitle>
        <CardDescription>View user details, moderation flags, and take administrative actions.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading users...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Flags</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{u.fullName}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3"><Badge variant={u.role === 'Alumni' ? 'default' : 'secondary'}>{u.role}</Badge></td>
                    <td className="p-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" disabled={!u.violations || u.violations.length === 0} className="flex items-center gap-2 px-2 h-8">
                            <Flag className={`h-4 w-4 ${u.violations?.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                            {u.violations?.length || 0}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Content Violations for {u.fullName}</DialogTitle></DialogHeader>
                          <div className="py-4 max-h-96 overflow-y-auto">
                            {u.violations?.length > 0 ? (
                              <ul className="space-y-2">
                                {u.violations.map((v, i) => (
                                  <li key={i} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                                    <p className="font-mono text-red-800">"{v.content}"</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(v.timestamp).toLocaleString()}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : <p>No violations recorded.</p>}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                   <td className="p-3 flex items-center space-x-2">
                                                {/* ✅ NEW: "View Activity" Button */}
                                                <Button onClick={() => viewUserActivity(u)} variant="outline" size="sm" className="h-8 w-8 p-0" title="View User Activity">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button onClick={() => deleteUser(u._id)} variant="destructive" size="sm" className="h-8 w-8 p-0" title="Delete User">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
   {/* ✅ NEW: Dialog to display the user's activity feed */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activity Feed for {selectedUser?.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                        {activities.length > 0 ? (
                            <ul className="space-y-4">
                                {activities.map(activity => (
                                    <li key={activity._id} className="flex items-start space-x-3">
                                        <div className="bg-gray-100 rounded-full p-2 mt-1"><Calendar className="h-4 w-4 text-gray-500" /></div>
                                        <div>
                                            <p className="font-medium text-sm">{activity.activityType.replace(/_/g, ' ')}</p>
                                            {activity.details.eventTitle && <p className="text-sm text-gray-600">Event: {activity.details.eventTitle}</p>}
                                            <p className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleString()}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500">No activity has been recorded for this user.</p>}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ManageUsers;