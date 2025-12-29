-- Script para configurar o Storage do Supabase (Buckets e Políticas)
-- Rode este script no SQL Editor do Supabase Dashboard

-- 1. Criar o bucket 'avatars' (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar o bucket 'course-covers' (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-covers', 'course-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Habilitar RLS (Geralmente já vem habilitado, removendo para evitar erro de permissão)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS PARA O BUCKET 'avatars'

-- Verificar e remover políticas antigas para evitar duplicidade/erros
DROP POLICY IF EXISTS "Avatars são públicos para visualização" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus próprios avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatars" ON storage.objects;

-- Política de Leitura Pública
CREATE POLICY "Avatars são públicos para visualização"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Política de Upload (Insert) - Autenticados podem fazer upload
CREATE POLICY "Usuários podem fazer upload de seus próprios avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- Política de Update - Usuários podem atualizar seus próprios arquivos (opcional, mas bom ter)
CREATE POLICY "Usuários podem atualizar seus próprios avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );


-- 5. POLÍTICAS PARA O BUCKET 'course-covers'

DROP POLICY IF EXISTS "Capas de cursos são públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem subir capas" ON storage.objects;

-- Política de Leitura Pública
CREATE POLICY "Capas de cursos são públicas"
ON storage.objects FOR SELECT
USING ( bucket_id = 'course-covers' );

-- Política de Upload - Autenticados podem subir capas
CREATE POLICY "Usuários autenticados podem subir capas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'course-covers' );
