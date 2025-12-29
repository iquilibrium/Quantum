// verify_schema.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente manualmente
const envPath = path.resolve(process.cwd(), '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let val = match[2] || '';
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            envVars[match[1]] = val;
        }
    });
}

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Falha ao ler credenciais do .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkResources() {
    console.log('🔍 Verificando integridade do banco de dados...');
    console.log(`📡 Conectando em: ${supabaseUrl}`);

    // Teste 1: Verificar se a função RPC 'list_public_tables' existe
    // Essa função está no script que pedi para rodar. Se ela não existir, o script não rodou.
    const { data: tables, error: rpcError } = await supabase.rpc('list_public_tables');

    if (rpcError) {
        console.log('⚠️ Função RPC "list_public_tables" NÃO encontrada.');
        console.log('   Indício forte de que o script SQL NÃO foi executado (ou falhou).');
        console.log('   Erro:', rpcError.message);
    } else {
        console.log('✅ Função RPC encontrada! Tabelas públicas:', tables);
    }

    // Teste 2: Tentar selecionar da tabela 'courses'
    console.log('🔍 Tentando ler tabela "courses"...');
    const { data: courses, error: courseError } = await supabase.from('courses').select('id').limit(1);

    if (courseError) {
        console.error('❌ ERRO ao acessar "courses":', courseError.message);
        if (courseError.code === '42P01') {
            console.error('   CONFIRMADO: A tabela "courses" NÃO existe.');
        }
    } else {
        console.log('✅ Tabela "courses" acessada com sucesso.');
    }

    // Teste 3: Tentar selecionar da tabela 'profiles'
    console.log('🔍 Tentando ler tabela "profiles"...');
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('id').limit(1);

    if (profileError) {
        console.error('❌ ERRO ao acessar "profiles":', profileError.message);
    } else {
        console.log('✅ Tabela "profiles" acessada com sucesso.');
    }
}

checkResources();
