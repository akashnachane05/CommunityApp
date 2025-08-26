const mongoose = require("mongoose");

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
  applyLink: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  postedByName: { type: String }, // easier for quick display
  createdAt: { type: Date, default: Date.now },
});

// ✅ Use module.exports for CommonJS
module.exports = mongoose.model("Job", JobSchema);
