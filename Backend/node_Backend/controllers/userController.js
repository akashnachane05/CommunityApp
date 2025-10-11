const User = require('../models/User');
const Student = require('../models/Students');
const Alumni = require('../models/Alumni');
const Admin = require('../models/Admins');  // your Admin model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../utils/verification'); // ✅ Use verification.js
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, fullName: user.fullName, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, secretCode } = req.body;

    if (role === 'Admin' && secretCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(403).json({ message: 'Invalid Admin Secret Code' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });


    // ✅ Enforce email domain for Students
    const allowedDomains = ["@vit.edu", "@viit.ac.in"];
    const isStudentEmail = allowedDomains.some(domain => email.endsWith(domain));
    if (role === "Student" && !isStudentEmail) {
      return res.status(400).json({ message: "Only VIT/VIIT students can register with a valid email." });
    }

   
    // Create base user
    const user = new User({ fullName, email, password, role });
    // Send verification email for Student, Alumni, Admin
      if (["Student", "Alumni", "Admin"].includes(role)) {
        await sendVerificationEmail(user);
      }
    await user.save();
   
    // Auto-create role profile
    if (role === 'Student') {
      const studentProfile = new Student({
        userId: user._id,
        educationHistory: [],
        Bio: '',
        interests: [],
        skills: [],
        industryInterestOrField: [],
        careerGoal: '',
        branch: '',
        // grNo: ''
      });
      await studentProfile.save();
    } else if (role === 'Alumni') {
      const alumniProfile = new Alumni({
        userId: user._id,
        graduationYear: null,
        currentJob: '',
        company: '',
        Bio: '',
        skills: [],
        mentorshipAvailable: false
      });
      await alumniProfile.save();
    } else if (role === 'Admin') {
      const adminProfile = new Admin({
        userId: user._id,
        permissions: ['manage_users', 'manage_content'] // example default perms
      });
      await adminProfile.save();
    }

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ====================
// Login User
// ====================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User Not Found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });
    if (user.role === "Student" && !user.verified) {
     return res.status(401).json({ message: "Please verify your email before logging in." });
    }
    if (user.role === "Alumni" && !user.verified) {
     return res.status(401).json({ message: "Please verify your email before logging in." });
    }
    if (user.role === "Admin" && !user.verified) {
     return res.status(401).json({ message: "Please verify your email before logging in." });
    }
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Get Current User Profile
// ====================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Get All Users (Admin only)
// ====================

exports.getAllUsers = async (req, res) => {
  try {
    // ✅ Only fetch Students + Alumni
    const users = await User.find({ role: { $in: ["Student", "Alumni"] } })
      .select("-password"); // don't expose hashed passwords

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ====================
// Update User (Admin only)
// ====================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Delete User (Admin only)
// ====================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Only allow deleting Students or Alumni
    if (user.role !== 'Student' && user.role !== 'Alumni') {
      return res.status(403).json({ message: "Admins can only delete Students or Alumni" });
    }

    await User.findByIdAndDelete(id);

    // Clean up related profile
    if (user.role === 'Student') {
      await Student.findOneAndDelete({ userId: user._id });
    } else if (user.role === 'Alumni') {
      await Alumni.findOneAndDelete({ userId: user._id });
    }

    res.json({ message: 'User and profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.verified) return res.status(400).json({ message: "Invalid request." });
    if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });

  } catch (err) {
    console.error('Error verifying code:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ====================
// Change Password
// ====================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });
    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ message: 'New password cannot be same as current password' });
    }

    // Important: set plain newPassword; pre('save') will hash it
    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
