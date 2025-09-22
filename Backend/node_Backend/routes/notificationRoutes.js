const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  deleteNotificationsBySender,
  deleteAllNotifications,
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth(), getNotifications);
router.put('/read', auth(), markAsRead);
router.delete('/:id', auth(), deleteNotification);
router.delete('/sender/:senderId', auth(), deleteNotificationsBySender);
router.delete('/clear-all', auth(), deleteAllNotifications);

module.exports = router;
