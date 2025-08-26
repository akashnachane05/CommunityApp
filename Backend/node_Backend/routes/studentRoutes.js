const express = require('express');
const router = express.Router();
const {
  getMyStudentProfile,
  updateMyStudentProfile,
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

const auth = require('../middleware/auth');

// ====================
// Student self-service routes
// ====================
router.get('/me', auth(['Student', 'Admin']), getMyStudentProfile);
router.put('/me', auth(['Student', 'Admin']), updateMyStudentProfile);
router.post('/', auth(['Student', 'Admin']), createStudent);

// ====================
// Admin-only routes
// ====================
router.get('/', auth(['Admin']), getAllStudents);
router.put('/:id', auth(['Admin']), updateStudent);
router.delete('/:id', auth(['Admin']), deleteStudent);

module.exports = router;
