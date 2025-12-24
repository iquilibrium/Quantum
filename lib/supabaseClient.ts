import { createClient } from '@supabase/supabase-js';

// Fix for 'Property env does not exist on type ImportMeta'
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Key não encontrados. Verifique seu arquivo .env');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);