const express = require('express');
const router = express.Router();
const { getAllJobs, getMyJobs, createJob, deleteJob } = require('../controllers/jobController');
const auth = require('../middleware/auth');

// For Students to view all jobs
router.get('/all', auth(['Student','Admin']), getAllJobs);

// For Alumni to view their own posted jobs
router.get('/my-jobs', auth(['Alumni']), getMyJobs);

// For Alumni to create a job
router.post('/create', auth(['Alumni']), createJob);

// For Alumni or Admin to delete a job
router.delete('/:id', auth(['Alumni', 'Admin']), deleteJob);

module.exports = router;