const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const auth = require('../middleware/auth');

// ====================
// Alumni self-service routes
// ====================
router.get('/me', auth(['Alumni', 'Admin']), alumniController.getMyAlumniProfile);
router.put('/me', auth(['Alumni', 'Admin']), alumniController.updateMyAlumniProfile);
router.post('/', auth(['Alumni', 'Admin']), alumniController.createAlumni);


// in routes/alumniRoutes.js

// Allow Students and Admins to view all alumni
router.get('/', auth(['Admin', 'Student']), alumniController.getAllAlumni);
// ====================
// Admin-only routes
// ====================
router.put('/:id', auth(['Admin']), alumniController.updateAlumni);
router.delete('/:id', auth(['Admin']), alumniController.deleteAlumni);

module.exports = router;
