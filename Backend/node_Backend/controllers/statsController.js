const Alumni = require('../models/Alumni');
const Student = require('../models/Students');
const Mentorship = require('../models/Mentorship');
const Event = require('../models/Event');

// --- Network Stats (unchanged) ---
exports.getNetworkStats = async (req, res) => {
    try {
        const [totalAlumni, availableMentors] = await Promise.all([
            Alumni.countDocuments(),
            Alumni.countDocuments({ mentorshipAvailability: true }),
        ]);
        const studentConnections = await Mentorship.countDocuments({ student: req.user.id, status: 'Accepted' });
        res.json({ totalAlumni, availableMentors, studentConnections });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- Student Dashboard Stats (unchanged) ---
exports.getStudentDashboardStats = async (req, res) => {
    try {
        const studentId = req.user.id;
        const [studentProfile, acceptedMenteeships, eventsAttended] = await Promise.all([
            Student.findOne({ userId: studentId }),
            Mentorship.countDocuments({ student: studentId, status: 'Accepted' }),
            Event.countDocuments({ attendees: studentId, date: { $lt: new Date() } })
        ]);
        res.json({ studentProfile, acceptedMenteeships, eventsAttended });
    } catch (error) {
        console.error("Error fetching student dashboard stats:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- ✅ NEW: Alumni Dashboard Stats ---
exports.getAlumniDashboardStats = async (req, res) => {
    try {
        const alumniId = req.user.id;
        const [
            alumniProfile,
            pendingRequests,
            activeMentees,
            hostedEvents
        ] = await Promise.all([
            Alumni.findOne({ userId: alumniId }),
            Mentorship.countDocuments({ mentor: alumniId, status: 'Pending' }),
            Mentorship.countDocuments({ mentor: alumniId, status: 'Accepted' }),
            Event.countDocuments({ hostedBy: alumniId, status: 'Approved' })
        ]);
        res.json({
            alumniProfile,
            pendingRequests,
            activeMentees,
            hostedEvents
        });
    } catch (error) {
        console.error("Error fetching alumni dashboard stats:", error);
        res.status(500).json({ message: "Server Error" });
    }
};