const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  speaker: { type: String, required: true },
  speakerRole: { type: String },
  duration: { type: String },
  type: {
    type: String,
    enum: ['Webinar', 'Workshop', 'Meetup'],
    default: 'Webinar'
  },
  hostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline'],
    required: true
  },
  location: { // For 'Offline' events
    type: String,
  },
  meetingLink: { // For 'Online' events
    type: String,
  },
  // ✅ Store detailed attendee info only
  attendees: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String },
    email: { type: String },
    branch: { type: String },
    grNo: { type: String },
    registeredAt: { type: Date, default: Date.now }
  }],
  rejectionReason: { type: String },
}, { timestamps: true });

// Conditional requirement for location/meetingLink
eventSchema.pre('save', function(next) {
  if (this.mode === 'Offline' && !this.location) {
    next(new Error('Location is required for offline events.'));
  } else if (this.mode === 'Online' && !this.meetingLink) {
    next(new Error('Meeting link is required for online events.'));
  } else {
    next();
  }
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
module.exports = Event;
