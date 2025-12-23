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
  isOpen: boolean;
  onClose: () => void;
}

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChartIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  course,
  currentView, 
  onChangeView, 
  onLogout,
  onSelectLesson,
  isOpen,
  onClose
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
          fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-40 flex flex-col overflow-hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="p-6 border-b border-slate-100 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
              Q
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Quantum</span>
          </div>
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
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
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-6 ${
                currentView === 'dashboard' 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <HomeIcon active={currentView === 'dashboard'} />
              Dashboard
            </button>

            {/* Course Content Tree */}
            <div className="px-2 mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
                Conteúdo do Curso
              </h3>
              
              <div className="space-y-6">
                {course.modules.map((module, mIdx) => (
                  <div key={module.id} className="space-y-1">
                    {/* Module Header */}
                    <div className={`px-2 text-sm font-bold ${module.isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                      {module.title}
                    </div>
                    
                    {/* Lessons List */}
                    <div className="space-y-0.5 relative pl-2">
                      {/* Vertical line for tree structure */}
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                      {module.lessons.map((lesson, lIdx) => {
                        const isCompleted = user.completedLessons.includes(lesson.id);
                        
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
                              relative w-full flex items-start gap-2.5 px-3 py-2 text-left rounded-md transition-all group ml-1
                              ${isLocked 
                                ? 'opacity-60 cursor-not-allowed' 
                                : 'hover:bg-slate-50 cursor-pointer'
                              }
                            `}
                          >
                            <div className="mt-0.5">
                              {isCompleted ? <CheckCircleIcon /> : (isLocked ? <LockIcon /> : <PlayIcon />)}
                            </div>
                            <span className={`text-xs leading-relaxed ${isCompleted ? 'text-slate-500' : 'text-slate-600 font-medium group-hover:text-brand-700'}`}>
                              {lesson.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {user.role === 'coordinator' && (
              <div className="pt-4 border-t border-slate-100 mt-4">
                 <button
                  onClick={() => {
                    onChangeView('admin');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'admin' 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          <div 
            onClick={() => {
              onChangeView('profile');
              onClose();
            }}
            className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-slate-100 p-2 rounded-lg transition-colors -mx-2"
          >
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">Nível {user.level}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mb-4 overflow-hidden">
            <div 
              className="bg-brand-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${user.progress}%` }}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            fullWidth 
            onClick={onLogout}
          >
            Sair
          </Button>
        </div>
      </div>
    </>
  );
};