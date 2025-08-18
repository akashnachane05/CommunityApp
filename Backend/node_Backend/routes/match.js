const express = require('express');
const axios = require('axios');
const router = express.Router();

// Match Students to Alumni
router.post('/', async (req, res) => {
  const studentData = req.body;  // Assume the body contains student's skills, location, etc.

  try {
    const response = await axios.post('http://localhost:5000/match', studentData);  // Calling Python API
    const matchedAlumni = response.data;
    res.status(200).json(matchedAlumni);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
