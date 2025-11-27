// in controllers/recommendationController.js

const Student = require('../models/Students');
const Alumni = require('../models/Alumni');

// ---------- Tokenization helpers ----------
const toWords = (text) => {
  if (!text) return [];
  if (Array.isArray(text)) return text.flatMap(toWords);
  return String(text).toLowerCase().match(/[a-z0-9]+/g) || [];
};

const addWeighted = (map, tokens, weight = 1) => {
  for (const t of tokens) map[t] = (map[t] || 0) + weight;
};

const cosineSim = (mapA, mapB) => {
  const vocab = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
  let dot = 0, aNorm = 0, bNorm = 0;
  for (const t of vocab) {
    const a = mapA[t] || 0;
    const b = mapB[t] || 0;
    dot += a * b;
    aNorm += a * a;
    bNorm += b * b;
  }
  if (aNorm === 0 || bNorm === 0) return 0;
  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
};

const setFromInstitutional = (profile) => {
  const s = new Set();
  // Common student fields
  toWords(profile?.department)?.forEach(t => s.add(`dept:${t}`));
  toWords(profile?.degree)?.forEach(t => s.add(`deg:${t}`));
  toWords(profile?.industryInterestOrField)?.forEach(t => s.add(`field:${t}`));
  // Alumni education + domain
  if (Array.isArray(profile?.educationHistory)) {
    profile.educationHistory.forEach(e => {
      toWords(e?.institution)?.forEach(t => s.add(`inst:${t}`));
      toWords(e?.degree)?.forEach(t => s.add(`deg:${t}`));
    });
  }
  toWords(profile?.currentJob)?.forEach(t => s.add(`job:${t}`));
  toWords(profile?.currentIndustry)?.forEach(t => s.add(`ind:${t}`));
  return s;
};

const jaccardSim = (setA, setB) => {
  if (!setA?.size || !setB?.size) return 0;
  let inter = 0;
  for (const v of setA) if (setB.has(v)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
};

// ---------- Build feature maps ----------
const buildFeatureMaps = (student, alumni) => {
  const sSkills = {};
  const sInterests = {};
  const aSkills = {};
  const aInterests = {};

  // Student vectors (weights can be tuned)
  addWeighted(sSkills, toWords(student?.skills), 1.0);
  addWeighted(sInterests, toWords(student?.interests), 0.9);
  addWeighted(sInterests, toWords(student?.careerGoal), 1.2);
  addWeighted(sInterests, toWords(student?.industryInterestOrField), 0.8);

  // Alumni vectors
  addWeighted(aSkills, toWords(alumni?.skills), 1.0);
  addWeighted(aInterests, toWords(alumni?.currentJob), 1.0);
  addWeighted(aInterests, toWords(alumni?.educationHistory?.map(e => [e.degree, e.institution])), 0.6);

  return { sSkills, sInterests, aSkills, aInterests };
};

// ---------- Final hybrid score: w1*cos(skills)+w2*cos(interests)+w3*jaccard(domain) ----------
const calculateMatchScore = (student, alumni, weights = { w1: 0.5, w2: 0.35, w3: 0.15 }) => {
  if (!student || !alumni) return 0;

  const { sSkills, sInterests, aSkills, aInterests } = buildFeatureMaps(student, alumni);
  const skillsCos = cosineSim(sSkills, aSkills);
  const interestsCos = cosineSim(sInterests, aInterests);

  const sInst = setFromInstitutional(student);
  const aInst = setFromInstitutional(alumni);
  const instJac = jaccardSim(sInst, aInst);

  const { w1, w2, w3 } = weights; // w1+w2+w3=1
  const score01 = w1 * skillsCos + w2 * interestsCos + w3 * instJac;
  return Math.round(score01 * 100); // scale to 0–100
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
    const scoredAlumni = allAlumni.map(alumni => ({
      alumni,
      score: calculateMatchScore(studentProfile, alumni),
    }));

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