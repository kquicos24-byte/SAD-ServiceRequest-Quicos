// Supabase Client Initialization
// Replace with your actual Supabase project credentials
const SUPABASE_URL = "https://tiknfpvuwhssjmdvzokh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpa25mcHZ1d2hzc2ptZHZ6b2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjg1NTcsImV4cCI6MjEwNDYwNDU1N30.73NJq1DY1WwBoYRE528zj-Z2D9LnMzNfnM-XViWWpoE";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
