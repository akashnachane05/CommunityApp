import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoutes";
import RoleRoute from "./auth/Roleroute";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";

import AdminDashboard from "./pages/admin/adminDashboard";
import StudentDashboard from "./pages/Student/studentDashboard";
import AlumniDashboard from "./pages/alumni/alumniDashboard";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />

        {/* Shared dashboard */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Role-specific */}
        <Route path="/admin" element={<RoleRoute roles={['Admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="/student" element={<RoleRoute roles={['Student']}><StudentDashboard /></RoleRoute>} />
        <Route path="/alumni" element={<RoleRoute roles={['Alumni']}><AlumniDashboard /></RoleRoute>} />

        {/* Default */}
        {/* <Route path="*" element={<Navigate to="/login" />} /> */}
      </Routes>
    </AuthProvider>
  );
}
