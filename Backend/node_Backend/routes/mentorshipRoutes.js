// in routes/mentorshipRoutes.js
const express = require('express');
const router = express.Router();
const { requestMentorship, viewMyRequests, viewReceivedRequests, respondToRequest,getMyMentees } = require('../controllers/mentorshipController');

const auth = require('../middleware/auth');

// Student routes
router.post('/request', auth(['Student']), requestMentorship);
router.get('/my-requests', auth(['Student']), viewMyRequests);

// Alumni routes
router.get('/my-mentees', auth(['Alumni']), getMyMentees); // ✅ ADD THIS
router.get('/received-requests', auth(['Alumni']), viewReceivedRequests);
router.put('/respond/:requestId', auth(['Alumni']), respondToRequest);

module.exports = router;