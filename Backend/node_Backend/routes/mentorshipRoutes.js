const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorshipController');
const auth = require('../middleware/auth');

// Protected routes for alumni and students (Alumni and Admins)
router.post('/', auth(['Alumni', 'Admin']), mentorshipController.createMentorship);
router.get('/', auth(['Alumni', 'Student', 'Admin']), mentorshipController.getAllMentorships);
router.put('/:id', auth(['Alumni', 'Admin']), mentorshipController.updateMentorship);
router.delete('/:id', auth(['Admin']), mentorshipController.deleteMentorship);

module.exports = router;
