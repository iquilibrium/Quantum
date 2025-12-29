import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Acesso direto às variáveis de ambiente do Vite (Padrão)
// Casting import.meta to any to avoid TypeScript errors if vite/client types are missing
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

// Debug: Verificar se as variáveis estão sendo lidas (sem expor a chave inteira no console)
if (env?.DEV) {
  console.log('[Supabase Client] Inicializando...');
  console.log('[Supabase Client] URL:', supabaseUrl ? 'Definida ✅' : 'Ausente ❌');
  console.log('[Supabase Client] Key:', supabaseAnonKey ? 'Definida (***) ✅' : 'Ausente ❌');
}

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('[Supabase Client] Erro fatal ao criar cliente:', error);
  }
} else {
  console.warn('[Supabase Client] ⚠️ Variáveis de ambiente ausentes. O app usará dados Mock.');
}

export const supabase = client;