const express = require('express');
const router = express.Router();
const webinarController = require('../controllers/webinarController');
const auth = require('../middleware/auth');

// Protected routes for hosting and managing webinars (Alumni and Admins)
router.post('/', auth(['Alumni', 'Admin']), webinarController.createWebinar);
router.get('/', auth(['Alumni', 'Student', 'Admin']), webinarController.getAllWebinars);
router.put('/:id', auth(['Alumni', 'Admin']), webinarController.updateWebinar);
router.delete('/:id', auth(['Admin']), webinarController.deleteWebinar);

module.exports = router;
