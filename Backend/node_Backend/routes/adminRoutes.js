const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Protected routes for admins only
router.post('/', auth(['Admin']), adminController.createAdmin);
router.get('/', auth(['Admin']), adminController.getAllAdmins);
router.put('/:id', auth(['Admin']), adminController.updateAdmin);
router.delete('/:id', auth(['Admin']), adminController.deleteAdmin);

module.exports = router;
