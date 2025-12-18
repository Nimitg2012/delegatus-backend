const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Delegatus backend is running securely ✔️");
});

// MAIN AI ROUTE
app.post("/generate", async (req, res) => {
  try {
    const { committee, country, agenda, duration } = req.body;

    if (!process.env.AI_KEY) {
      return res.status(500).json({
        error: "AI key missing on server. Please set AI_KEY in Render Environment Variables."
      });
    }

    const systemPrompt = `
You are an expert Model United Nations speech writer. 
Write a powerful, realistic, diplomatic General Speakers List speech.
Tone must be:
- Serious
- Confident
- Assertive but diplomatic
- UN professional language

Speech must follow structure:
1. Opening with authority
2. National stance related to committee + agenda
3. Critique of inaction / problem
4. Solution-oriented proposals
5. Strong closing line

Country: ${country || "Unknown"}
Committee: ${committee || "UNSC"}
Agenda: ${agenda || "Not specified"}
Speech length should naturally match about ${duration || 90} seconds.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Write the full GSL speech now." }
        ],
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (!data || !data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "AI response failed." });
    }

    res.json({
      success: true,
      text: data.choices[0].message.content
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Server error generating speech"
    });
  }
});

// Render requires this
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Delegatus backend running on port ${PORT}`);
});
