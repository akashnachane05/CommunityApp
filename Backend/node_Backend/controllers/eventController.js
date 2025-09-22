const Event = require('../models/Event');
const User = require('../models/User');
const Student = require('../models/Students');

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
    if (!event) return res.status(404).json({ message: "Event not found" });

    const studentProfile = await Student.findOne({ userId: req.user.id });
    if (!studentProfile)
      return res.status(404).json({ message: "Student profile not found." });

    const userDoc = await User.findById(req.user.id).select("fullName email");

    const attendeeDetails = {
      studentId: req.user.id,
      fullName: userDoc?.fullName || "Unnamed User",
      branch: studentProfile.branch,
      grNo: studentProfile.grNo,
      email: userDoc?.email || "No Email",
    };

    // ✅ Use $addToSet to avoid duplicates
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { attendees: attendeeDetails } },
      { new: true }
    );

    if (typeof recordActivity === "function") {
      await recordActivity(req.user.id, "EVENT_REGISTERED", {
        eventId: updatedEvent._id,
        eventTitle: updatedEvent.title,
      });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({ message: "Server Error" });
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
        const { status, rejectionReason } = req.body; // Get reason from request body
        
        const updateData = { status };
        if (status === 'Rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
exports.getEventDetailsForAdmin = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            // No need to populate attendees here since we stored the details directly
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};