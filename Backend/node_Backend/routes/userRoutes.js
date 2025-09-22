const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// =======================
// Public Routes
// =======================
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/verify-code', userController.verifyCode); // MOVED HERE

// =======================
// Protected Routes (for any logged-in user)
// =======================
router.get('/me', auth(), userController.getProfile);

// =======================
// Protected Routes (Admins only)
// =======================
// This middleware now only applies to the specific admin routes below it.
router.use(auth(['Admin']));

router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;