const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const auth = require('../middleware/auth'); // Adjust the path as necessary

// Add these before Admin-only routes
router.get('/me', auth(['Alumni', 'Admin']), alumniController.getMyAlumniProfile);
router.put('/me', auth(['Alumni', 'Admin']), alumniController.updateMyAlumniProfile);

router.post('/', auth(['Alumni', 'Admin']), alumniController.createAlumni);
router.get('/', auth(['Alumni', 'Admin']), alumniController.getAllAlumni);
router.put('/:id', auth(['Alumni', 'Admin']), alumniController.updateAlumni);
router.delete('/:id', auth(['Admin']), alumniController.deleteAlumni);


module.exports = router;
