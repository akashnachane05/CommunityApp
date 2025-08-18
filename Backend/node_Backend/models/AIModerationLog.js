const mongoose = require('mongoose');

const aiModerationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flaggedContent: String,
  actionTaken: { type: String, enum: ['Auto-Moderated', 'Admin Review'] },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIModerationLog', aiModerationLogSchema);
