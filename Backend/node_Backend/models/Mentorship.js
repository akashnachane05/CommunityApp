const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['Pending', 'Active', 'Completed'], required: true },
  communicationLog: [{
    messageId: mongoose.Schema.Types.ObjectId,
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);
