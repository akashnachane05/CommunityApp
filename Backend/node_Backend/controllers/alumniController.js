const Alumni = require('../models/Alumni');

// ====================
// Create Alumni Profile
// ====================
exports.createAlumni = async (req, res) => {
  try {
    const existing = await Alumni.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Alumni profile already exists' });
    }

    const alumni = new Alumni({ ...req.body, userId: req.user.id });
    await alumni.save();
    res.status(201).json(alumni);
  } catch (err) {
    console.error('Error creating alumni profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Get ALL Alumni (Admin + Alumni allowed in routes)
// ====================
exports.getAllAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.find().populate('userId', 'fullName email role');
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Get Logged-in Alumni Profile
// ====================
exports.getMyAlumniProfile = async (req, res) => {
  try {
    const alumni = await Alumni.findOne({ userId: req.user.id }).populate('userId', 'fullName email role');
    if (!alumni) return res.status(404).json({ message: 'Alumni profile not found' });

    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Update Logged-in Alumni Profile
// ====================
exports.updateMyAlumniProfile = async (req, res) => {
  try {
    const alumni = await Alumni.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    ).populate('userId', 'fullName email role');

    if (!alumni) return res.status(404).json({ message: 'Alumni profile not found' });

    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Update ANY Alumni by ID (Admin only)
// ====================
exports.updateAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Delete Alumni (Admin only)
// ====================
exports.deleteAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndDelete(req.params.id);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    res.json({ message: 'Alumni deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
