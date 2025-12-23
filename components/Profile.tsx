import React, { useState, useEffect } from 'react';
import { User, Course } from '../types';
import { Button } from './Button';

interface ProfileProps {
  user: User;
  course: Course;
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, course, onBack, onUpdateUser }) => {
  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });

  useEffect(() => {
    setFormData({ name: user.name, email: user.email });
  }, [user]);

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email });
    setIsEditing(false);
  };

  // Calcular estatísticas reais baseadas nas aulas completadas
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedCount = user.completedLessons.length;
  
  // Encontrar detalhes das aulas completadas
  const completedLessonDetails = course.modules
    .flatMap(m => m.lessons)
    .filter(l => user.completedLessons.includes(l.id))
    .slice(0, 5); // Mostrar apenas as 5 últimas

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header com Background */}
      <div className="h-48 bg-gradient-to-r from-brand-800 to-brand-600 w-full relative">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-2 bg-black/20 hover:bg-black/30 px-4 py-2 rounded-full transition-all backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full px-6 -mt-20 pb-12">
        {/* Card Principal de Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 relative z-10">
          <div className="relative">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md object-cover"
            />
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full" title="Online"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{formData.name}</h1>
            <p className="text-slate-500">{formData.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-brand-200">
                {user.role === 'student' ? 'Estudante Iniciado' : 'Coordenador'}
              </span>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-200 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                Nível {user.level}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
             {isEditing ? (
               <div className="flex gap-2 animate-fade-in">
                 <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                    Salvar
                 </Button>
                 <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                 </Button>
               </div>
             ) : (
               <Button variant="outline" onClick={() => setIsEditing(true)}>
                 Editar Perfil
               </Button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Stats e Badges */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Estatísticas de Jornada
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                   <span className="text-sm text-slate-500">Pontos de Conhecimento</span>
                   <span className="text-lg font-bold text-brand-600">{user.points} XP</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                   <span className="text-sm text-slate-500">Aulas Concluídas</span>
                   <span className="text-lg font-bold text-slate-800">{completedCount} / {totalLessons}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                   <span className="text-sm text-slate-500">Taxa de Conclusão</span>
                   <span className="text-lg font-bold text-slate-800">{Math.round((completedCount/totalLessons)*100)}%</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progresso para Nível {user.level + 1}</span>
                  <span>{user.points} / 400 XP</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-gradient-to-r from-brand-500 to-amber-500 h-full rounded-full" style={{ width: `${(user.points / 400) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Badges Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                Insígnias Conquistadas
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {user.badges.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 border-2 border-brand-200 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-200">
                      🏅
                    </div>
                    <span className="text-[10px] text-center font-medium text-slate-600 leading-tight">{badge}</span>
                  </div>
                ))}
                
                {/* Placeholder Badges (Locked) */}
                <div className="flex flex-col items-center gap-2 opacity-40 grayscale">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-xl">
                      🔒
                    </div>
                    <span className="text-[10px] text-center font-medium text-slate-600 leading-tight">Mestre Quântico</span>
                </div>
                 <div className="flex flex-col items-center gap-2 opacity-40 grayscale">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-xl">
                      🔒
                    </div>
                    <span className="text-[10px] text-center font-medium text-slate-600 leading-tight">Hermetista</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Detalhes e Histórico */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 text-lg">Dados Pessoais</h3>
                    {isEditing && <span className="text-xs text-brand-600 font-medium animate-pulse">Modo de Edição Ativo</span>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        readOnly={!isEditing}
                        className={`w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all duration-200 ${
                            isEditing 
                            ? 'bg-white border border-brand-300 ring-2 ring-brand-100 text-slate-900' 
                            : 'bg-slate-50 border border-slate-200 text-slate-700'
                        }`} 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                      <input 
                        type="text" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        readOnly={!isEditing}
                        className={`w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all duration-200 ${
                            isEditing 
                            ? 'bg-white border border-brand-300 ring-2 ring-brand-100 text-slate-900' 
                            : 'bg-slate-50 border border-slate-200 text-slate-700'
                        }`} 
                      />
                   </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data de Inscrição</label>
                      <input type="text" value="12/08/2023" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-500 text-sm focus:outline-none cursor-not-allowed" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Plano Atual</label>
                      <input type="text" value="Quantum Pro (Vitalício)" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-brand-700 font-medium text-sm focus:outline-none cursor-not-allowed" />
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">Histórico Recente de Aprendizado</h3>
                
                {completedLessonDetails.length > 0 ? (
                  <div className="space-y-4">
                    {completedLessonDetails.map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">{lesson.title}</h4>
                          <p className="text-xs text-slate-500">Concluído</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-brand-600">+50 XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Nenhuma aula concluída ainda. Comece sua jornada!
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};