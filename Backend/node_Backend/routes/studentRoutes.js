const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
// Add these before Admin-only routes
router.get('/me', auth(['Student', 'Admin']), studentController.getMyStudentProfile);
router.put('/me', auth(['Student', 'Admin']), studentController.updateMyStudentProfile);

// Protected routes for students (Students and Admins)
router.post('/', auth(['Student', 'Admin']), studentController.createStudent);
router.get('/', auth(['Student', 'Admin']), studentController.getAllStudents);
router.put('/:id', auth(['Student', 'Admin']), studentController.updateStudent);
router.delete('/:id', auth(['Admin']), studentController.deleteStudent);

module.exports = router;
