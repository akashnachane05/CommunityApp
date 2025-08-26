const express = require('express');
const router = express.Router();
const { getNetworkStats, getStudentDashboardStats, getAlumniDashboardStats } = require('../controllers/statsController');
const auth = require('../middleware/auth');

// For the Alumni Network page
router.get('/network', auth(['Student']), getNetworkStats);

// For the Student Dashboard page
router.get('/student-dashboard', auth(['Student']), getStudentDashboardStats);

// ✅ NEW: For the Alumni Dashboard page
router.get('/alumni-dashboard', auth(['Alumni']), getAlumniDashboardStats);

module.exports = router;