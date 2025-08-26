// in routes/recommendationRoutes.js

const express = require('express');
const router = express.Router();
const { getAlumniMatches } = require('../controllers/recommendationController');
const auth = require('../middleware/auth');

// This route is for students to get their personalized matches
router.get('/matches', auth(['Student']), getAlumniMatches);

module.exports = router;