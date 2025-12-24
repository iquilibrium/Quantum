
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CoursePlayer } from './components/CoursePlayer';
import { CertificatePreview } from './components/CertificatePreview';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel'; // Import AdminPanel
import { ViewState, User, Course } from './types';
import { MOCK_USER, MOCK_STUDENTS, COURSE_DATA } from './constants';
import { Button } from './components/Button';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // STATUS DE CONEXÃO COM BANCO DE DADOS
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | 'missing'>('checking');
  const [dbMessage, setDbMessage] = useState('');

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

  // TESTE DE CONEXÃO AO INICIAR
  useEffect(() => {
    const checkConnection = async () => {
      if (!supabase) {
        setDbStatus('missing');
        setDbMessage('Chaves .env não encontradas');
        return;
      }

      try {
        // Tentamos uma chamada leve ao sistema de Auth para validar a chave e URL
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setDbStatus('connected');
        setDbMessage('Conexão Supabase OK');
      } catch (err: any) {
        console.error("Erro de conexão Supabase:", err);
        setDbStatus('error');
        setDbMessage(err.message || 'Erro de conexão');
      }
    };

    checkConnection();
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
  };

  const handleUpdateStudent = (updatedStudent: User) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleSelectLessonFromSidebar = (mIndex: number, lIndex: number) => {
    setActiveLessonCoords({ mIndex, lIndex });
    setCurrentView('course');
    setIsMobileMenuOpen(false); 
  };

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

          {/* INDICADOR DE STATUS DO SUPABASE */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Banco de Dados:</span>
              <div className="flex items-center gap-2">
                {dbStatus === 'checking' && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                     <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Verificando...
                  </span>
                )}
                {dbStatus === 'connected' && (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                     </span>
                     Conectado
                  </span>
                )}
                {(dbStatus === 'error' || dbStatus === 'missing') && (
                  <span className="flex items-center gap-1.5 text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full" title={dbMessage}>
                     <span className="w-2 h-2 rounded-full bg-red-500"></span>
                     {dbStatus === 'missing' ? 'Config Ausente' : 'Erro de Conexão'}
                  </span>
                )}
              </div>
            </div>
            {(dbStatus === 'error' || dbStatus === 'missing') && (
               <p className="text-[10px] text-red-400 mt-2 text-center bg-red-50 dark:bg-slate-900 p-2 rounded border border-red-100 dark:border-slate-700">
                  {dbMessage}. Verifique seu arquivo <code>.env</code>.
               </p>
            )}
          </div>
          
          <p className="text-center text-xs text-slate-400 mt-4">
            v1.0 • Desenvolvido para PRD Quantum
          </p>
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
