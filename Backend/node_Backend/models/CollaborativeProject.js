const mongoose = require('mongoose');

const collaborativeProjectSchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  description: String,
  progress: { type: Number, min: 0, max: 100 }, // Percentage of progress
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CollaborativeProject', collaborativeProjectSchema);