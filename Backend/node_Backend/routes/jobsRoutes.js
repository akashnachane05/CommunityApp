const express = require('express');
const router = express.Router(); // ensure only alumni can post
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// ✅ Post a new job
router.post("/post", auth(['Alumni']), async (req, res) => {
  try {
    console.log(req.body)
    const { title, description, company, location, type, applyLink } = req.body;
    const newJob = new Job({
      title,
      description,
      company,
      location,
      type,
      applyLink,
      postedBy: req.user._id,
      postedByName: req.user.fullName
    });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: "Failed to post job", error: err.message });
  }
});

// ✅ Fetch jobs posted by logged-in alumnus
router.get("/my-posts", auth(['Alumni']), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", error: err.message });
  }
});

// ✅ (Optional) Fetch all jobs for students
router.get("/all", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", error: err.message });
  }
});

module.exports = router;