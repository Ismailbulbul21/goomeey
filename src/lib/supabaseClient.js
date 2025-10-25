import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for local testing
const supabaseUrl = 'https://dotjwzfbofdfjpfaniuy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGp3emZib2ZkZmpwZmFuaXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjY4NDQsImV4cCI6MjA3NjgwMjg0NH0.KIQ2DbeJEnqfH6gCvRYS-1O_9OtqAMzSM824qEHjO6U';

// Fallback to environment variables if available (for production)
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dotjwzfbofdfjpfaniuy.supabase.co';
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGp3emZib2ZkZmpwZmFuaXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjY4NDQsImV4cCI6MjA3NjgwMjg0NH0.KIQ2DbeJEnqfH6gCvRYS-1O_9OtqAMzSM824qEHjO6U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

