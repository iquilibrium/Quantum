-- Esta política permite que qualquer usuário autenticado atualize qualquer curso.
-- Se você precisar de um controle mais granular (ex: apenas admins), isso precisaria ser ajustado.

-- Corrigindo a política para a tabela 'courses'
DROP POLICY IF EXISTS "Allow authenticated users to update courses" ON public.courses;

CREATE POLICY "Allow authenticated users to update courses"
ON public.courses
FOR UPDATE
TO authenticated
USING (true);