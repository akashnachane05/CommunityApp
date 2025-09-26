const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branch: { type: String},
  grNo: { type: String, unique: true , sparse: true, default: null},
  educationHistory: [{
    degree: String,
    institution: String,
    yearOfGraduation: Number
  }],
  Bio: { type: String, maxlength: 500 },
  interests: [String] ,
  skills:[String],
  industryInterestOrField:[String],
  careerGoal:{type :String},
  requestedMentorships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' }],
  careerModulesProgress: [{
    moduleId: mongoose.Schema.Types.ObjectId,
    completionStatus: Boolean
  }],
  webinarsAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Webinar' }]
});

module.exports = mongoose.model('Student', studentSchema);
