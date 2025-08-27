const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'fullName')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, read: false }, { $set: { read: true } });
        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ✅ NEW: Delete a single notification after it's been clicked
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id // Ensure users can only delete their own notifications
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notification.deleteOne();
        res.status(200).json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};