const User = require('../models/User');
const Student = require('../models/Students');
const Alumni = require('../models/Alumni');
const Admin = require('../models/Admins');  // your Admin model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require("../utils/sendEmail");
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
  if (req.body.role === "Student"|| req.body.role === "Alumni") {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const emailSubject = "VIITAA Email Verification Code";
    const emailText = `Your VIITAA verification code is: ${code}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to VIITAA!</h2>
        <p>Dear ${user.fullName},</p>
        <p>Thank you for registering on the VIITAA (VIT/VIIT Alumni & Student Network) platform.</p>
        <p style="font-size: 1.1em;">To verify your email and activate your account, please enter the following code in the app:</p>
        <div style="font-size: 2em; font-weight: bold; letter-spacing: 4px; color: #4f46e5; text-align: center; margin: 24px 0;">${code}</div>
        <ul>
          <li>This code is valid for 10 minutes.</li>
          <li>If you did not request this, please ignore this email.</li>
        </ul>
        <p style="margin-top: 32px;">Best regards,<br/>VIITAA Team</p>
        <hr/>
        <p style="font-size: 0.9em; color: #888;">For support, contact your college admin or reply to this email.</p>
      </div>
    `;

      user.verificationCode = code;
      user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 min
      user.verified = false;
      await sendEmail(user.email, emailSubject, emailText, emailHtml);
  } else {
      user.verified = true; // Admins are auto-verified
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
        grNo: ''
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
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.verified) return res.status(400).json({ message: "Invalid request." });
  if (
    user.verificationCode !== code ||
    user.verificationCodeExpires < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired code." });
  }
  user.verified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();
  res.json({ message: "Email verified successfully!" });
};
