// in routes/conversationRoutes.js
const express = require('express');
const router = express.Router();
const { getConversation, sendMessage, getMessages } = require('../controllers/conversationController');
const auth = require('../middleware/auth');

// Apply auth to all routes
router.use(auth(['Student', 'Alumni', 'Admin']));

router.get('/:receiverId', getConversation);
router.post('/send/:conversationId', sendMessage);
router.get('/messages/:conversationId', getMessages);

module.exports = router;