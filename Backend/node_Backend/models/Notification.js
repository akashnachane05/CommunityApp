const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['NEW_MESSAGE', 'MENTORSHIP_REQUEST', 'MENTORSHIP_ACCEPTED'],
        required: true
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String } // Crucial for redirecting on click
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
module.exports = Notification;