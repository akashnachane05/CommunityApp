const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');


// Activity logs (Admin only)
router.get('/activities', auth(['Admin']), adminController.getActivities);
router.get('/activities/stats', auth(['Admin']), adminController.getActivityStats);
// Protected routes for admins only
router.post('/', auth(['Admin']), adminController.createAdmin);
router.get('/', auth(['Admin']), adminController.getAllAdmins);
router.put('/:id', auth(['Admin']), adminController.updateAdmin);
router.delete('/:id', auth(['Admin']), adminController.deleteAdmin);




module.exports = router;
