const SUPABASE_URL = "https://dfumqvvwuluouhcnrgwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zm5tDbYxidKSQed1cRnk8w_gqVTT4da";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// =========================
// AUTH MODAL
// =========================

function openAuth() {
  document.getElementById("authBox").style.display = "flex";
}

function closeAuth() {
  document.getElementById("authBox").style.display = "none";
  document.getElementById("message").textContent = "";
}


// =========================
// SIGN UP
// =========================

async function signUp() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    document.getElementById("message").textContent =
      "Please enter email and password.";
    return;
  }

  const { error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    document.getElementById("message").textContent =
      error.message;
    return;
  }

  document.getElementById("message").textContent =
    "Account created successfully! You can now login.";
}


// =========================
// LOGIN
// =========================

async function signIn() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    document.getElementById("message").textContent =
      "Please enter email and password.";
    return;
  }

  const { error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    document.getElementById("message").textContent =
      error.message;
    return;
  }

  showDashboard();
}


// =========================
// SHOW DASHBOARD
// =========================

function showDashboard() {
  document.querySelector(".navbar").style.display = "none";
  document.querySelector(".hero").style.display = "none";

  document.getElementById("authBox").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  loadChats();
}


// =========================
// LOGOUT
// =========================

async function logout() {
  await supabaseClient.auth.signOut();

  currentChatId = null;

  document.getElementById("dashboard").style.display = "none";

  document.querySelector(".navbar").style.display = "flex";
  document.querySelector(".hero").style.display = "flex";
}


// =========================
// CHECK EXISTING LOGIN
// =========================

async function checkUser() {
  const { data } =
    await supabaseClient.auth.getSession();

  if (data.session) {
    showDashboard();
  }
}

checkUser();


// =========================
// CHAT SYSTEM
// =========================

let currentChatId = null;


// =========================
// LOAD USER CHATS
// =========================

async function loadChats() {

  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.log("User not logged in");
    return;
  }

  const { data, error } = await supabaseClient
    .from("chats")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Chat loading error:", error);
    return;
  }

  const chatList =
    document.getElementById("chatList");

  chatList.innerHTML = "";

  data.forEach((chat, index) => {

    const button =
      document.createElement("button");

    button.className =
      "chat-history-item";

    button.textContent =
      chat.title || "Chat " + (index + 1);

    button.onclick = function () {
      openChat(chat.id, chat.title);
    };

    chatList.appendChild(button);

  });
}


// =========================
// CREATE NEW CHAT
// =========================

async function createNewChat() {

  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    alert("Please login first.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("chats")
    .insert([
      {
        user_id: user.id,
        title: "New Chat"
      }
    ])
    .select()
    .single();
  if (error) {
    console.error("Create chat error:", error);
    alert("Unable to create new chat.");
    return;
  }

  currentChatId = data.id;

  document.getElementById("chatTitle").textContent =
    data.title;

  document.getElementById("chatMessages").innerHTML = "";

  await loadChats();
}


// =========================
// OPEN CHAT
// =========================

async function openChat(chatId, title) {

  currentChatId = chatId;

  document.getElementById("chatTitle").textContent =
    title || "Chat";

  const chatMessages =
    document.getElementById("chatMessages");

  chatMessages.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Message loading error:", error);
    return;
  }

  data.forEach(message => {

    addChatMessage(
      message.role,
      message.content
    );

  });
}


// =========================
// ADD MESSAGE TO UI
// =========================

function addChatMessage(role, content) {

  const chatMessages =
    document.getElementById("chatMessages");

  const messageDiv =
    document.createElement("div");

  if (role === "user") {

    messageDiv.style.textAlign = "right";
    messageDiv.style.margin = "10px 0";

    const messageBubble =
      document.createElement("span");

    messageBubble.style.background = "white";
    messageBubble.style.color = "black";
    messageBubble.style.padding = "10px 14px";
    messageBubble.style.borderRadius = "10px";
    messageBubble.style.display = "inline-block";

    messageBubble.textContent = content;

    messageDiv.appendChild(messageBubble);

  } else {

    messageDiv.className = "ai-message";
    messageDiv.textContent = content;

  }

  chatMessages.appendChild(messageDiv);
}


// =========================
// SEND MESSAGE
// =========================

async function sendMessage() {

  const input =
    document.getElementById("chatInput");

  const message =
    input.value.trim();

  if (!message) return;


  // Create a chat automatically
  // if no chat is currently selected

  if (!currentChatId) {
    await createNewChat();
  }

  if (!currentChatId) return;


  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.log("User not logged in.");
    return;
  }


  // Save USER message in Supabase

  const { error } = await supabaseClient
    .from("messages")
    .insert([
      {
        chat_id: currentChatId,
        user_id: user.id,
        role: "user",
        content: message
      }
    ]);

  if (error) {
    console.error("Message save error:", error);
    return;
  }


  // Show message on screen

  addChatMessage(
    "user",
    message
  );

  input.value = "";
}


// =========================
// ENTER TO SEND
// =========================

function handleChatKey(event) {

  if (event.key === "Enter") {
    sendMessage();
  }

}


// =========================
// PERSONAL MEMORY
// =========================

function showMemory() {

  alert(
    "Personal Memory will be connected in the next step."
  );

}
