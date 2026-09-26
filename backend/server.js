const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// OPENAI SETUP
// =========================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IY backend is working"
  });
});


// =========================
// CHAT ROUTE
// =========================

app.post("/api/chat", async (req, res) => {

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }


    // =========================
    // OPENAI REQUEST
    // =========================

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: message
    });


    const reply = response.output_text;


    // =========================
    // SEND RESPONSE
    // =========================

    res.json({
      success: true,
      reply: reply
    });


  } catch (error) {

    console.error("OpenAI / Backend error:", error);

    res.status(500).json({
      success: false,
      error: "AI response failed"
    });

  }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`IY backend running on port ${PORT}`);
});
