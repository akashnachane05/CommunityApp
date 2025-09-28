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

// specific delete routes
router.delete('/clear-all', auth(), deleteAllNotifications);
router.delete('/sender/:senderId', auth(), deleteNotificationsBySender);

//generic delete by id
router.delete('/:id', auth(), deleteNotification);



module.exports = router;
