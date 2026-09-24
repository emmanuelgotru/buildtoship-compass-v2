import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('btc_supabase_url') || 'https://gnrphhtndvihayqoeghn.supabase.co';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('btc_supabase_anon') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImducnBoaHRuZHZpaGF5cW9lZ2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMjU2NDUsImV4cCI6MjEwNTcwMTY0NX0.Gw0bYE_97nf9vwDrrwyu0sdxyOJjebL-iOw7f623lsk';

export const supabase = SUPABASE_URL && SUPABASE_ANON ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

if (supabase) {
  console.log('✅ Supabase client initialized:', SUPABASE_URL);
} else {
  console.log('⚠️ Supabase not configured');
}
