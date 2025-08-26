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
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  // ✅ NEW FIELDS FOR EVENT MODE
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
  }
}, { timestamps: true });

// Add a conditional requirement for location/meetingLink
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