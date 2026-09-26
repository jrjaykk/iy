const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


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
    // GEMINI API
    // =========================

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(500).json({
        success: false,
        error: "Gemini API request failed"
      });
    }


    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gemini did not return a response.";


    // =========================
    // SEND RESPONSE
    // =========================

    res.json({
      success: true,
      reply: reply
    });


  } catch (error) {

    console.error("Backend error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error"
    });

  }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`IY backend running on port ${PORT}`);
});
