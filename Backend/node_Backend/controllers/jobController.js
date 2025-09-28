const Job = require('../models/Job');
const User = require('../models/User');
const { sendJobEmail } = require('../utils/jobEmail');

// FOR STUDENTS: Get all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('postedBy', 'fullName') // Gets the alumnus's name
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// FOR ALUMNI: Get jobs they have posted
exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// FOR ALUMNI: Create a new job
exports.createJob = async (req, res) => {
  try {
    const { title, company, location, description, applyLink, type } = req.body;

    // ❌ Check for duplicate job by same alumni
    const existingJob = await Job.findOne({ title, company, postedBy: req.user.id });
    if (existingJob) {
      return res.status(400).json({ message: "You have already posted this job." });
    }

    // Save job
    const newJob = new Job({
      title,
      company,
      location,
      description,
      applyLink,
      type,
      postedBy: req.user.id
    });
    const job = await newJob.save();
     
    // Fetch all verified students
    const students = await User.find({ role: 'Student', verified: true }).select('fullName email');
    res.status(201).json({ message: 'Job posted and notifications sent.', job });
    // Send email to all students
    process.nextTick(async () => {
        try {
            await Promise.all(
            students.map(student => sendJobEmail(student, job))
            );
        } catch (err) {
            console.error("❌ Error sending job emails:", err);
        }
    });

  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// FOR ALUMNI/ADMINS: Delete a job
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        // Only the owner or an admin can delete
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await job.deleteOne();
        res.json({ message: 'Job removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};