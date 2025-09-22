const Student = require('../models/Students');

// ====================
// Create Student Profile
// ====================
exports.createStudent = async (req, res) => {
  try {
    const existing = await Student.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Student profile already exists' });
    }

    const student = new Student({
      userId: req.user.id,
      Bio: req.body.Bio || '',
      skills: req.body.skills || [],
      interests: req.body.interests || [],
      educationHistory: req.body.educationHistory || [],
      industryInterestOrField: req.body.industryInterestOrField || [],
      careerGoal: req.body.careerGoal || '',
      branch: req.body.branch || '',
      grNo: req.body.grNo || ''
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) {
    console.error('Error creating student profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Get Logged-in Student Profile
// ====================
exports.getMyStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId', 'fullName email role');
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    res.json(student);
  } catch (err) {
    console.error('Error fetching student profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Update Logged-in Student Profile
// ====================
exports.updateMyStudentProfile = async (req, res) => {
  try {
    const updateData = {
      Bio: req.body.Bio || '',
      skills: req.body.skills || [],
      interests: req.body.interests || [],
      educationHistory: req.body.educationHistory || [],
      industryInterestOrField: req.body.industryInterestOrField || [],
      careerGoal: req.body.careerGoal || '',
      branch: req.body.branch || '',
      grNo: req.body.grNo || ''
    };

    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true }
    ).populate('userId', 'fullName email role');

    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    res.json(student);
  } catch (err) {
    console.error('Error updating student profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Admin-only routes
// ====================
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'fullName email role');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
