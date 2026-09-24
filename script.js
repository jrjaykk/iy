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

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    document.getElementById("message").textContent = error.message;
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

  const { data, error } =
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
}


// =========================
// LOGOUT
// =========================

async function logout() {

  await supabaseClient.auth.signOut();

  document.getElementById("dashboard").style.display = "none";

  document.querySelector(".navbar").style.display = "flex";
  document.querySelector(".hero").style.display = "flex";
}


// =========================
// TEST CHAT
// =========================

function sendMessage() {

  const input = document.getElementById("chatInput");

  const message = input.value.trim();

  if (!message) return;

  const chatMessages =
    document.getElementById("chatMessages");

  chatMessages.innerHTML += 
    <div style="text-align:right; margin:10px 0;">
      <span style="
        background:white;
        color:black;
        padding:10px 14px;
        border-radius:10px;
        display:inline-block;
      ">
        ${message}
      </span>
    </div>
  ;

  input.value = "";
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
