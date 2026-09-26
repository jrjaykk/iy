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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Chat loading error:", error);
    return;
  }

  const recentChatList =
    document.getElementById("recentChatList");

  const allChatList =
    document.getElementById("allChatList");

  recentChatList.innerHTML = "";
  allChatList.innerHTML = "";


  // =========================
  // CREATE CHAT ROW
  // =========================

  function createChatRow(chat, index) {

    const row = document.createElement("div");

    row.className = "chat-history-row";


    // Chat button

    const chatButton =
      document.createElement("button");

    chatButton.className =
      "chat-history-item";

    chatButton.textContent =
      chat.title || "Chat " + (index + 1);


    chatButton.onclick = function () {

      openChat(
        chat.id,
        chat.title || "Chat " + (index + 1)
      );

      toggleMenu();

    };


    // Three dots

    const optionsButton =
      document.createElement("button");

    optionsButton.className =
      "chat-options-btn";

    optionsButton.textContent = "⋮";


    optionsButton.onclick =
      function (event) {

        event.stopPropagation();

        showChatOptions(
          chat.id,
          chat.title,
          optionsButton
        );

      };


    row.appendChild(chatButton);
    row.appendChild(optionsButton);

    return row;
  }


  // =========================
  // RECENT 4 CHATS
  // =========================

  const recentChats =
    data.slice(0, 4);

  recentChats.forEach(
    (chat, index) => {

      recentChatList.appendChild(
        createChatRow(chat, index)
      );

    }
  );


  // =========================
  // ALL CHATS
  // =========================

  data.forEach(
    (chat, index) => {

      allChatList.appendChild(
        createChatRow(chat, index)
      );

    }
  );

}


// =========================
// TOGGLE ALL CHATS
// =========================

function toggleAllChats() {

  const allChatList =
    document.getElementById("allChatList");

  if (!allChatList) {
    console.error("allChatList not found");
    return;
  }

  if (allChatList.style.display === "none") {

    allChatList.style.display = "block";

  } else {

    allChatList.style.display = "none";

  }

}
    
function showChatOptions(chatId, chatTitle, button) {

  // Agar koi purana options menu open hai, use hatao
  const oldMenu = document.querySelector(".chat-options-menu");

  if (oldMenu) {
    oldMenu.remove();
  }

  // Options menu banao
  const menu = document.createElement("div");
  menu.className = "chat-options-menu";

  // Rename button
  const renameBtn = document.createElement("button");
  renameBtn.textContent = "✏️ Rename";

  renameBtn.onclick = function () {
    renameChat(chatId, chatTitle);
    menu.remove();
  };

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️ Delete";

  deleteBtn.onclick = function () {
    deleteChat(chatId);
    menu.remove();
  };

  menu.appendChild(renameBtn);
  menu.appendChild(deleteBtn);

  button.parentElement.appendChild(menu);
}

async function deleteChat(chatId) {

  const confirmDelete = confirm(
    "Are you sure you want to delete this chat?"
  );

  if (!confirmDelete) return;

  const { error } = await supabaseClient
    .from("chats")
    .delete()
    .eq("id", chatId);

  if (error) {
    console.error("Delete chat error:", error);
    alert("Unable to delete chat.");
    return;
  }

  if (currentChatId === chatId) {
    currentChatId = null;

    document.getElementById("chatTitle").textContent =
      "Welcome to IY";

    document.getElementById("chatMessages").innerHTML =
      '<div class="ai-message">Hello! I\'m IY. How can I help you?</div>';
  }

  await loadChats();
}

    // RENAME BUTTON



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

let isSending = false;

async function sendMessage() {

  if (isSending) return;
  
  const input =
    document.getElementById("chatInput");

  const message =
    input.value.trim();

  if (!message) return;

  isSending = true;

  // Create chat if no chat is selected

  if (!currentChatId) {
    await createNewChat();
  }

  if (!currentChatId) return;


  // Get logged-in user

  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.log("User not logged in.");
    return;
  }


  // Save user message

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


  // Show message

  addChatMessage(
    "user",
    message
  );


  // =========================
  // AUTOMATIC CHAT TITLE
  // =========================

  const { data: currentChat, error: chatError } =
    await supabaseClient
      .from("chats")
      .select("title")
      .eq("id", currentChatId)
      .single();

  if (!chatError && currentChat) {

    if (currentChat.title === "New Chat") {

      let autoTitle = message.trim();

      if (autoTitle.length > 30) {
        autoTitle =
          autoTitle.substring(0, 30) + "...";
      }

      await supabaseClient
        .from("chats")
        .update({
          title: autoTitle
        })
        .eq("id", currentChatId);

      document.getElementById("chatTitle").textContent =
        autoTitle;

      await loadChats();
    }
  }

  // =========================
// SEND MESSAGE TO IY BACKEND
// =========================

try {

  console.log("Sending message to backend:", message);
  const {
  data: { session },
  error: sessionError
} = await supabaseClient.auth.getSession();

if (sessionError || !session) {
  console.log("User session not found.");
  addChatMessage("assistant", "Please login again.");
  return;
}

const response = await fetch(
  "https://iy-backend-2.onrender.com/api/chat",
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "Authorization": Bearer ${session.access_token}
    },

    body: JSON.stringify({
      message: message
    })
  }
);

  const data = await response.json();
  console.log("Backend response:", data);


  if (!response.ok || !data.success) {

    console.error("Backend error:", data);

    addChatMessage(
      "assistant",
      "Sorry, backend se response nahi mila."
    );

    return;
  }


  // Show IY response

  addChatMessage(
    "assistant",
    data.reply
  );

  // =========================
// SAVE IY RESPONSE
// =========================

const { error: aiMessageError } =
  await supabaseClient
    .from("messages")
    .insert([
      {
        chat_id: currentChatId,
        user_id: user.id,
        role: "assistant",
        content: data.reply
      }
    ]);

if (aiMessageError) {
  console.error("AI message save error:", aiMessageError);
  alert("AI message save nahi hua: " + aiMessageError.message);
} else {
  console.log("AI message successfully saved!");
}

} catch (error) {

  console.error(
    "Backend connection error:",
    error
  );

  addChatMessage(
    "assistant",
    "Backend se connect nahi ho pa raha."
  );
  
}  finally {
  isSending = false;
}

  // Clear input

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


// =========================
// DASHBOARD MENU
// =========================

function toggleMenu() {

  const menu =
    document.getElementById("dashboardMenu");

  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }

}

// =========================
// RENAME CHAT
// =========================

async function renameChat(chatId, oldTitle) {

  const newTitle =
    prompt("Enter a name for this chat:", oldTitle);

  if (newTitle === null) {
    return;
  }

  const title = newTitle.trim();

  if (!title) {
    alert("Chat name cannot be empty.");
    return;
  }

  const { error } = await supabaseClient
    .from("chats")
    .update({
      title: title
    })
    .eq("id", chatId);

  if (error) {

    console.error("Rename chat error:", error);

    alert("Unable to rename chat.");

    return;
  }

  if (currentChatId === chatId) {

    document.getElementById("chatTitle").textContent =
      title;

  }

  await loadChats();

}

