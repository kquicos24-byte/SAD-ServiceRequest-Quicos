// ============================================================
// Authentication Module
// Handles login, logout, and session management
// ============================================================

// --- Login ---
async function handleLogin(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, user: data.user };
}

// --- Logout ---
async function handleLogout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error("Logout error:", error.message);
  }
  window.location.href = "login.html";
}

// --- Get Current Session ---
async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();
  if (error) {
    console.error("Session error:", error.message);
    return null;
  }
  return session;
}

// --- Get Current User ---
async function getCurrentUser() {
  const session = await getCurrentSession();
  return session ? session.user : null;
}

// --- Guard: Require Auth (for index.html) ---
async function requireAuth() {
  const session = await getCurrentSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session.user;
}

// --- Guard: Redirect if Already Logged In (for login.html) ---
async function redirectIfLoggedIn() {
  const session = await getCurrentSession();
  if (session) {
    window.location.href = "index.html";
  }
}
