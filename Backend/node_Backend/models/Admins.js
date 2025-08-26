const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const adminSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // permissionLevel: { type: String,  required: true ,default:"basic"},
  moderationLog: [{
    logId: mongoose.Schema.Types.ObjectId,
    action: String,
    timestamp: { type: Date, default: Date.now }
  }],
  reportsGenerated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  platformUpdateHistory: [{
    updateId: mongoose.Schema.Types.ObjectId,
    updateDescription: String,
    timestamp: { type: Date, default: Date.now }
  }]
});




module.exports = mongoose.model('Admin', adminSchema);
