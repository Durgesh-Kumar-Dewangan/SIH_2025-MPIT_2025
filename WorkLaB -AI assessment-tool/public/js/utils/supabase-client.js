// Supabase Client Configuration
const SUPABASE_URL = 'https://mumrslkcdzlilzzpjulg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bXJzbGtjZHpsaWx6enBqdWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTgzMDgsImV4cCI6MjA3ODA5NDMwOH0.UkpxgMkO9uVZc1cK89G4PjD7yrBcYsjJBboU04oetTw';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth state management
let currentUser = null;

// Initialize auth state
async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    
    if (event === 'SIGNED_IN') {
      window.router.navigate('/');
    } else if (event === 'SIGNED_OUT') {
      window.router.navigate('/auth');
    }
  });
  
  return currentUser;
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
  return currentUser !== null;
}

// Sign up
async function signUp(email, password, fullName) {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName
      }
    }
  });
  
  if (error) throw error;
  return data;
}

// Sign in
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Export for global use
window.supabase = supabase;
window.auth = {
  initAuth,
  getCurrentUser,
  isAuthenticated,
  signUp,
  signIn,
  signOut
};
