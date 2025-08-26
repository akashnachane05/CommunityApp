const Event = require('../models/Event');
const User = require('../models/User');

// FOR STUDENTS: Get all APPROVED events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'Approved' })
      .populate('hostedBy', 'fullName')
      .sort({ date: 'asc' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// FOR ADMIN/ALUMNI: Create an event (NOW WITH MODE)
exports.createEvent = async (req, res) => {
  try {
    const newEventData = {
      ...req.body,
      hostedBy: req.user.id,
      status: req.user.role === 'Admin' ? 'Approved' : 'Pending',
    };
    const event = new Event(newEventData);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FOR STUDENTS: Register for an event
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    event.attendees.push(req.user.id);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// FOR ALUMNI: Get events they have created
exports.getMyHostedEvents = async (req, res) => {
    try {
        const myEvents = await Event.find({ hostedBy: req.user.id }).sort({ createdAt: 'desc' });
        res.json(myEvents);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// FOR ADMINS: Get all events that are pending approval
exports.getPendingEvents = async (req, res) => {
    try {
        const pendingEvents = await Event.find({ status: 'Pending' })
            .populate('hostedBy', 'fullName')
            .sort({ createdAt: 'asc' });
        res.json(pendingEvents);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// FOR ADMINS: Approve or reject an event
exports.updateEventStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        event.status = status;
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// FOR ADMINS - Get ALL events (including pending/rejected)
exports.adminGetAllEvents = async (req, res) => {
    try {
        const events = await Event.find({})
            .populate('hostedBy', 'fullName')
            .sort({ createdAt: 'desc' });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};