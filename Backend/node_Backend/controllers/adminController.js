const Admin = require('../models/Admins');
const Activity = require('../models/Activity');

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

// List activities with filters/pagination
exports.getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, role, action, search, from, to } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (role) filter.role = role;
    if (action) filter.action = action;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { path: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'fullName email role'),
      Activity.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activities', error: err.message });
  }
};

// Simple stats by action and role
exports.getActivityStats = async (req, res) => {
  try {
    const days = Number(req.query.days || 7);
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [byAction, byRole] = await Promise.all([
      Activity.aggregate([
        { $match: { createdAt: { $gte: from } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Activity.aggregate([
        { $match: { createdAt: { $gte: from } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({ byAction, byRole, from });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
};
