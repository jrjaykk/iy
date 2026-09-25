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


    // Temporary response
    // AI connection will be added next

    res.json({
      success: true,
      reply: "IY received your message: " + message
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
  console.log(IY backend running on port ${PORT});
});
