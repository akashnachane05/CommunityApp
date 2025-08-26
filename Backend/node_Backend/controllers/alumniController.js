const Alumni = require('../models/Alumni');
const User = require('../models/User'); // Correct path with a slash
// ====================
// Create Alumni Profile
// ====================
exports.createAlumni = async (req, res) => {
  try {
    const existing = await Alumni.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Alumni profile already exists' });
    }

    const alumni = new Alumni({
      userId: req.user.id,
      Bio: req.body.Bio || '',
      skills: req.body.skills || [],
      educationHistory: req.body.educationHistory || [],
      currentJob: req.body.currentJob || '',
      verificationStatus: req.body.verificationStatus || false,
      mentorshipAvailability: req.body.mentorshipAvailability ?? true,
      webinarsHosted: req.body.webinarsHosted || []
    });

    await alumni.save();
    res.status(201).json(alumni);
  } catch (err) {
    console.error('Error creating alumni profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Get Logged-in Alumni Profile
// ====================
exports.getMyAlumniProfile = async (req, res) => {
  try {
    const alumni = await Alumni.findOne({ userId: req.user.id })
      .populate('userId', 'fullName email role');

    if (!alumni) return res.status(404).json({ message: 'Alumni profile not found' });

    res.json(alumni);
  } catch (err) {
    console.error('Error fetching alumni profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Update Logged-in Alumni Profile
// ====================
exports.updateMyAlumniProfile = async (req, res) => {
  try {
    const updateData = {
      Bio: req.body.Bio || '',
      skills: req.body.skills || [],
      educationHistory: req.body.educationHistory || [],
      currentJob: req.body.currentJob || '',
      verificationStatus: req.body.verificationStatus || false,
      mentorshipAvailability: req.body.mentorshipAvailability ?? true,
      webinarsHosted: req.body.webinarsHosted || []
    };

    const alumni = await Alumni.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true }
    ).populate('userId', 'fullName email role');

    if (!alumni) return res.status(404).json({ message: 'Alumni profile not found' });

    res.json(alumni);
  } catch (err) {
    console.error('Error updating alumni profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Admin-only routes
// ====================
// in controllers/alumniController.js
// in controllers/alumniController.js

// ... (keep the other functions)

// UPGRADED for search and filtering
exports.getAllAlumni = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
        // This creates a case-insensitive search query
        const regex = new RegExp(search, 'i');
        // We need to find users that match the name first
        const matchedUsers = await User.find({ fullName: regex }).select('_id');
        const userIds = matchedUsers.map(u => u._id);

        // Search in Alumni profiles by skills, job, or if their user ID matches
        filter = {
            $or: [
                { userId: { $in: userIds } },
                { currentJob: regex },
                { skills: regex }
            ]
        };
    }
    
    const alumni = await Alumni.find(filter).populate('userId', 'fullName email role');
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndDelete(req.params.id);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    res.json({ message: 'Alumni deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
