import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables! Ensure VITE_SUPABASE_URL or SUPABASE_URL are set.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const APPOINTMENTS_TABLE = import.meta.env.VITE_SUPABASE_APPOINTMENTS_TABLE || import.meta.env.SUPABASE_APPOINTMENTS_TABLE || 'appointments';
