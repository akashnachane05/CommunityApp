const Admin = require('../models/Admins');

// ====================
// Create Admin Profile (used internally or Admin registration)
// ====================
exports.createAdmin = async (req, res) => {
  try {
    const existing = await Admin.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Admin profile already exists' });
    }

    const admin = new Admin({ ...req.body, userId: req.user.id });
    await admin.save();
    res.status(201).json(admin);
  } catch (err) {
    console.error('Error creating admin profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Get ALL Admins (Admin only)
// ====================
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate('userId', 'fullName email role');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Get Logged-in Admin Profile
// ====================
exports.getMyAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({ userId: req.user.id }).populate('userId', 'fullName email role');
    if (!admin) return res.status(404).json({ message: 'Admin profile not found' });

    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Update Logged-in Admin Profile
// ====================
exports.updateMyAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    ).populate('userId', 'fullName email role');

    if (!admin) return res.status(404).json({ message: 'Admin profile not found' });

    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Update ANY Admin by ID (super-admin functionality)
// ====================
exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Delete Admin
// ====================
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
