const mongoose = require('mongoose');

const webinarSchema = new mongoose.Schema({
  webinarId: { type: String, unique: true, required: true },
  hostAlumniId: { type: String, required: true },
  participants: { type: Array, default: [] },
  dateTime: { type: Date, required: true },
  recordingLink: { type: String }
});

const Webinar = mongoose.model('Webinar', webinarSchema);
module.exports = Webinar;
