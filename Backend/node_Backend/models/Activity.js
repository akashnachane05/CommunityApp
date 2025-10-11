const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['Student', 'Alumni', 'Admin'] },
  action: { type: String, required: true },
  method: { type: String },
  path: { type: String },
  targetType: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  meta: { type: Object },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

activitySchema.index({ createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.models.Activity || mongoose.model('Activity', activitySchema);