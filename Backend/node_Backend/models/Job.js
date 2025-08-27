const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: {
    type: String,
    enum: ["Full-Time", "Part-Time", "Internship"],
    default: "Full-Time",
  },
  applyLink: { type: String, required: true },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  // Note: We will populate this from the 'postedBy' field instead of storing it separately
  // to ensure data is always consistent.
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
module.exports = Job;