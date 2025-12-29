import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CoursePlayer } from './components/CoursePlayer';
import { CertificatePreview } from './components/CertificatePreview';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import LoginPage from './src/pages/Login'; // Import the new Login page
import { ViewState, User, Course, Module, Lesson, Material, Quiz, QuizOption } from './types';
import { MOCK_USER, MOCK_STUDENTS, COURSE_DATA } from './constants';
import { Button } from './components/Button';
import { supabase } from './src/integrations/supabase/client'; // Corrected path
import { showSuccess, showError, showLoading, dismissToast } from './utils/toast';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | 'missing'>('checking');
  const [dbMessage, setDbMessage] = useState('');

  const [courseData, setCourseData] = useState<Course>(COURSE_DATA);

  const [user, setUser] = useState<User | null>(null); // User can be null initially

  const [students, setStudents] = useState<User[]>(MOCK_STUDENTS);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  const [activeLessonCoords, setActiveLessonCoords] = useState<{mIndex: number, lIndex: number} | null>(null);

  // --- HELPER: Mapear dados do DB (snake_case) para Frontend (camelCase) ---
  const mapDatabaseToCourse = (dbCourse: any): Course => {
    return {
      id: dbCourse.id,
      title: dbCourse.title,
      courseCoverUrl: dbCourse.course_cover_url,
      certificateConfig: dbCourse.certificate_config || COURSE_DATA.certificateConfig,
      modules: (dbCourse.modules || []).sort((a: any, b: any) => a.order_index - b.order_index).map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        isLocked: mod.is_locked,
        isActive: mod.is_active,
        lessons: (mod.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index).map((less: any) => {
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

  // --- AUTH STATE LISTENER ---
  useEffect(() => {
    if (!supabase) {
      setDbStatus('missing');
      setDbMessage('Supabase client not initialized. Check your .env variables.');
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsAuthenticated(true);
        // Fetch user profile from 'profiles' table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          showError("Erro ao carregar perfil do usuário.");
          // Fallback to a basic user if profile not found
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email || 'Usuário',
            email: session.user.email || '',
            avatarUrl: session.user.user_metadata.avatar_url || 'https://i.pravatar.cc/150?img=68',
            role: 'student', // Default role
            isActive: true,
            progress: 0,
            points: 0,
            level: 1,
            badges: [],
            completedLessons: [],
            lastAccess: new Date().toLocaleDateString('pt-BR')
          });
        } else if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.avatar_url || 'https://i.pravatar.cc/150?img=68',
            role: profile.role,
            isActive: profile.is_active,
            progress: profile.progress,
            points: profile.points,
            level: profile.level,
            badges: profile.badges,
            completedLessons: [], // TODO: Fetch from user_progress table
            lastAccess: profile.last_access ? new Date(profile.last_access).toLocaleDateString('pt-BR') : 'N/A'
          });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  // TESTE DE CONEXÃO E BUSCA DE DADOS AO INICIAR
  useEffect(() => {
    const initSystem = async () => {
      if (!supabase) {
        setDbStatus('missing');
        setDbMessage('Arquivo .env ausente ou chaves inválidas');
        return;
      }

      try {
        setDbStatus('connected');

        if ((import.meta as any).env?.DEV) {
          const { data: tbls } = await supabase.rpc('list_public_tables');
          if (tbls) {
            console.log('DB Tables', tbls);
          }
        }

        const { data: dbData, error: dbError } = await supabase
          .from('courses')
          .select(`
            id, title, course_cover_url, certificate_config,
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
        } else if (dbData) {
           console.log("Curso carregado do Supabase com sucesso!", dbData);
           const mappedCourse = mapDatabaseToCourse(dbData);
           setCourseData(mappedCourse);
        }

        const { data: dbStudents, error: studentsError } = await supabase
          .from('profiles')
          .select('*');

        if (studentsError) {
          console.error("Erro ao carregar alunos do Supabase:", studentsError);
        } else if (dbStudents) {
          const mappedStudents: User[] = dbStudents.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            avatarUrl: s.avatar_url || 'https://i.pravatar.cc/150?img=68',
            role: s.role,
            isActive: s.is_active,
            progress: s.progress,
            points: s.points,
            level: s.level,
            badges: s.badges,
            completedLessons: [],
            lastAccess: s.last_access ? new Date(s.last_access).toLocaleDateString('pt-BR') : 'N/A'
          }));
          setStudents(mappedStudents);
        }

      } catch (err: any) {
        console.error("Erro de inicialização:", err);
        setDbStatus('error');
        setDbMessage(err.message || 'Erro de conexão');
      }
    };

    initSystem();
  }, []);

  // PERSIST USER STATE ON CHANGE (if user is logged in)
  useEffect(() => {
    if (user) {
      localStorage.setItem('quantum_user_v1', JSON.stringify(user));
    } else {
      localStorage.removeItem('quantum_user_v1');
    }
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
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Erro ao fazer logout: " + error.message);
    } else {
      showSuccess("Logout realizado com sucesso!");
      setCurrentView('dashboard');
      setIsMobileMenuOpen(false);
      setUser(null); // Clear user state on logout
    }
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (!user || user.completedLessons.includes(lessonId)) {
      return;
    }
      
    const totalLessons = courseData.modules.reduce((acc, mod) => {
        return acc + (mod.isActive ? mod.lessons.filter(l => l.isActive).length : 0);
    }, 0);

    const newCompletedList = [...user.completedLessons, lessonId];

    const newProgress = totalLessons > 0 
      ? Math.round((newCompletedList.length / totalLessons) * 100) 
      : 0;

    setUser(prev => prev ? ({
      ...prev,
      completedLessons: newCompletedList,
      points: prev.points + 50,
      progress: Math.min(newProgress, 100)
    }) : null);
  };

  const handleUpdateUser = (data: Partial<User>) => {
    setUser(prev => prev ? ({ ...prev, ...data }) : null);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourseData(updatedCourse);
  };

  const handleUpdateStudent = (updatedStudent: User) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleAddStudent = async (studentData: { name: string; email: string; password: string; avatarUrl?: string }) => {
    if (!supabase) {
      throw new Error("Supabase client not initialized.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: studentData.email,
      password: studentData.password,
      options: {
        data: {
          full_name: studentData.name,
          avatar_url: studentData.avatarUrl || 'https://i.pravatar.cc/150?img=68',
        },
      },
    });

    if (error) {
      console.error("Erro ao cadastrar aluno no Supabase:", error);
      throw error;
    }

    if (data.user) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil do novo aluno:", profileError);
        throw profileError;
      }

      if (newProfile) {
        const newUser: User = {
          id: newProfile.id,
          name: newProfile.name,
          email: newProfile.email,
          avatarUrl: newProfile.avatar_url || 'https://i.pravatar.cc/150?img=68',
          role: newProfile.role,
          isActive: newProfile.is_active,
          progress: newProfile.progress,
          points: newProfile.points,
          level: newProfile.level,
          badges: newProfile.badges,
          completedLessons: [],
          lastAccess: newProfile.last_access ? new Date(newProfile.last_access).toLocaleDateString('pt-BR') : 'N/A'
        };
        setStudents(prev => [...prev, newUser]);
      }
    }
  };

  const handleSelectLessonFromSidebar = (mIndex: number, lIndex: number) => {
    setActiveLessonCoords({ mIndex, lIndex });
    setCurrentView('course');
    setIsMobileMenuOpen(false); 
  };

  if (!isAuthenticated || !user) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
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
        activeLesson={activeLessonCoords}
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
            onLessonChange={(m, l) => setActiveLessonCoords({mIndex: m, lIndex: l})}
          />
        )}

        {currentView === 'certificate' && (
          <CertificatePreview 
            studentName={user.name}
            courseTitle={courseData.title}
            config={courseData.certificateConfig}
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
              onAddStudent={handleAddStudent}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;