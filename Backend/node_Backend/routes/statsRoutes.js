const express = require('express');
const router = express.Router();
const { getNetworkStats, getStudentDashboardStats, getAlumniDashboardStats,getAdminDashboardStats,getPublicStats } = require('../controllers/statsController');
const auth = require('../middleware/auth');

// For the Alumni Network page
router.get('/network', auth(['Student']), getNetworkStats);

// For the Student Dashboard page
router.get('/student-dashboard', auth(['Student']), getStudentDashboardStats);

// ✅ NEW: For the Alumni Dashboard page
router.get('/alumni-dashboard', auth(['Alumni']), getAlumniDashboardStats);

// --- ✅ NEW: For the Admin Dashboard page ---
router.get('/admin-dashboard', auth(['Admin']), getAdminDashboardStats);


router.get('/public', getPublicStats);

module.exports = router;