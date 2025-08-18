const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Protected routes for collaborative projects (Alumni and Students)
router.post('/', auth(['Alumni', 'Student']), projectController.createProject);
router.get('/', auth(['Alumni', 'Student', 'Admin']), projectController.getAllProjects);
router.put('/:id', auth(['Alumni', 'Student']), projectController.updateProject);
router.delete('/:id', auth(['Admin']), projectController.deleteProject);

module.exports = router;
