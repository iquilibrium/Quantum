import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Acesso seguro às variáveis de ambiente do Vite
// Usa função helper para evitar erros de leitura em runtime se o env não estiver carregado
const getEnv = (key: string) => {
  try {
    // @ts-ignore - Ignora verificação de tipo para acesso seguro ao import.meta
    return (import.meta as any).env?.[key];
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Erro ao inicializar Supabase:', error);
  }
} else {
  console.warn('⚠️ Supabase URL ou Key não encontrados no .env. A aplicação funcionará com dados Mock locais.');
}

export const supabase = client;