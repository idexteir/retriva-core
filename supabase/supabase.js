import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tgbnnnyduouqmgnzwsyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYm5ubnlkdW91cW1nbnp3c3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjU3ODUsImV4cCI6MjA3OTE0MTc4NX0.3zpwrXPA8LGgImxg-81MzEQEzH63EB_WgI1NvVCobnI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized');

export default supabase;
