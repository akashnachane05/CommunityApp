const Event = require('../models/Event');
const User = require('../models/User');
const Student = require('../models/Students');
const { recordActivity } = require('../utils/activityLogger');
const { sendEventApprovalEmail, sendEventRejectionEmail,sendEventApprovalAlumniEmail,sendEventRegistrationEmail } = require('../utils/eventMailer');
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

     // Send registration confirmation email asynchronously
    process.nextTick(async () => {
      try {
        await sendEventRegistrationEmail(userDoc, updatedEvent);
      } catch (err) {
        console.error("Error sending registration email:", err);
      }
    });

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
// exports.updateEventStatus = async (req, res) => {
//     try {
//         const { status, rejectionReason } = req.body; // Get reason from request body
        
//         const updateData = { status };
//         if (status === 'Rejected' && rejectionReason) {
//             updateData.rejectionReason = rejectionReason;
//         }

//         const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
//         if (!event) return res.status(404).json({ message: 'Event not found' });
        
//         res.status(200).json(event);
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// };
exports.updateEventStatus = async (req, res) => {
  try {
    const { id} = req.params;
    const { status, rejectionReason } = req.body;

    const event = await Event.findById(id).populate("hostedBy", "fullName email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = status;
    if (status === "Rejected") {
      event.rejectionReason = rejectionReason;
    }
    await event.save();
    
    res.json({ message: `Event ${status.toLowerCase()} successfully` });

    process.nextTick(async () => {
      try {
        if (status === "Approved") {
          const students = await User.find({ role: "Student", verified: true }).select("fullName email");
          await Promise.all(
            students.map((student) => sendEventApprovalEmail(student, event))
          );

          await sendEventApprovalAlumniEmail(event.hostedBy, event);
        }

        if (status === "Rejected" && rejectionReason) {
          await sendEventRejectionEmail(event.hostedBy, event, rejectionReason);
        }
      } catch (emailError) {
        console.error("Error sending event notification emails:", emailError);
      }
    });
    

  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({ message: "Error updating event status" });
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