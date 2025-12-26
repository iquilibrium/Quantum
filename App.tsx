
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CoursePlayer } from './components/CoursePlayer';
import { CertificatePreview } from './components/CertificatePreview';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel'; // Import AdminPanel
import { ViewState, User, Course, Module, Lesson, Material, Quiz, QuizOption } from './types';
import { MOCK_USER, MOCK_STUDENTS, COURSE_DATA } from './constants';
import { Button } from './components/Button';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // STATUS DE CONEXÃO E CARREGAMENTO
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | 'missing'>('checking');
  const [dbMessage, setDbMessage] = useState('');
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);

  // LIFT COURSE STATE
  const [courseData, setCourseData] = useState<Course>(COURSE_DATA);

  // INITIALIZE USER STATE WITH PERSISTENCE
  // Tenta carregar do localStorage ou usa o MOCK_USER como fallback
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('quantum_user_v1');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Erro ao carregar usuário salvo", e);
      }
    }
    return { ...MOCK_USER, role: 'coordinator' }; // Default para demo
  });

  // State for List of Students (Admin View)
  const [students, setStudents] = useState<User[]>(MOCK_STUDENTS);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // --- HELPER: Mapear dados do DB (snake_case) para Frontend (camelCase) ---
  const mapDatabaseToCourse = (dbCourse: any): Course => {
    return {
      id: dbCourse.id,
      title: dbCourse.title,
      certificateConfig: dbCourse.certificate_config || COURSE_DATA.certificateConfig,
      modules: (dbCourse.modules || []).sort((a: any, b: any) => a.order_index - b.order_index).map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        isLocked: mod.is_locked,
        isActive: mod.is_active,
        lessons: (mod.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index).map((less: any) => {
          // Processar Quiz (Supabase retorna array no join, pegamos o primeiro ou null)
          let quizData: Quiz = { id: `q_default_${less.id}`, question: 'Quiz não configurado', options: [] };
          if (less.quiz && Array.isArray(less.quiz) && less.quiz.length > 0) {
            const q = less.quiz[0];
            quizData = {
              id: q.id,
              question: q.question,
              options: (q.options || []).map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                isCorrect: opt.is_correct
              }))
            };
          }

          return {
            id: less.id,
            title: less.title,
            description: less.description,
            videoId: less.video_id,
            duration: less.duration,
            content: less.content,
            isActive: less.is_active,
            materials: (less.materials || []).map((mat: any) => ({
              id: mat.id,
              title: mat.title,
              url: mat.url,
              type: mat.type
            })),
            quiz: quizData
          } as Lesson;
        })
      }))
    };
  };

  // TESTE DE CONEXÃO E BUSCA DE DADOS AO INICIAR
  useEffect(() => {
    const initSystem = async () => {
      // Pequeno delay para garantir que o cliente tentou inicializar
      await new Promise(r => setTimeout(r, 500));

      if (!supabase) {
        setDbStatus('missing');
        setDbMessage('Arquivo .env ausente ou chaves inválidas');
        setIsLoadingCourse(false);
        return;
      }

      try {
        // 1. Verifica Conexão
        const { error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;
        setDbStatus('connected');

        if ((import.meta as any).env?.DEV) {
          const { data: tbls } = await supabase.rpc('list_public_tables');
          if (tbls) {
            console.log('DB Tables', tbls);
          }
        }

        // 2. Busca Dados do Curso 'c_quantum_full' (ID usado no script SQL)
        // Usamos uma query profunda para trazer toda a árvore de conteúdo
        const { data: dbData, error: dbError } = await supabase
          .from('courses')
          .select(`
            id, title, certificate_config,
            modules (
              id, title, description, is_locked, is_active, order_index,
              lessons (
                id, title, description, video_id, duration, content, is_active, order_index,
                materials (id, title, url, type),
                quiz:quizzes (
                  id, question,
                  options:quiz_options (id, text, is_correct)
                )
              )
            )
          `)
          .eq('id', 'c_quantum_full')
          .single();

        if (dbError) {
           console.warn("Curso não encontrado no DB ou erro de query. Usando Mock.", dbError);
           // Não lança erro fatal, apenas mantém o COURSE_DATA (Mock)
        } else if (dbData) {
           console.log("Curso carregado do Supabase com sucesso!", dbData);
           const mappedCourse = mapDatabaseToCourse(dbData);
           setCourseData(mappedCourse);
        }

      } catch (err: any) {
        console.error("Erro de inicialização:", err);
        setDbStatus('error');
        setDbMessage(err.message || 'Erro de conexão');
      } finally {
        setIsLoadingCourse(false);
      }
    };

    initSystem();
  }, []);

  // PERSIST USER STATE ON CHANGE
  useEffect(() => {
    localStorage.setItem('quantum_user_v1', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const [activeLessonCoords, setActiveLessonCoords] = useState<{mIndex: number, lIndex: number} | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setIsMobileMenuOpen(false);
  };

  // LÓGICA DE PROGRESSO REAL E DINÂMICO
  const handleCompleteLesson = (lessonId: string) => {
    if (!user.completedLessons.includes(lessonId)) {
      
      // 1. Calcula o total de aulas ativas no curso
      const totalLessons = courseData.modules.reduce((acc, mod) => {
         return acc + (mod.isActive ? mod.lessons.filter(l => l.isActive).length : 0);
      }, 0);

      // 2. Adiciona a nova aula concluída
      const newCompletedList = [...user.completedLessons, lessonId];

      // 3. Calcula a nova porcentagem (0 a 100)
      // Evita divisão por zero caso o curso esteja vazio
      const newProgress = totalLessons > 0 
        ? Math.round((newCompletedList.length / totalLessons) * 100) 
        : 0;

      // 4. Atualiza o estado global (que atualiza Sidebar e Dashboard via props)
      setUser(prev => ({
        ...prev,
        completedLessons: newCompletedList,
        points: prev.points + 50, // Sistema de Gamificação (XP fixo por aula)
        progress: Math.min(newProgress, 100)
      }));
    }
  };

  const handleUpdateUser = (data: Partial<User>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourseData(updatedCourse);
    // TODO: Aqui idealmente salvaríamos de volta no Supabase em uma aplicação real de produção
    // Por enquanto, atualiza apenas o estado local para experiência fluida
  };

  const handleUpdateStudent = (updatedStudent: User) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleSelectLessonFromSidebar = (mIndex: number, lIndex: number) => {
    setActiveLessonCoords({ mIndex, lIndex });
    setCurrentView('course');
    setIsMobileMenuOpen(false); 
  };

  // --- TELA DE CARREGAMENTO INICIAL ---
  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
         <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg shadow-brand-500/50">
             <span className="text-3xl text-white font-bold">Q</span>
         </div>
         <h2 className="text-white text-xl font-bold mb-2">Sincronizando Plataforma</h2>
         <p className="text-slate-400 text-sm mb-6">Conectando ao banco de dados quântico...</p>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
         </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-200 dark:shadow-none">
              <span className="text-3xl text-white font-bold">Q</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bem-vindo ao Quantum</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Plataforma de ensino consciente.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                defaultValue="aluno@quantum.edu"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
              <input 
                type="password" 
                defaultValue="password"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          <div className="pt-2">
            <Button type="submit" fullWidth size="lg">Entrar na Plataforma</Button>
          </div>
        </form>

        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row overflow-hidden transition-colors duration-200">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              Q
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Quantum</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <Sidebar 
        user={user} 
        course={courseData} 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout}
        onSelectLesson={handleSelectLessonFromSidebar}
        activeLesson={activeLessonCoords} // Passando estado ativo
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 md:ml-72 transition-all duration-200 h-full overflow-hidden flex flex-col relative bg-slate-50 dark:bg-slate-900">
        {currentView === 'dashboard' && (
          <div className="flex-1 overflow-y-auto">
             <Dashboard 
                user={user} 
                course={courseData} 
                onResume={() => {
                  setActiveLessonCoords({ mIndex: 0, lIndex: 0 }); 
                  setCurrentView('course');
                }}
              />
          </div>
        )}
        
        {currentView === 'course' && (
          <CoursePlayer 
            course={courseData} 
            completedLessons={user.completedLessons}
            onCompleteLesson={handleCompleteLesson}
            onBack={() => setCurrentView('dashboard')}
            onViewCertificate={() => setCurrentView('certificate')}
            initialModuleIndex={activeLessonCoords?.mIndex || 0}
            initialLessonIndex={activeLessonCoords?.lIndex || 0}
            onLessonChange={(m, l) => setActiveLessonCoords({mIndex: m, lIndex: l})} // Sincronização
          />
        )}

        {currentView === 'certificate' && (
          <CertificatePreview 
            studentName={user.name}
            courseTitle={courseData.title}
            config={courseData.certificateConfig} // Pass config
            onBack={() => setCurrentView('course')}
          />
        )}
        
        {currentView === 'profile' && (
          <div className="flex-1 overflow-y-auto">
            <Profile 
              user={user}
              course={courseData}
              onBack={() => setCurrentView('dashboard')}
              onUpdateUser={handleUpdateUser}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="flex-1 overflow-y-auto">
            <AdminPanel 
              course={courseData} 
              students={students}
              onUpdateCourse={handleUpdateCourse} 
              onUpdateStudent={handleUpdateStudent}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
