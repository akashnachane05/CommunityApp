const express = require('express');
const router = express.Router();
console.log(__dirname); 
const userController = require('../controllers/userController');

const auth = require('../middleware/auth'); // Make sure to import your auth middleware

// Public routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/me', auth(), userController.getProfile);
// Protected routes (Admins only)
router.use(auth(['Admin'])); // Apply auth middleware for the following routes

router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
