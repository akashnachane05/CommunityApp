const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Alumni', 'Student', 'Admin'], required: true },
  violations: [{
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Fix: Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
