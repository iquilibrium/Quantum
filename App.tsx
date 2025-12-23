
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // INITIALIZE USER AS COORDINATOR FOR DEMO PURPOSES
  const [user, setUser] = useState<User>({
    ...MOCK_USER,
    role: 'coordinator' // Force admin role for this request
  });

  // State for List of Students (Admin View)
  const [students, setStudents] = useState<User[]>(MOCK_STUDENTS);
  
  // LIFT COURSE STATE
  const [courseData, setCourseData] = useState<Course>(COURSE_DATA);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  const handleCompleteLesson = (lessonId: string) => {
    if (!user.completedLessons.includes(lessonId)) {
      setUser(prev => ({
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        points: prev.points + 50,
        progress: Math.min(prev.progress + 5, 100)
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
          
          <p className="text-center text-xs text-slate-400 mt-8">
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
          />
        )}

        {currentView === 'certificate' && (
          <CertificatePreview 
            studentName={user.name}
            courseTitle={courseData.title}
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
