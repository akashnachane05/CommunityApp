// in controllers/mentorshipController.js
const Mentorship = require('../models/Mentorship');
const Alumni = require('../models/Alumni');

// Student: Send a mentorship request to an Alumnus
exports.requestMentorship = async (req, res) => {
  const { mentorId, studentGoals } = req.body;
  try {
    const mentorAlumniProfile = await Alumni.findOne({ userId: mentorId });
    if (!mentorAlumniProfile || !mentorAlumniProfile.mentorshipAvailability) {
        return res.status(404).json({ message: 'This mentor is not available.' });
    }
    const newRequest = new Mentorship({
      student: req.user.id,
      mentor: mentorId,
      studentGoals: studentGoals
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Student: View their sent requests
exports.viewMyRequests = async (req, res) => {
  try {
    const requests = await Mentorship.find({ student: req.user.id }).populate('mentor', 'fullName email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Alumni: View requests received
exports.viewReceivedRequests = async (req, res) => {
  try {
    const requests = await Mentorship.find({ mentor: req.user.id, status: 'Pending' }).populate('student', 'fullName email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Alumni: Respond to a request (Accept/Reject)
exports.respondToRequest = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body; // status should be 'Accepted' or 'Rejected'
  try {
    const request = await Mentorship.findById(requestId);
    if (!request || request.mentor.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Request not found or you are not authorized.' });
    }
    request.status = status;
    if (status === 'Accepted') {
      request.acceptedAt = new Date();
    }
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Alumni: Get all accepted mentees
exports.getMyMentees = async (req, res) => {
  try {
    const mentees = await Mentorship.find({ 
      mentor: req.user.id, 
      status: 'Accepted' 
    }).populate('student', 'fullName email');
    res.json(mentees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};