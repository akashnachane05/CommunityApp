const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  educationHistory: [{
    degree: String,
    institution: String,
    yearOfGraduation: Number
  }],
  skills: [String],
  Bio:{ type: String, maxlength: 500 },
  currentJob: String,
  verificationStatus: { type: Boolean, default: false },
  mentorshipAvailability: { type: Boolean, default: true },
  webinarsHosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Webinar' }]
});

module.exports = mongoose.model('Alumni', alumniSchema);
