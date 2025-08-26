// in controllers/recommendationController.js

const Student = require('../models/Students');
const Alumni = require('../models/Alumni');

// The scoring algorithm
const calculateMatchScore = (student, alumni) => {
  let score = 0;
  if (!student || !alumni) return 0;

  // 1. Match Skills: +15 points for each common skill (case-insensitive)
  if (student.skills && alumni.skills) {
    const studentSkills = student.skills.map(s => s.toLowerCase());
    const alumniSkills = alumni.skills.map(s => s.toLowerCase());
    const commonSkills = studentSkills.filter(skill => alumniSkills.includes(skill));
    score += commonSkills.length * 15;
  }

  // 2. Match Student Interests with Alumni Skills: +10 points for each match
  if (student.interests && alumni.skills) {
      const studentInterests = student.interests.map(i => i.toLowerCase());
      const alumniSkills = alumni.skills.map(s => s.toLowerCase());
      const interestMatches = studentInterests.filter(interest => alumniSkills.includes(interest));
      score += interestMatches.length * 10;
  }
  
  // 3. Match Student's Career Goal with Alumni's Job Title: +25 points for a partial match
  if (student.careerGoal && alumni.currentJob) {
    const careerGoal = student.careerGoal.toLowerCase();
    const currentJob = alumni.currentJob.toLowerCase();
    if (currentJob.includes(careerGoal) || careerGoal.includes(currentJob)) {
      score += 25;
    }
  }
  
  // 4. Match Student's industry interest with Alumni's Job Title: +10 points
  if (student.industryInterestOrField && alumni.currentJob) {
      const industryInterests = student.industryInterestOrField.map(i => i.toLowerCase());
      const currentJob = alumni.currentJob.toLowerCase();
      if(industryInterests.some(interest => currentJob.includes(interest))){
          score += 10;
      }
  }

  return score;
};


// The main controller function
exports.getAlumniMatches = async (req, res) => {
  try {
    // 1. Get the logged-in student's profile
    const studentProfile = await Student.findOne({ userId: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found. Please complete your profile.' });
    }

    // 2. Get all alumni who are available for mentorship
    const allAlumni = await Alumni.find({ mentorshipAvailability: true }).populate('userId', 'fullName email');

    // 3. Calculate score for each alumnus
    const scoredAlumni = allAlumni.map(alumni => {
        return { 
            alumni: alumni, 
            score: calculateMatchScore(studentProfile, alumni) 
        };
    });

    // 4. Sort alumni by score in descending order
    const sortedMatches = scoredAlumni.sort((a, b) => b.score - a.score);

    // 5. Return the top 10 matches (or all if fewer than 10) that have a score > 0
    const topMatches = sortedMatches.filter(match => match.score > 0).slice(0, 10);

    res.json(topMatches);

  } catch (err) {
    console.error('Error getting recommendations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};