const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  const { message } = req.body;
  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{ parts: [{ text: message }] }]
      }
    );
    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand.";
    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message || err);
    res.json({ reply: "Error connecting to AI..." });
  }
});

module.exports = router;