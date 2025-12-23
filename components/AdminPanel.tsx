
import React, { useState } from 'react';
import { Course, Module, Lesson, QuizOption } from '../types';
import { Button } from './Button';

interface AdminPanelProps {
  course: Course;
  onUpdateCourse: (updatedCourse: Course) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ course, onUpdateCourse }) => {
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  
  // Estados para formulários
  const [moduleForm, setModuleForm] = useState<Partial<Module>>({});
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({});
  
  // Controle de UI
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);

  // --- MODULE ACTIONS ---

  const openModuleModal = (module?: Module) => {
    if (module) {
      setModuleForm({ ...module });
      setEditingModuleId(module.id);
    } else {
      setModuleForm({ title: '', description: '', isLocked: false });
      setEditingModuleId(null);
    }
    setIsModuleModalOpen(true);
  };

  const saveModule = () => {
    if (!moduleForm.title) return alert("Título é obrigatório");
    
    let newModules = [...course.modules];

    if (editingModuleId) {
      // Edit
      newModules = newModules.map(m => m.id === editingModuleId ? { ...m, ...moduleForm } as Module : m);
    } else {
      // Create
      const newModule: Module = {
        id: `m_${Date.now()}`,
        title: moduleForm.title || '',
        description: moduleForm.description || '',
        isLocked: !!moduleForm.isLocked,
        lessons: []
      };
      newModules.push(newModule);
    }

    onUpdateCourse({ ...course, modules: newModules });
    setIsModuleModalOpen(false);
  };

  const deleteModule = (moduleId: string) => {
    if (window.confirm("Tem certeza? Todas as aulas deste módulo serão apagadas.")) {
      const newModules = course.modules.filter(m => m.id !== moduleId);
      onUpdateCourse({ ...course, modules: newModules });
    }
  };

  // --- LESSON ACTIONS ---

  const openLessonModal = (moduleId: string, lesson?: Lesson) => {
    setActiveModuleForLesson(moduleId);
    if (lesson) {
      setLessonForm(JSON.parse(JSON.stringify(lesson))); // Deep copy for quiz arrays
      setEditingLessonId(lesson.id);
    } else {
      setLessonForm({
        title: '',
        description: '',
        videoId: '',
        duration: '',
        content: '',
        quiz: {
          id: `q_${Date.now()}`,
          question: '',
          options: [
            { id: 'opt_1', text: '', isCorrect: false },
            { id: 'opt_2', text: '', isCorrect: false }
          ]
        }
      });
      setEditingLessonId(null);
    }
    setIsLessonModalOpen(true);
  };

  const saveLesson = () => {
    if (!lessonForm.title || !activeModuleForLesson) return alert("Título e Módulo são obrigatórios");

    const newModules = [...course.modules];
    const moduleIndex = newModules.findIndex(m => m.id === activeModuleForLesson);
    if (moduleIndex === -1) return;

    if (editingLessonId) {
      // Edit
      const lessons = newModules[moduleIndex].lessons.map(l => l.id === editingLessonId ? { ...l, ...lessonForm } as Lesson : l);
      newModules[moduleIndex] = { ...newModules[moduleIndex], lessons };
    } else {
      // Create
      const newLesson: Lesson = {
        ...(lessonForm as Lesson),
        id: `l_${Date.now()}`
      };
      newModules[moduleIndex].lessons.push(newLesson);
    }

    onUpdateCourse({ ...course, modules: newModules });
    setIsLessonModalOpen(false);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    if (window.confirm("Apagar esta aula?")) {
      const newModules = [...course.modules];
      const modIdx = newModules.findIndex(m => m.id === moduleId);
      newModules[modIdx].lessons = newModules[modIdx].lessons.filter(l => l.id !== lessonId);
      onUpdateCourse({ ...course, modules: newModules });
    }
  };

  // --- QUIZ HELPERS ---
  const handleOptionChange = (idx: number, field: keyof QuizOption, value: any) => {
    if (!lessonForm.quiz) return;
    const newOptions = [...lessonForm.quiz.options];
    
    if (field === 'isCorrect' && value === true) {
      // Ensure only one is correct (optional logic, but good for single choice)
      newOptions.forEach(o => o.isCorrect = false);
    }
    
    newOptions[idx] = { ...newOptions[idx], [field]: value };
    setLessonForm({ ...lessonForm, quiz: { ...lessonForm.quiz, options: newOptions } });
  };

  const addQuizOption = () => {
    if (!lessonForm.quiz) return;
    const newOption: QuizOption = { id: `opt_${Date.now()}`, text: '', isCorrect: false };
    setLessonForm({ 
      ...lessonForm, 
      quiz: { 
        ...lessonForm.quiz, 
        options: [...lessonForm.quiz.options, newOption] 
      } 
    });
  };

  const removeQuizOption = (idx: number) => {
    if (!lessonForm.quiz) return;
    const newOptions = lessonForm.quiz.options.filter((_, i) => i !== idx);
    setLessonForm({ ...lessonForm, quiz: { ...lessonForm.quiz, options: newOptions } });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h1>
           <p className="text-slate-500 dark:text-slate-400">Gerenciamento do curso: {course.title}</p>
        </div>
        <Button onClick={() => openModuleModal()}>+ Novo Módulo</Button>
      </div>

      <div className="space-y-6">
        {course.modules.map((module) => (
          <div key={module.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
            {/* Module Header */}
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 dark:text-white">{module.title}</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400">{module.lessons.length} Aulas • {module.isLocked ? 'Bloqueado' : 'Liberado'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openModuleModal(module)} className="p-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors" title="Editar Módulo">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => deleteModule(module.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors" title="Excluir Módulo">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            {/* Lessons List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {module.lessons.map((lesson) => (
                 <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <div className="flex items-center gap-4">
                       <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                         VIDEO
                       </span>
                       <div>
                         <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{lesson.title}</h4>
                         <span className="text-xs text-slate-400 dark:text-slate-500">ID: {lesson.videoId} • {lesson.duration}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openLessonModal(module.id, lesson)}>Editar</Button>
                        <button onClick={() => deleteLesson(module.id, lesson.id)} className="text-red-400 hover:text-red-600 p-2">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                 </div>
              ))}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-800 flex justify-center">
                 <Button size="sm" variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-400" onClick={() => openLessonModal(module.id)}>
                    + Adicionar Aula
                 </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL DE MÓDULO --- */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{editingModuleId ? 'Editar Módulo' : 'Novo Módulo'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                <input 
                  className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={moduleForm.title}
                  onChange={e => setModuleForm({...moduleForm, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <input 
                  className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={moduleForm.description}
                  onChange={e => setModuleForm({...moduleForm, description: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isLocked"
                  checked={moduleForm.isLocked}
                  onChange={e => setModuleForm({...moduleForm, isLocked: e.target.checked})}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isLocked" className="text-sm text-slate-700 dark:text-slate-300">Bloquear Módulo (Requer anterior completo)</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setIsModuleModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveModule}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE AULA --- */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl my-8">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{editingLessonId ? 'Editar Aula' : 'Nova Aula'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Esquerda: Dados Básicos */}
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Título da Aula</label>
                    <input 
                      className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={lessonForm.title}
                      onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">YouTube ID</label>
                        <input 
                        className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono text-xs"
                        placeholder="Ex: dqw4w9WgXcQ"
                        value={lessonForm.videoId}
                        onChange={e => setLessonForm({...lessonForm, videoId: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duração</label>
                        <input 
                        className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Ex: 15 min"
                        value={lessonForm.duration}
                        onChange={e => setLessonForm({...lessonForm, duration: e.target.value})}
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Descrição Curta</label>
                    <input 
                      className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={lessonForm.description}
                      onChange={e => setLessonForm({...lessonForm, description: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Conteúdo (Markdown/Texto)</label>
                    <textarea 
                      className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white h-40 font-mono text-sm"
                      value={lessonForm.content}
                      onChange={e => setLessonForm({...lessonForm, content: e.target.value})}
                    />
                 </div>
              </div>

              {/* Direita: Quiz */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                 <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Configuração do Quiz
                 </h4>
                 
                 <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Pergunta</label>
                    <input 
                      className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                      value={lessonForm.quiz?.question}
                      onChange={e => setLessonForm({...lessonForm, quiz: { ...lessonForm.quiz!, question: e.target.value }})}
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500">Opções de Resposta</label>
                    {lessonForm.quiz?.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input 
                                type="radio"
                                name="correctOption"
                                checked={opt.isCorrect}
                                onChange={() => handleOptionChange(idx, 'isCorrect', true)}
                                className="w-4 h-4 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                title="Marcar como correta"
                            />
                            <input 
                                className="flex-1 border rounded px-2 py-1 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={opt.text}
                                onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                                placeholder={`Opção ${idx + 1}`}
                            />
                            <button onClick={() => removeQuizOption(idx)} className="text-slate-400 hover:text-red-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                    <button 
                        onClick={addQuizOption}
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline mt-2 flex items-center gap-1"
                    >
                        + Adicionar Opção
                    </button>
                 </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button variant="ghost" onClick={() => setIsLessonModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveLesson}>Salvar Aula</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
