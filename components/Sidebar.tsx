
import React from 'react';
import { ViewState, User, Course } from '../types';
import { Button } from './Button';

interface SidebarProps {
  user: User;
  course: Course;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  onSelectLesson: (moduleIndex: number, lessonIndex: number) => void;
  activeLesson: { mIndex: number, lIndex: number } | null; // Novo prop para destaque
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChartIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CheckCircleIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 text-green-500 flex-shrink-0 ${className}`} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const PlayIcon = ({ active }: { active?: boolean }) => (
  <svg className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-500 dark:group-hover:text-brand-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  course,
  currentView, 
  onChangeView, 
  onLogout,
  onSelectLesson,
  activeLesson,
  isOpen,
  onClose,
  theme,
  toggleTheme
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <div 
        className={`
          fixed top-0 left-0 h-screen w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 flex flex-col overflow-hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
              Q
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Quantum</span>
          </div>
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation & Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="p-4 space-y-1">
            {/* Main Links */}
            <button
              onClick={() => {
                onChangeView('dashboard');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out mb-6 ${
                currentView === 'dashboard' 
                  ? 'bg-brand-50 dark:bg-slate-700/50 text-brand-700 dark:text-brand-300' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HomeIcon active={currentView === 'dashboard'} />
              Dashboard
            </button>

            {/* Course Content Tree */}
            <div className="px-2 mb-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">
                Conteúdo do Curso
              </h3>
              
              <div className="space-y-6">
                {course.modules.map((module, mIdx) => {
                  // Se o módulo estiver inativo e o usuário não for coordenador, não renderiza
                  if (!module.isActive && user.role !== 'coordinator') return null;

                  return (
                    <div key={module.id} className={`space-y-1 ${!module.isActive ? 'opacity-50 grayscale' : ''}`}>
                        {/* Module Header */}
                        <div className="flex items-center justify-between px-2">
                            <div className={`text-sm font-bold ${module.isLocked ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}>
                              {module.title}
                            </div>
                            {!module.isActive && <span className="text-[10px] uppercase bg-slate-200 dark:bg-slate-700 text-slate-500 px-1 rounded">Inativo</span>}
                        </div>
                        
                        {/* Lessons List */}
                        <div className="space-y-0.5 relative pl-2">
                        {/* Vertical line for tree structure */}
                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-700"></div>

                        {module.lessons.map((lesson, lIdx) => {
                            // Se a aula estiver inativa e o usuário não for coordenador, não renderiza
                            if (!lesson.isActive && user.role !== 'coordinator') return null;

                            const isCompleted = user.completedLessons.includes(lesson.id);
                            
                            // Check if active
                            const isActiveLesson = activeLesson?.mIndex === mIdx && activeLesson?.lIndex === lIdx;

                            // Check if locked logic
                            let isLocked = module.isLocked;
                            if (!isLocked) {
                              if (lIdx === 0 && mIdx === 0) {
                                isLocked = false;
                              } else if (lIdx > 0) {
                                const prevLessonId = module.lessons[lIdx - 1].id;
                                if (!user.completedLessons.includes(prevLessonId)) isLocked = true;
                              } else if (mIdx > 0) {
                                const prevModule = course.modules[mIdx - 1];
                                const lastLessonPrevModule = prevModule.lessons[prevModule.lessons.length - 1];
                                if (!user.completedLessons.includes(lastLessonPrevModule.id)) isLocked = true;
                              }
                            }

                            return (
                            <button
                                key={lesson.id}
                                disabled={isLocked}
                                onClick={() => {
                                onSelectLesson(mIdx, lIdx);
                                onClose(); // Auto-close menu on mobile selection
                                }}
                                className={`
                                relative w-full flex items-start gap-2.5 px-3 py-2 text-left rounded-md transition-all duration-300 ease-in-out group ml-1
                                ${!lesson.isActive ? 'opacity-50' : ''}
                                ${isLocked 
                                    ? 'opacity-60 cursor-not-allowed' 
                                    : isActiveLesson 
                                      ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-semibold ring-1 ring-brand-200 dark:ring-brand-700 shadow-sm' 
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/80 cursor-pointer text-slate-600 dark:text-slate-400'
                                }
                                `}
                            >
                                <div className="mt-0.5">
                                {isCompleted ? <CheckCircleIcon className="animate-scale-in origin-center" /> : (isLocked ? <LockIcon /> : <PlayIcon active={isActiveLesson} />)}
                                </div>
                                <span className={`text-xs leading-relaxed ${isCompleted ? 'text-slate-500 dark:text-slate-500 font-normal' : (isActiveLesson ? '' : 'group-hover:text-brand-700 dark:group-hover:text-brand-300')}`}>
                                {lesson.title}
                                {!lesson.isActive && <span className="ml-2 text-[9px] uppercase bg-slate-200 dark:bg-slate-700 text-slate-500 px-1 rounded">Off</span>}
                                </span>
                            </button>
                            );
                        })}
                        </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {user.role === 'coordinator' && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                 <button
                  onClick={() => {
                    onChangeView('admin');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out ${
                    currentView === 'admin' 
                      ? 'bg-brand-50 dark:bg-slate-700/50 text-brand-700 dark:text-brand-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ChartIcon active={currentView === 'admin'} />
                  Administração
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          
          <div 
            onClick={() => {
              onChangeView('profile');
              onClose();
            }}
            className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-all duration-300 -mx-2"
          >
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Nível {user.level}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-600 h-1.5 rounded-full mb-4 overflow-hidden">
            <div 
              className="bg-brand-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${user.progress}%` }}
            />
          </div>

          <div className="flex gap-2">
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <Button 
                variant="outline" 
                size="sm" 
                fullWidth 
                onClick={onLogout}
                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
                Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
