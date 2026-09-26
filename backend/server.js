const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// SUPABASE
// =========================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


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
    // GET USER TOKEN
    // =========================

    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const token = authHeader.slice(7);


    // =========================
    // GET LOGGED-IN USER
    // =========================

    const supabaseUser = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: Bearer ${token}
          }
        }
      }
    );

    const {
      data: { user },
      error: userError
    } = await supabaseUser.auth.getUser(token);

    if (userError || !user) {
      console.error("User auth error:", userError);

      return res.status(401).json({
        success: false,
        error: "Invalid user session"
      });
    }


    // =========================
    // LOAD USER MEMORY
    // =========================

    const {
      data: memories,
      error: memoryError
    } = await supabaseUser
      .from("memory")
      .select("key, value")
      .eq("user_id", user.id);

    if (memoryError) {
      console.error("Memory load error:", memoryError);
    }


    // =========================
    // CREATE MEMORY CONTEXT
    // =========================

    let memoryText = "";

    if (memories && memories.length > 0) {

      memoryText = memories
        .map(item => ${item.key}: ${item.value})
        .join("\n");

    }


    // =========================
    // SAVE NAME TO MEMORY
    // =========================

    const nameMatch = message.match(
      /(?:mera naam|my name is)\s+(.+?)(?:\s+hai|\s+is)?$/i
    );

    if (nameMatch) {

      const name = nameMatch[1].trim();

      const {
        data: existingMemory,
        error: findMemoryError
      } = await supabaseUser
        .from("memory")
        .select("id")
        .eq("user_id", user.id)
        .eq("key", "name")
        .maybeSingle();

      if (findMemoryError) {
        console.error("Memory search error:", findMemoryError);
      } else if (existingMemory) {

        await supabaseUser
          .from("memory")
          .update({
            value: name
          })
          .eq("id", existingMemory.id);

      } else {

        await supabaseUser
          .from("memory")
          .insert({
            user_id: user.id,
            key: "name",
            value: name
          });

      }

      memoryText = name: ${name}\n${memoryText};
    }


    // =========================
    // GEMINI PROMPT
    // =========================

    const prompt = 
You are IY, a personal AI assistant.

Use the user's saved memory when relevant.

User memory:
${memoryText || "No saved memory yet."}

User message:
${message}

Answer naturally and directly.
;


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
                  text: prompt
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


// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`IY backend running on port ${PORT}`);
});
