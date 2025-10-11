const express = require("express");
const axios = require("axios");
const router = express.Router();

// simple in-memory cache to avoid repeat LLM calls for same question
const cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function getFromCache(key) {
  const v = cache.get(key);
  if (!v) return null;
  if (Date.now() - v.ts > TTL_MS) { cache.delete(key); return null; }
  return v.reply;
}
function setCache(key, reply) {
  cache.set(key, { reply, ts: Date.now() });
}

async function callGemini(message) {
  const key = process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || "models/gemini-2.0-flash";
  if (!key) throw new Error("NO_GEMINI_KEY");
  const url = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${key}`;
  const r = await axios.post(url, { contents: [{ parts: [{ text: message }] }] }, { timeout: 60000 });
  return r.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}

async function callGroq(message) {
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  if (!key) throw new Error("NO_GROQ_KEY");
  const r = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      messages: [
        { role: "system", content: "You are a helpful assistant for students and alumni." },
        { role: "user", content: message }
      ],
      max_tokens: 700,
      temperature: 0.4
    },
    { headers: { Authorization: `Bearer ${key}` }, timeout: 60000 }
  );
  return r.data?.choices?.[0]?.message?.content?.trim();
}



router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ reply: "No message provided" });

  const cached = getFromCache(message.trim());
  if (cached) return res.json({ reply: cached, cached: true });

  try {
    // 1) Try Gemini
    try {
      const reply = await callGemini(message);
      if (reply) { setCache(message.trim(), reply); return res.json({ reply, provider: "gemini" }); }
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data || e.message;
      console.warn("Gemini error:", msg);
      if (status === 429) {
        // tell frontend it was rate-limited (can show “try again in Xs”)
        // then fall through to Groq
      }
    }

    // 2) Fallback to Groq (free dev key)
    try {
      const reply = await callGroq(message);
      if (reply) { setCache(message.trim(), reply); return res.json({ reply, provider: "groq" }); }
    } catch (e) {
      console.warn("Groq error:", e.response?.data || e.message);
    }

    

    return res.status(502).json({ reply: "All providers unavailable. Try again later." });
  } catch (err) {
    console.error("Chat error:", err.response?.data || err.message || err);
    return res.status(502).json({ reply: "Error connecting to AI." });
  }
});

module.exports = router;
