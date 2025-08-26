// in models/Mentorship.js
const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  studentGoals: { type: String, required: true }, // Student's objectives for the mentorship
  mentorFeedback: { type: String }, // Feedback from the mentor
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  completedAt: { type: Date }
});

const Mentorship = mongoose.models.Mentorship || mongoose.model('Mentorship', mentorshipSchema);

module.exports = Mentorship;