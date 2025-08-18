const Mentorship = require('../models/Mentorship');

// Create Mentorship
exports.createMentorship = async (req, res) => {
  const mentorship = new Mentorship(req.body);
  try {
    await mentorship.save();
    res.status(201).json(mentorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Mentorships
exports.getAllMentorships = async (req, res) => {
  const mentorships = await Mentorship.find();
  res.json(mentorships);
};

// Update Mentorship
exports.updateMentorship = async (req, res) => {
  const mentorship = await Mentorship.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(mentorship);
};

// Delete Mentorship
exports.deleteMentorship = async (req, res) => {
  await Mentorship.findByIdAndDelete(req.params.id);
  res.json({ message: 'Mentorship deleted' });
};

