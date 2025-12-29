-- Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student'::TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  progress INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}'::TEXT[],
  last_access TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles (serão criadas ou atualizadas)
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE TO authenticated USING (auth.uid() = id);

-- Função para inserir perfil quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING; -- Evita erro se o perfil já existir
  RETURN new;
END;
$$;

-- Trigger para a função handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  course_cover_url TEXT,
  certificate_config JSONB
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conteúdo é público para leitura" ON public.courses
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update courses" ON public.courses
FOR UPDATE TO authenticated USING (true);

-- Tabela de Módulos
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT NOT NULL PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER NOT NULL
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Módulos são públicos para leitura" ON public.modules
FOR SELECT USING (true);

-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT NOT NULL PRIMARY KEY,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_id TEXT,
  duration TEXT,
  content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aulas são públicas para leitura" ON public.lessons
FOR SELECT USING (true);

-- Tabela de Materiais
CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT NOT NULL PRIMARY KEY,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materiais são públicos para leitura" ON public.materials
FOR SELECT USING (true);

-- Tabela de Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT NOT NULL PRIMARY KEY,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes são públicos para leitura" ON public.quizzes
FOR SELECT USING (true);

-- Tabela de Opções de Quiz
CREATE TABLE IF NOT EXISTS public.quiz_options (
  id TEXT NOT NULL PRIMARY KEY,
  quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opções são públicas para leitura" ON public.quiz_options
FOR SELECT USING (true);

-- Tabela de Progresso do Usuário
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam próprio progresso" ON public.user_progress
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela de Configurações de Certificado (redundante se já estiver em courses, mas mantida para completude)
CREATE TABLE IF NOT EXISTS public.certificate_configs (
  course_id TEXT NOT NULL PRIMARY KEY REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT,
  subtitle TEXT,
  body_text TEXT,
  signer_name TEXT,
  signer_role TEXT,
  institution_name TEXT,
  primary_color TEXT,
  display_seal BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.certificate_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Config Certificado pública" ON public.certificate_configs
FOR SELECT USING (true);

-- Inserir dados iniciais para o curso principal se ele não existir
INSERT INTO public.courses (id, title, course_cover_url, certificate_config)
VALUES (
  'c_quantum_full',
  'Mecânica Quântica, Vibração e as 7 Leis Herméticas',
  'https://images.unsplash.com/photo-1518066000714-cdcd82ab5959?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  '{
    "title": "Certificado",
    "subtitle": "de conclusão",
    "bodyText": "Este certificado é orgulhosamente concedido a",
    "signerName": "Dr. Hermes Trismegisto",
    "signerRole": "Diretor Acadêmico Quantum",
    "institutionName": "Quantum",
    "primaryColor": "#7c3aed",
    "displaySeal": true
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  course_cover_url = EXCLUDED.course_cover_url,
  certificate_config = EXCLUDED.certificate_config;