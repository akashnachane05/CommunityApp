// in controllers/mentorshipController.js
const Mentorship = require('../models/Mentorship');
const Alumni = require('../models/Alumni');

// Student: Send a mentorship request to an Alumnus
exports.requestMentorship = async (req, res) => {
  try {
    const { mentorId, studentGoals } = req.body;
    if (!req.user?.id && !req.user?._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!mentorId) {
      return res.status(400).json({ message: 'mentorId is required' });
    }

    const mentorAlumniProfile = await Alumni.findOne({ userId: mentorId });
    if (!mentorAlumniProfile || !mentorAlumniProfile.mentorshipAvailability) {
      return res.status(404).json({ message: 'This mentor is not available.' });
    }

    const newRequest = new Mentorship({
      student: req.user.id || req.user._id,
      mentor: mentorId,
      studentGoals,
      status: 'Pending',
    });
    await newRequest.save();

    // Activity locals BEFORE sending response
    res.locals.activityAction = 'MENTORSHIP_REQUEST_SENT';
    res.locals.activityUserId = req.user.id || req.user._id;
    res.locals.activityRole = req.user.role;
    res.locals.activityTargetType = 'Mentorship';
    res.locals.activityTargetId = newRequest._id;
    res.locals.activityMeta = { mentorId, studentGoals, email: req.user.email };

    return res.status(201).json(newRequest);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Student: View their sent requests
exports.viewMyRequests = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const requests = await Mentorship
      .find({ student: studentId })
      .populate('mentor', 'fullName email');

    // Optional activity for GET views (logger must support it)
    res.locals.activityAction = 'MENTORSHIP_VIEW_SENT';
    res.locals.activityUserId = studentId;
    res.locals.activityRole = req.user.role;
    res.locals.activityTargetType = 'Mentorship';

    return res.json(requests);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Alumni: View requests received (Pending)
exports.viewReceivedRequests = async (req, res) => {
  try {
    const mentorId = req.user?.id || req.user?._id;
    if (!mentorId) return res.status(401).json({ message: 'Unauthorized' });

    const requests = await Mentorship
      .find({ mentor: mentorId, status: 'Pending' })
      .populate('student', 'fullName email');

    // Optional activity for GET views
    res.locals.activityAction = 'MENTORSHIP_VIEW_RECEIVED';
    res.locals.activityUserId = mentorId;
    res.locals.activityRole = req.user.role;
    res.locals.activityTargetType = 'Mentorship';

    return res.json(requests);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Alumni: Respond to a request (Accept/Reject)
exports.respondToRequest = async (req, res) => {
  try {
    const mentorId = req.user?.id || req.user?._id;
    if (!mentorId) return res.status(401).json({ message: 'Unauthorized' });

    const { requestId } = req.params;
    const { status } = req.body; // 'Accepted' | 'Rejected'
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "status must be 'Accepted' or 'Rejected'" });
    }

    const request = await Mentorship.findById(requestId);
    if (!request || request.mentor.toString() !== String(mentorId)) {
      return res.status(404).json({ message: 'Request not found or you are not authorized.' });
    }
    if (request.status !== 'Pending') {
      return res.status(409).json({ message: `Already ${request.status}` });
    }

    request.status = status;
    if (status === 'Accepted') request.acceptedAt = new Date();
    await request.save();

    // Activity locals BEFORE sending response
    res.locals.activityAction = `MENTORSHIP_REQUEST_${status.toUpperCase()}`;
    res.locals.activityUserId = mentorId;
    res.locals.activityRole = req.user.role;
    res.locals.activityTargetType = 'Mentorship';
    res.locals.activityTargetId = request._id;
    res.locals.activityMeta = { studentId: request.student, mentorId: request.mentor };

    return res.json(request);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Alumni: Get all accepted mentees
exports.getMyMentees = async (req, res) => {
  try {
    const mentorId = req.user?.id || req.user?._id;
    if (!mentorId) return res.status(401).json({ message: 'Unauthorized' });

    const mentees = await Mentorship.find({
      mentor: mentorId,
      status: 'Accepted',
    }).populate('student', 'fullName email');

    // Optional activity for GET views
    res.locals.activityAction = 'MENTORSHIP_LIST_MENTEES';
    res.locals.activityUserId = mentorId;
    res.locals.activityRole = req.user.role;
    res.locals.activityTargetType = 'Mentorship';

    return res.json(mentees);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: 'Server error', error: err.message });
  }
};