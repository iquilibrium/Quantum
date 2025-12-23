import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CoursePlayer } from './components/CoursePlayer';
import { CertificatePreview } from './components/CertificatePreview';
import { Profile } from './components/Profile';
import { ViewState, User } from './types';
import { MOCK_USER, COURSE_DATA } from './constants';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User>(MOCK_USER);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State to track which lesson to open in the player
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
    // In a real app, this would call an API
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

  const handleSelectLessonFromSidebar = (mIndex: number, lIndex: number) => {
    setActiveLessonCoords({ mIndex, lIndex });
    setCurrentView('course');
    setIsMobileMenuOpen(false); // Ensure menu closes on mobile immediately
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-200">
              <span className="text-3xl text-white font-bold">Q</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Bem-vindo ao Quantum</h1>
            <p className="text-slate-500 mt-2">Plataforma de ensino consciente.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                defaultValue="aluno@quantum.edu"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input 
                type="password" 
                defaultValue="password"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
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
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              Q
            </div>
            <span className="font-bold text-slate-900">Quantum</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <Sidebar 
        user={user} 
        course={COURSE_DATA}
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout}
        onSelectLesson={handleSelectLessonFromSidebar}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 md:ml-72 transition-all duration-200 h-full overflow-hidden flex flex-col relative">
        {currentView === 'dashboard' && (
          <div className="flex-1 overflow-y-auto">
             <Dashboard 
                user={user} 
                course={COURSE_DATA} 
                onResume={() => {
                  setActiveLessonCoords({ mIndex: 0, lIndex: 0 }); 
                  setCurrentView('course');
                }}
              />
          </div>
        )}
        
        {currentView === 'course' && (
          <CoursePlayer 
            course={COURSE_DATA}
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
            courseTitle={COURSE_DATA.title}
            onBack={() => setCurrentView('course')}
          />
        )}
        
        {currentView === 'profile' && (
          <div className="flex-1 overflow-y-auto">
            <Profile 
              user={user}
              course={COURSE_DATA}
              onBack={() => setCurrentView('dashboard')}
              onUpdateUser={handleUpdateUser}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="p-8 flex items-center justify-center h-full text-slate-400 flex-col gap-4">
            <svg className="w-16 h-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p>Área Administrativa restrita a coordenadores.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;