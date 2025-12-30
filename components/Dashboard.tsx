import React from 'react';
import { User, Course, Module, Lesson, Material } from '../types';
import { Button } from './Button';

interface DashboardProps {
  user: User;
  course: Course;
  onResume: () => void;
}

// Componente visual para o Gráfico Circular (Radial Progress)
const RadialProgress = ({ percentage, size = 120, strokeWidth = 10, color = "#7c3aed" }: { percentage: number, size?: number, strokeWidth?: number, color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          className="text-slate-100 dark:text-slate-700 transition-colors"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className="transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-800 dark:text-white">{percentage}%</span>
      </div>
    </div>
  );
};

// Helper Icon para Materiais
const renderMaterialIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    case 'video':
      return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'doc':
      return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'ppt':
      return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>;
    default: // link, image, txt
      return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ user, course, onResume }) => {
  // Cálculo de XP para o próximo nível (Exemplo: base 400 pts)
  const nextLevelXP = 400;
  const xpPercentage = Math.min((user.points / nextLevelXP) * 100, 100);

  // --- LÓGICA DINÂMICA: Determinar o Módulo/Aula atual ---
  if (!course?.modules || course.modules.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        <p>Nenhum conteúdo disponível no momento.</p>
        <Button onClick={onResume} variant="outline" className="mt-4">Recarregar</Button>
      </div>
    );
  }

  let activeModule: Module = course.modules[0];
  // Safety check: ensure the first module has lessons if we default to it
  let nextLesson: Lesson | undefined = activeModule.lessons?.[0];

  if (!nextLesson) {
    // If the first module fits but has no lessons, try to find *any* lesson in *any* module
    const validModule = course.modules.find(m => m.lessons && m.lessons.length > 0);
    if (validModule) {
      activeModule = validModule;
      nextLesson = validModule.lessons[0];
    } else {
      // Fallback if absolutely no lessons exist in any module
      return (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          <p>O curso ainda não possui aulas cadastradas.</p>
          <Button onClick={onResume} variant="outline" className="mt-4">Voltar</Button>
        </div>
      );
    }
  }

  // Encontra a primeira aula não concluída
  let foundActive = false;
  for (const module of course.modules) {
    if (!module.isActive) continue;

    for (const lesson of module.lessons) {
      if (!user.completedLessons.includes(lesson.id)) {
        activeModule = module;
        nextLesson = lesson;
        foundActive = true;
        break;
      }
    }
    if (foundActive) break;
  }

  // Se terminou tudo, mostra a última do último módulo
  if (!foundActive) {
    const lastModule = course.modules[course.modules.length - 1];
    if (lastModule && lastModule.lessons && lastModule.lessons.length > 0) {
      activeModule = lastModule;
      nextLesson = lastModule.lessons[lastModule.lessons.length - 1];
    }
  }

  if (!nextLesson) {
    return <div>Carregando...</div>;
  }

  // --- LÓGICA DINÂMICA: Coletar Materiais do Módulo Atual ---
  // Agrega todos os materiais das aulas do módulo ativo
  const activeMaterials: Material[] = activeModule.lessons
    .flatMap(l => l.materials)
    .slice(0, 4); // Limita a 4 para grid

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header com Gradiente Sutil */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 dark:from-brand-900 dark:to-slate-900 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Olá, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-brand-100 mt-2 text-lg">Sua jornada de expansão da consciência continua.</p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-brand-400 opacity-20 rounded-full blur-xl pointer-events-none"></div>
      </header>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Progresso Visual (Radial) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-6 transition-colors relative overflow-hidden group">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Progresso Geral</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Baseado nas aulas concluídas</p>
            <Button size="sm" variant="outline" className="text-xs w-full justify-center dark:border-slate-600 dark:text-slate-300" onClick={onResume}>
              Continuar
            </Button>
          </div>
          <div className="flex-shrink-0">
            <RadialProgress percentage={user.progress} color="#7c3aed" />
          </div>
        </div>

        {/* Card 2: Nível e XP (Gamification) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seu Nível</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Nível {user.level}</h2>
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400">Iniciado</span>
              </div>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <span>{user.points} XP</span>
              <span>Próx: {nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden relative">
              <div
                className="bg-gradient-to-r from-amber-400 to-brand-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-right">Complete aulas e quizzes para subir.</p>
          </div>
        </div>

        {/* Card 3: Conquistas (Antigo Badges) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suas Conquistas</p>
            <span className="text-xs font-semibold bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
              Total: {user.badges.length}
            </span>
          </div>

          <div className="flex-1 flex items-center content-start gap-3 flex-wrap">
            {user.badges.map((badge, idx) => (
              <div key={idx} className="group relative flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-100 to-white dark:from-brand-900 dark:to-slate-800 border-2 border-brand-200 dark:border-brand-700 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform cursor-help">
                  {/* Mapeamento simples de ícone por badge (simulado) */}
                  {idx === 0 ? '🌟' : idx === 1 ? '🧠' : '⚡'}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  {badge}
                </div>
              </div>
            ))}

            {/* Slot Vazio / Próxima Conquista */}
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center opacity-50">
              <span className="text-slate-300 dark:text-slate-600 text-lg">+</span>
            </div>
          </div>
          <div className="mt-auto pt-2">
            <button className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
              Ver todas as insígnias
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Current Course Card - DYNAMIC CONTENT */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Em andamento</h2>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row transition-colors group hover:shadow-md duration-300">
          <div className="md:w-1/3 bg-slate-900 relative h-48 md:h-auto overflow-hidden">
            <img
              src={course.courseCoverUrl || "https://picsum.photos/600/400"}
              alt="Course cover"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white pr-4">
              <span className="bg-brand-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm mb-2 inline-block">
                Curso {/* Alterado de activeModule.title.split(':')[0] para "Curso" */}
              </span>
              <h3 className="text-xl font-bold leading-tight">{course.title}</h3>
            </div>
          </div>
          <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  {course.modules.length} Módulos
                </span>
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  Continuar de onde parou
                </span>
              </div>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Próxima Aula: {nextLesson.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                {nextLesson.description}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <Button onClick={onResume} className="shadow-lg shadow-brand-500/20">
                Continuar Estudando
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Materials (Synced with Active Module) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Materiais Complementares
            <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
              {activeModule.title}
            </span>
          </h2>
        </div>

        {activeMaterials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeMaterials.map((material, i) => (
              <a
                key={material.id}
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all h-32 flex flex-col items-center justify-center gap-3 group text-center no-underline"
              >
                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  {renderMaterialIcon(material.type)}
                </div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                  {material.title}
                </span>
              </a>
            ))}

            {/* Fillers to keep layout balanced if needed, or just let it flow */}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum material complementar específico encontrado para este módulo no momento.</p>
          </div>
        )}
      </section>
    </div>
  );
};