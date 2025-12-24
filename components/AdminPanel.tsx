

import React, { useState, useRef, useEffect } from 'react';
import { Course, Module, Lesson, QuizOption, User, CertificateConfig, Material } from '../types';
import { Button } from './Button';
import { Certificate } from './Certificate'; // Import para Preview

interface AdminPanelProps {
  course: Course;
  students: User[]; // Lista de todos os alunos
  onUpdateCourse: (updatedCourse: Course) => void;
  onUpdateStudent: (updatedStudent: User) => void; // Função para ativar/desativar aluno
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ course, students, onUpdateCourse, onUpdateStudent }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'certificate'>('students');

  // --- LOADING STATE ---
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // --- SEARCH STATE ---
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // --- DRAG AND DROP STATE ---
  const [draggedModuleIdx, setDraggedModuleIdx] = useState<number | null>(null);
  const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ modIdx: number, lessIdx: number } | null>(null);

  useEffect(() => {
    // Simula um delay de rede ao carregar o componente para exibir o spinner
    const timer = setTimeout(() => {
      setIsLoadingStudents(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // --- CONTENT MANAGEMENT STATES ---
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState<Partial<Module>>({});
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({});
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  
  // New Material Inputs State
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({ title: '', url: '', type: 'link' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CERTIFICATE MANAGEMENT STATES ---
  const [showSaveSuccess, setShowSaveSuccess] = useState(false); // Estado para notificação
  const [certForm, setCertForm] = useState<CertificateConfig>(course.certificateConfig || {
      title: 'Certificado',
      subtitle: 'de conclusão',
      bodyText: 'Este certificado é orgulhosamente concedido a',
      signerName: 'Diretor Responsável',
      signerRole: 'Diretor Acadêmico',
      institutionName: 'Quantum',
      primaryColor: '#7c3aed',
      displaySeal: true
  });

  // --- DRAG AND DROP HANDLERS ---

  // 1. Module Reordering
  const handleModuleDragStart = (index: number) => {
    setDraggedModuleIdx(index);
  };

  const handleModuleDragEnter = (targetIndex: number) => {
    if (draggedModuleIdx === null || draggedModuleIdx === targetIndex) return;

    const newModules = [...course.modules];
    const draggedItem = newModules[draggedModuleIdx];
    
    // Remove do index antigo e insere no novo
    newModules.splice(draggedModuleIdx, 1);
    newModules.splice(targetIndex, 0, draggedItem);

    onUpdateCourse({ ...course, modules: newModules });
    setDraggedModuleIdx(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedModuleIdx(null);
    setDraggedLessonInfo(null);
  };

  // 2. Lesson Reordering
  const handleLessonDragStart = (modIdx: number, lessIdx: number) => {
    setDraggedLessonInfo({ modIdx, lessIdx });
  };

  const handleLessonDragEnter = (targetModIdx: number, targetLessIdx: number) => {
    // Só permite reordenar dentro do mesmo módulo
    if (!draggedLessonInfo || draggedLessonInfo.modIdx !== targetModIdx || draggedLessonInfo.lessIdx === targetLessIdx) return;

    const newModules = [...course.modules];
    const targetModule = newModules[targetModIdx];
    const newLessons = [...targetModule.lessons];
    const draggedLesson = newLessons[draggedLessonInfo.lessIdx];

    // Swap logic
    newLessons.splice(draggedLessonInfo.lessIdx, 1);
    newLessons.splice(targetLessIdx, 0, draggedLesson);

    newModules[targetModIdx] = { ...targetModule, lessons: newLessons };
    
    onUpdateCourse({ ...course, modules: newModules });
    setDraggedLessonInfo({ modIdx: targetModIdx, lessIdx: targetLessIdx });
  };


  // --- CERTIFICATE HELPERS ---
  const handleCertChange = (field: keyof CertificateConfig, value: any) => {
    const updatedForm = { ...certForm, [field]: value };
    setCertForm(updatedForm);
    // Atualiza o curso em tempo real para o preview funcionar
    onUpdateCourse({ ...course, certificateConfig: updatedForm });
  };

  const handleSaveCertificate = () => {
    // Salva as configurações
    onUpdateCourse({ ...course, certificateConfig: certForm });
    
    // Mostra notificação visual elegante em vez de alert
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };


  // --- CONTENT HELPERS ---

  const toggleModuleStatus = (module: Module) => {
      const newModules = course.modules.map(m => m.id === module.id ? { ...m, isActive: !m.isActive } : m);
      onUpdateCourse({ ...course, modules: newModules });
  };

  const toggleLessonStatus = (moduleId: string, lesson: Lesson) => {
      const newModules = course.modules.map(m => {
          if (m.id === moduleId) {
              const newLessons = m.lessons.map(l => l.id === lesson.id ? { ...l, isActive: !l.isActive } : l);
              return { ...m, lessons: newLessons };
          }
          return m;
      });
      onUpdateCourse({ ...course, modules: newModules });
  };

  // --- MODULE REORDERING (Legacy Buttons) ---
  const moveModuleUp = (index: number) => {
    if (index === 0) return; // Já é o primeiro
    const newModules = [...course.modules];
    // Swap
    const temp = newModules[index];
    newModules[index] = newModules[index - 1];
    newModules[index - 1] = temp;
    onUpdateCourse({ ...course, modules: newModules });
  };

  const moveModuleDown = (index: number) => {
    if (index === course.modules.length - 1) return; // Já é o último
    const newModules = [...course.modules];
    // Swap
    const temp = newModules[index];
    newModules[index] = newModules[index + 1];
    newModules[index + 1] = temp;
    onUpdateCourse({ ...course, modules: newModules });
  };

  const openModuleModal = (module?: Module) => {
    if (module) {
      setModuleForm({ ...module });
      setEditingModuleId(module.id);
    } else {
      setModuleForm({ title: '', description: '', isLocked: false, isActive: true });
      setEditingModuleId(null);
    }
    setIsModuleModalOpen(true);
  };

  const saveModule = () => {
    if (!moduleForm.title) return alert("Título é obrigatório");
    let newModules = [...course.modules];
    if (editingModuleId) {
      newModules = newModules.map(m => m.id === editingModuleId ? { ...m, ...moduleForm } as Module : m);
    } else {
      const newModule: Module = {
        id: `m_${Date.now()}`,
        title: moduleForm.title || '',
        description: moduleForm.description || '',
        isLocked: !!moduleForm.isLocked,
        isActive: true,
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

  const openLessonModal = (moduleId: string, lesson?: Lesson) => {
    setActiveModuleForLesson(moduleId);
    setNewMaterial({ title: '', url: '', type: 'link' }); // Reset new material form
    
    if (lesson) {
      setLessonForm(JSON.parse(JSON.stringify(lesson)));
      setEditingLessonId(lesson.id);
    } else {
      setLessonForm({
        title: '', description: '', videoId: '', duration: '', content: '', isActive: true,
        materials: [],
        quiz: { id: `q_${Date.now()}`, question: '', options: [{ id: 'opt_1', text: '', isCorrect: false }, { id: 'opt_2', text: '', isCorrect: false }] }
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

    // Ensure materials array exists
    const lessonToSave = {
        ...lessonForm,
        materials: lessonForm.materials || []
    } as Lesson;

    if (editingLessonId) {
      const lessons = newModules[moduleIndex].lessons.map(l => l.id === editingLessonId ? lessonToSave : l);
      newModules[moduleIndex] = { ...newModules[moduleIndex], lessons };
    } else {
      const newLesson: Lesson = { ...lessonToSave, id: `l_${Date.now()}` };
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

  // --- MATERIAL HELPERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // SIMULAÇÃO DE UPLOAD PARA DB/STORAGE
        // Em produção, aqui você faria o upload para o Supabase Storage e receberia a URL pública.
        // const { data, error } = await supabase.storage.from('course-files').upload(file.name, file);
        
        const fakeUrl = `https://storage.quantum.edu/files/${file.name.replace(/\s/g, '_')}`;
        
        // Preenche o título automaticamente se estiver vazio
        const autoTitle = newMaterial.title || file.name.split('.')[0];

        setNewMaterial({ 
            ...newMaterial, 
            url: fakeUrl,
            title: autoTitle
        });
    }
  };

  const addMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) return;
    const materialToAdd: Material = {
        id: `mat_${Date.now()}`,
        title: newMaterial.title,
        url: newMaterial.url,
        type: newMaterial.type as any
    };
    
    setLessonForm({
        ...lessonForm,
        materials: [...(lessonForm.materials || []), materialToAdd]
    });
    setNewMaterial({ title: '', url: '', type: 'link' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMaterial = (materialId: string) => {
      setLessonForm({
          ...lessonForm,
          materials: (lessonForm.materials || []).filter(m => m.id !== materialId)
      });
  };

  // Função para editar material inline
  const updateExistingMaterial = (idx: number, field: keyof Material, value: any) => {
    const newMaterials = [...(lessonForm.materials || [])];
    newMaterials[idx] = { ...newMaterials[idx], [field]: value };
    setLessonForm({ ...lessonForm, materials: newMaterials });
  };

  // --- QUIZ HELPERS ---
  const handleOptionChange = (idx: number, field: keyof QuizOption, value: any) => {
    if (!lessonForm.quiz) return;
    const newOptions = [...lessonForm.quiz.options];
    if (field === 'isCorrect' && value === true) newOptions.forEach(o => o.isCorrect = false);
    newOptions[idx] = { ...newOptions[idx], [field]: value };
    setLessonForm({ ...lessonForm, quiz: { ...lessonForm.quiz, options: newOptions } });
  };

  const addQuizOption = () => {
    if (!lessonForm.quiz) return;
    setLessonForm({ ...lessonForm, quiz: { ...lessonForm.quiz, options: [...lessonForm.quiz.options, { id: `opt_${Date.now()}`, text: '', isCorrect: false }] } });
  };

  const removeQuizOption = (idx: number) => {
    if (!lessonForm.quiz) return;
    setLessonForm({ ...lessonForm, quiz: { ...lessonForm.quiz, options: lessonForm.quiz.options.filter((_, i) => i !== idx) } });
  };

  // --- STUDENT HELPERS ---
  const toggleStudentActive = (student: User) => {
      onUpdateStudent({ ...student, isActive: !student.isActive });
  };

  // --- STATS CALCULATION ---
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const totalXP = students.reduce((acc, s) => acc + s.points, 0);
  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / (totalStudents || 1));

  // --- FILTERED STUDENTS ---
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Helper para saber se é um tipo de arquivo
  const isFileUpload = ['pdf', 'image', 'doc', 'ppt', 'txt'].includes(newMaterial.type || '');

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors relative">
      
      {/* Admin Header & Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0">
         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie alunos, conteúdo e visualizações</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
               {activeTab === 'content' && <Button onClick={() => openModuleModal()}>+ Novo Módulo</Button>}
            </div>
         </div>
         
         <div className="flex gap-6 border-b border-slate-100 dark:border-slate-700 -mb-4 overflow-x-auto">
             <button 
                onClick={() => setActiveTab('students')}
                className={`pb-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'students' ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
             >
                Alunos & Dashboard
             </button>
             <button 
                onClick={() => setActiveTab('content')}
                className={`pb-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'content' ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
             >
                Gerenciar Conteúdo
             </button>
             <button 
                onClick={() => setActiveTab('certificate')}
                className={`pb-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'certificate' ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
             >
                Personalizar Certificado
             </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        
        {/* --- STUDENTS TAB --- */}
        {activeTab === 'students' && (
           <div className="space-y-8 animate-fade-in">
              {isLoadingStudents ? (
                  <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
                      <svg className="w-10 h-10 text-brand-600 dark:text-brand-400 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando dados dos alunos...</p>
                  </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-scale-in">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase">Total de Alunos</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalStudents}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase">Alunos Ativos</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{activeStudents}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase">Média de Progresso</p>
                        <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mt-1">{avgProgress}%</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase">XP Total Gerado</p>
                        <p className="text-3xl font-bold text-amber-500 mt-1">{totalXP}</p>
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in" style={{ animationDelay: '100ms' }}>
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-bold text-slate-800 dark:text-white">Base de Alunos</h3>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text"
                                placeholder="Buscar por nome ou email..."
                                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-64"
                                value={studentSearchTerm}
                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium">
                              <tr>
                                <th className="px-6 py-3">Aluno</th>
                                <th className="px-6 py-3">Progresso</th>
                                <th className="px-6 py-3">Nível</th>
                                <th className="px-6 py-3">Último Acesso</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <img src={student.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                                          <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                                          </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-500" style={{ width: `${student.progress}%` }}></div>
                                          </div>
                                          <span className="text-xs text-slate-600 dark:text-slate-300">{student.progress}%</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                          Lvl {student.level}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                      {student.lastAccess || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                      {student.isActive ? (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Ativo
                                          </span>
                                      ) : (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inativo
                                          </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      {student.role !== 'coordinator' && (
                                          <button 
                                            onClick={() => toggleStudentActive(student)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded border transition-colors hover:shadow-sm ${student.isActive ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20' : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-900/20'}`}
                                          >
                                              {student.isActive ? 'Bloquear Acesso' : 'Ativar Aluno'}
                                          </button>
                                      )}
                                    </td>
                                </tr>
                              ))
                             ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        Nenhum aluno encontrado para "{studentSearchTerm}"
                                    </td>
                                </tr>
                             )}
                          </tbody>
                        </table>
                    </div>
                  </div>
                </>
              )}
           </div>
        )}

        {/* --- CONTENT TAB --- */}
        {activeTab === 'content' && (
           <div className="space-y-6 animate-fade-in">
            {course.modules.map((module, index) => (
              <div 
                key={module.id} 
                className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${
                    module.isActive ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700 opacity-60 grayscale-[0.5]'
                } ${draggedModuleIdx === index ? 'opacity-40 ring-2 ring-brand-500 border-transparent' : ''}`}
                draggable
                onDragStart={() => handleModuleDragStart(index)}
                onDragEnter={() => handleModuleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Module Header */}
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 cursor-move group">
                  <div className="flex items-center gap-3">
                     {/* Drag Handle & Reorder Buttons */}
                     <div className="flex items-center gap-2">
                        <div className="text-slate-400 cursor-grab hover:text-slate-600 dark:hover:text-slate-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <button 
                            onClick={(e) => { e.stopPropagation(); moveModuleUp(index); }}
                            disabled={index === 0}
                            className="text-slate-400 hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Mover para cima"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button 
                            onClick={(e) => { e.stopPropagation(); moveModuleDown(index); }}
                            disabled={index === course.modules.length - 1}
                            className="text-slate-400 hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Mover para baixo"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>
                     </div>

                     <div className={`p-2 rounded-lg shadow-sm transition-colors ${module.isActive ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {module.title}
                          {!module.isActive && <span className="text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded uppercase">Inativo</span>}
                       </h3>
                       <p className="text-xs text-slate-500 dark:text-slate-400">{module.lessons.length} Aulas • {module.isLocked ? 'Trancado (Sequencial)' : 'Livre'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Toggle Active Switch for Module */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleModuleStatus(module); }}
                        title={module.isActive ? "Desativar Módulo" : "Ativar Módulo"}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${module.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${module.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-2"></div>

                    <button onClick={(e) => { e.stopPropagation(); openModuleModal(module); }} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-brand-900/20 rounded-full transition-all" title="Editar Módulo">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-full transition-all" title="Excluir Módulo">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-slate-50/30 dark:bg-slate-900/10">
                  {module.lessons.map((lesson, lIdx) => (
                     <div 
                        key={lesson.id} 
                        className={`p-4 flex items-center justify-between transition-colors cursor-move 
                        ${lesson.isActive ? 'hover:bg-slate-50 dark:hover:bg-slate-700/20' : 'bg-slate-50/50 dark:bg-slate-800/50 opacity-70'}
                        ${draggedLessonInfo?.modIdx === index && draggedLessonInfo?.lessIdx === lIdx ? 'opacity-40 bg-slate-100 dark:bg-slate-700' : ''}
                        `}
                        draggable
                        onDragStart={(e) => {
                            e.stopPropagation();
                            handleLessonDragStart(index, lIdx);
                        }}
                        onDragEnter={(e) => {
                            e.stopPropagation();
                            handleLessonDragEnter(index, lIdx);
                        }}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                     >
                        <div className="flex items-center gap-4">
                           {/* Lesson Drag Handle */}
                           <div className="text-slate-300 dark:text-slate-600 cursor-grab hover:text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                           </div>

                           <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${lesson.isActive ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-400'}`}>
                             {lesson.isActive ? 'VID' : 'OFF'}
                           </span>
                           <div>
                             <h4 className={`text-sm font-semibold ${lesson.isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-500 line-through'}`}>{lesson.title}</h4>
                             <span className="text-xs text-slate-400 dark:text-slate-500">ID: {lesson.videoId} • {lesson.duration}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => toggleLessonStatus(module.id, lesson)}
                                title={lesson.isActive ? "Desativar Aula" : "Ativar Aula"}
                                className={`text-xs font-medium px-2 py-1 rounded border hover:shadow-sm hover:brightness-95 dark:hover:brightness-110 transition-all ${lesson.isActive ? 'border-green-200 text-green-600 bg-green-50 dark:bg-green-900/20 dark:border-green-800' : 'border-slate-300 text-slate-500 bg-slate-100 dark:bg-slate-700 dark:border-slate-600'}`}
                            >
                                {lesson.isActive ? 'Ativa' : 'Inativa'}
                            </button>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-600"></div>
                            <Button size="sm" variant="ghost" onClick={() => openLessonModal(module.id, lesson)}>Editar</Button>
                            <button onClick={() => deleteLesson(module.id, lesson.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
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
        )}

        {/* ... (Certificate code remains same) ... */}
      </div>

      {/* ... (Toast and Module Modal code remains same) ... */}

      {/* --- MODAL DE AULA --- */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl my-8 border border-slate-200 dark:border-slate-700 animate-scale-in">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{editingLessonId ? 'Editar Aula' : 'Nova Aula'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Esquerda: Dados Básicos */}
              <div className="space-y-4">
                 {/* ... (Existing fields for title, videoId, etc) ... */}
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
                 
                 {/* Material Complementar Section */}
                 <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3 text-sm flex items-center justify-between">
                        Materiais Complementares
                        <span className="text-[10px] bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded">
                            {lessonForm.materials?.length || 0} adicionados
                        </span>
                    </h4>
                    
                    {/* Lista de Materiais com Edição Inline */}
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                        {(lessonForm.materials || []).map((mat, idx) => (
                            <div key={mat.id} className="grid grid-cols-12 gap-2 bg-white dark:bg-slate-700/50 p-2 rounded border border-slate-200 dark:border-slate-600 items-center">
                                {/* Type Select */}
                                <div className="col-span-2">
                                     <select
                                        className="w-full text-xs px-1 py-1 rounded border dark:bg-slate-600 dark:border-slate-500 dark:text-white focus:ring-1 focus:ring-brand-500 outline-none"
                                        value={mat.type}
                                        onChange={(e) => updateExistingMaterial(idx, 'type', e.target.value)}
                                    >
                                        <option value="link">Link</option>
                                        <option value="video">Vídeo</option>
                                        <option value="pdf">PDF</option>
                                        <option value="image">Img</option>
                                        <option value="doc">Doc</option>
                                        <option value="ppt">PPT</option>
                                        <option value="txt">Txt</option>
                                    </select>
                                </div>
                                {/* Title Input */}
                                <div className="col-span-4">
                                    <input
                                        className="w-full text-xs px-2 py-1 rounded border dark:bg-slate-600 dark:border-slate-500 dark:text-white focus:ring-1 focus:ring-brand-500 outline-none"
                                        value={mat.title}
                                        onChange={(e) => updateExistingMaterial(idx, 'title', e.target.value)}
                                        placeholder="Título"
                                    />
                                </div>
                                {/* URL Input */}
                                <div className="col-span-5 relative">
                                     <input
                                        className="w-full text-xs px-2 py-1 rounded border dark:bg-slate-600 dark:border-slate-500 dark:text-white focus:ring-1 focus:ring-brand-500 outline-none pr-6"
                                        value={mat.url}
                                        onChange={(e) => updateExistingMaterial(idx, 'url', e.target.value)}
                                        placeholder="URL"
                                    />
                                    <a href={mat.url} target="_blank" rel="noreferrer" className="absolute right-1.5 top-1.5 text-slate-400 hover:text-brand-500" title="Testar Link">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                </div>
                                {/* Delete Button */}
                                <div className="col-span-1 flex justify-center">
                                    <button onClick={() => removeMaterial(mat.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all" title="Remover">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(lessonForm.materials || []).length === 0 && <p className="text-xs text-slate-400 italic text-center py-2">Nenhum material adicionado.</p>}
                    </div>
                    
                    {/* Adicionar Novo Material */}
                    <div className="grid grid-cols-12 gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="col-span-3">
                            <select 
                                className="w-full text-xs px-2 py-1.5 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-1 focus:ring-brand-500 outline-none"
                                value={newMaterial.type}
                                onChange={e => setNewMaterial({...newMaterial, type: e.target.value as any, url: '', title: ''})}
                            >
                                <option value="link">Link</option>
                                <option value="video">Vídeo</option>
                                <option value="pdf">PDF</option>
                                <option value="image">Imagem</option>
                                <option value="doc">Word</option>
                                <option value="ppt">PPT</option>
                                <option value="txt">Texto</option>
                            </select>
                        </div>

                        {isFileUpload ? (
                             <div className="col-span-8 flex items-center">
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept={newMaterial.type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.ppt,.pptx,.txt'}
                                />
                                <div className="flex-1 flex gap-2">
                                     <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 text-xs border border-dashed border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-left truncate"
                                     >
                                         {newMaterial.url ? newMaterial.url.split('/').pop() : `Selecionar arquivo ${newMaterial.type?.toUpperCase()}...`}
                                     </button>
                                     <input 
                                        placeholder="Título (Opcional)"
                                        className="w-1/2 text-xs px-2 py-1.5 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={newMaterial.title}
                                        onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                                    />
                                </div>
                             </div>
                        ) : (
                            <>
                                <div className="col-span-4">
                                    <input 
                                        placeholder="Título"
                                        className="w-full text-xs px-2 py-1.5 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={newMaterial.title}
                                        onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input 
                                        placeholder="https://..."
                                        className="w-full text-xs px-2 py-1.5 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={newMaterial.url}
                                        onChange={e => setNewMaterial({...newMaterial, url: e.target.value})}
                                    />
                                </div>
                            </>
                        )}
                        
                        <div className="col-span-1">
                             <button 
                                onClick={addMaterial}
                                disabled={!newMaterial.url}
                                className="w-full h-full bg-brand-600 text-white rounded flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Adicionar"
                             >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                             </button>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Direita: Quiz (mantido igual) */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                 {/* ... (Existing Quiz code) ... */}
                 <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Configuração do Quiz
                 </h4>
                 {/* ... Quiz inputs ... */}
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
                            <button onClick={() => removeQuizOption(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
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
