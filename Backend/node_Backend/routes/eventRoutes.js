const express = require('express');
const router = express.Router();
const { 
    getAllEvents, 
    createEvent, 
    registerForEvent,
    getMyHostedEvents,
    getPendingEvents,
    updateEventStatus
    , adminGetAllEvents
} = require('../controllers/eventController');
const auth = require('../middleware/auth');

// --- STUDENT Route ---
router.get('/', auth(['Student']), getAllEvents);
router.put('/register/:id', auth(['Student']), registerForEvent);

// --- ALUMNI Routes ---
router.post('/propose', auth(['Alumni']), createEvent); // Alumni propose an event
router.get('/my-hosted', auth(['Alumni']), getMyHostedEvents);

// --- ADMIN Routes ---
router.get('/all-admin', auth(['Admin']), adminGetAllEvents); // ✅ ADD THIS NEW ROUTE
router.post('/admin-create', auth(['Admin']), createEvent); // Admins create an event directly
router.get('/pending', auth(['Admin']), getPendingEvents);
router.put('/status/:id', auth(['Admin']), updateEventStatus);

module.exports = router;