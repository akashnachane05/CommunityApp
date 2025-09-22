const Notification = require('../models/Notification');

// Get all notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mark notifications as read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a single notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, recipient: req.user.id });

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Notification deleted', notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete all notifications from a specific sender
exports.deleteNotificationsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    await Notification.deleteMany({
      recipient: req.user.id,
      sender: senderId,
    });

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Notifications from this sender deleted',
      notifications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });

    res.status(200).json({
      message: 'All notifications cleared',
      notifications: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
