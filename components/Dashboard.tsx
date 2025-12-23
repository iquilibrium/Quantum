import React from 'react';
import { User, Course } from '../types';
import { Button } from './Button';

interface DashboardProps {
  user: User;
  course: Course;
  onResume: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, course, onResume }) => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Olá, {user.name.split(' ')[0]}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Continue sua jornada de expansão da consciência.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progresso Geral</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{user.progress}%</p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${user.progress}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pontuação Quantum</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{user.points}</p>
              <span className="text-sm text-slate-400">pts</span>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Próximo nível: <span className="font-semibold text-slate-900 dark:text-white">3 (400 pts)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Badges</p>
            <div className="flex -space-x-2 mt-3">
              {user.badges.map((badge, idx) => (
                <div key={idx} className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 border-2 border-white dark:border-slate-700 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300" title={badge}>
                  {badge[0]}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-700 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-300">
                +2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Course Card */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Em andamento</h2>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row transition-colors">
          <div className="md:w-1/3 bg-slate-900 relative h-48 md:h-auto">
             <img 
               src="https://picsum.photos/600/400" 
               alt="Course cover" 
               className="absolute inset-0 w-full h-full object-cover opacity-60"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
             <div className="absolute bottom-6 left-6 text-white">
               <span className="bg-brand-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Curso Principal</span>
               <h3 className="text-xl font-bold mt-2">{course.title}</h3>
             </div>
          </div>
          <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">{course.modules.length} Módulos</span>
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400">Continuar de onde parou</span>
              </div>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Próxima Aula: A Dupla Fenda</h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                Continue seus estudos sobre o comportamento da matéria e o papel do observador na realidade quântica.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <Button onClick={onResume}>
                Continuar Estudando
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Materials (Future Phase) */}
      <section className="opacity-70 pointer-events-none grayscale">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Materiais Complementares (Em Breve)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-32 flex items-center justify-center">
              <span className="text-slate-400 font-medium">PDF Bloqueado</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};