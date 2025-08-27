const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead,deleteNotification } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth(), getNotifications);
router.put('/read', auth(), markAsRead);
// ✅ NEW: Route to delete a notification by its ID
router.delete('/:id', auth(), deleteNotification);
module.exports = router;