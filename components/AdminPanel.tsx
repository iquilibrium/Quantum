import React, { useState, useRef, useEffect } from 'react';
import { Course, Module, Lesson, QuizOption, User, CertificateConfig, Material } from '../types';
import { Button } from './Button';
import { Certificate } from './Certificate';
import { supabase } from '../src/integrations/supabase/client'; // Corrected path
import { AddStudentModal } from './AddStudentModal'; // Importar o novo modal
import { showSuccess, showError, showLoading, dismissToast } from '../src/utils/toast'; // Importar toasts

interface AdminPanelProps {
  course: Course;
  students: User[]; // Lista de todos os alunos
  onUpdateCourse: (updatedCourse: Course) => void;
  onUpdateStudent: (updatedStudent: User) => void; // Função para ativar/desativar aluno
  onAddStudent: (studentData: { name: string; email: string; password: string; avatarUrl?: string }) => Promise<void>; // Nova prop
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ course, students, onUpdateCourse, onUpdateStudent, onAddStudent }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'certificate' | 'database' | 'courseSettings'>('students');

  // --- LOADING STATE ---
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isAddingStudent, setIsAddingStudent] = useState(false); // Novo estado para o modal de aluno

  // --- SEARCH STATE ---
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // --- DATABASE DIAGNOSTIC STATE ---
  const [dbCheckResults, setDbCheckResults] = useState<any[]>([]);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  // --- DRAG AND DROP STATE ---
  const [draggedModuleIdx, setDraggedModuleIdx] = useState<number | null>(null);
  const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ modIdx: number, lessIdx: number } | null>(null);

  // --- ADD STUDENT MODAL STATE ---
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // --- COURSE SETTINGS STATE ---
  const [courseSettingsForm, setCourseSettingsForm] = useState({
    title: course.title,
    courseCoverUrl: course.courseCoverUrl || ''
  });
  const [showCourseSaveSuccess, setShowCourseSaveSuccess] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false); // Novo estado para upload da capa
  const [uploadCoverProgress, setUploadCoverProgress] = useState(0); // Progresso do upload da capa
  const fileInputCoverRef = useRef<HTMLInputElement>(null); // Ref para o input de arquivo da capa

  useEffect(() => {
    // Simula um delay de rede ao carregar o componente para exibir o spinner
    const timer = setTimeout(() => {
      setIsLoadingStudents(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCourseSettingsForm({
      title: course.title,
      courseCoverUrl: course.courseCoverUrl || ''
    });
  }, [course.title, course.courseCoverUrl]);

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
  const [isUploading, setIsUploading] = useState(false); // Novo estado
  const [uploadProgress, setUploadProgress] = useState(0); // Novo estado
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

  // --- DB CHECK FUNCTION ---
  const checkDatabaseHealth = async () => {
    setIsCheckingDb(true);
    const results = [];

    if (!supabase) {
      setDbCheckResults([{ name: 'Cliente Supabase', status: 'Erro', message: 'Cliente não inicializado (.env ausente?)' }]);
      setIsCheckingDb(false);
      return;
    }

    try {
      // 1. Check Auth/Connection
      const { error: authError } = await supabase.auth.getSession();
      results.push({
        name: 'Conexão (Auth)',
        status: authError ? 'Erro' : 'OK',
        message: authError ? authError.message : 'Conectado com sucesso'
      });

      // 2. Check Tables
      // Nota: Como não podemos listar todas as tabelas via API pública facilmente sem ser admin,
      // verificamos a existência das tabelas esperadas pela aplicação.
      const tablesToCheck = ['courses', 'modules', 'lessons', 'materials', 'quizzes', 'quiz_options'];

      for (const table of tablesToCheck) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        results.push({
          name: `Tabela: ${table}`,
          status: error ? 'Erro' : 'OK',
          count: count !== null ? count : '-',
          message: error ? error.message : 'Acessível'
        });
      }

      // 3. Check Storage Bucket (course-covers)
      const { data: listData, error: listError } = await supabase.storage.from('course-covers').list();
      results.push({
        name: 'Storage Bucket: course-covers',
        status: listError ? 'Erro' : 'OK',
        message: listError ? listError.message : 'Acessível'
      });


    } catch (e: any) {
      results.push({ name: 'Diagnóstico Crítico', status: 'Erro Fatal', message: e.message });
    }

    setDbCheckResults(results);
    setIsCheckingDb(false);
  };


  // --- DRAG AND DROP HANDLERS ---
  // (Mantidos inalterados para brevidade, mas incluídos no componente)
  const handleModuleDragStart = (index: number) => { setDraggedModuleIdx(index); };
  const handleModuleDragEnter = (targetIndex: number) => {
    if (draggedModuleIdx === null || draggedModuleIdx === targetIndex) return;
    const newModules = [...course.modules];
    const draggedItem = newModules[draggedModuleIdx];
    newModules.splice(draggedModuleIdx, 1);
    newModules.splice(targetIndex, 0, draggedItem);
    onUpdateCourse({ ...course, modules: newModules });
    setDraggedModuleIdx(targetIndex);
  };
  const handleDragEnd = async () => {
    if (!supabase) { setDraggedModuleIdx(null); setDraggedLessonInfo(null); return; }

    // Se houve mudança de ordem de módulos
    if (draggedModuleIdx !== null) {
      const toastId = showLoading('Sincronizando ordem dos módulos...');
      try {
        // Salva a ordem de todos os módulos
        const promises = course.modules.map((m, idx) =>
          supabase!.from('modules').update({ order_index: idx }).eq('id', m.id)
        );
        await Promise.all(promises);
        showSuccess('Ordem dos módulos sincronizada!');
      } catch (err: any) {
        showError('Erro ao sincronizar ordem dos módulos');
      } finally {
        dismissToast(toastId);
      }
    }

    // Se houve mudança de ordem de aulas
    if (draggedLessonInfo !== null) {
      const toastId = showLoading('Sincronizando ordem das aulas...');
      try {
        const targetModule = course.modules[draggedLessonInfo.modIdx];
        const promises = targetModule.lessons.map((l, idx) =>
          supabase!.from('lessons').update({ order_index: idx }).eq('id', l.id)
        );
        await Promise.all(promises);
        showSuccess('Ordem das aulas sincronizada!');
      } catch (err: any) {
        showError('Erro ao sincronizar ordem das aulas');
      } finally {
        dismissToast(toastId);
      }
    }

    setDraggedModuleIdx(null);
    setDraggedLessonInfo(null);
  };
  const handleLessonDragStart = (modIdx: number, lessIdx: number) => { setDraggedLessonInfo({ modIdx, lessIdx }); };
  const handleLessonDragEnter = (targetModIdx: number, targetLessIdx: number) => {
    if (!draggedLessonInfo || draggedLessonInfo.modIdx !== targetModIdx || draggedLessonInfo.lessIdx === targetLessIdx) return;
    const newModules = [...course.modules];
    const targetModule = newModules[targetModIdx];
    const newLessons = [...targetModule.lessons];
    const draggedLesson = newLessons[draggedLessonInfo.lessIdx];
    newLessons.splice(draggedLessonInfo.lessIdx, 1);
    newLessons.splice(targetLessIdx, 0, draggedLesson);
    newModules[targetModIdx] = { ...targetModule, lessons: newLessons };
    onUpdateCourse({ ...course, modules: newModules });
    setDraggedLessonInfo({ modIdx: targetModIdx, lessIdx: targetLessIdx });
  };


  // --- HELPERS (Certificate, Content, File Upload) ---
  const handleCertChange = (field: keyof CertificateConfig, value: any) => {
    const updatedForm = { ...certForm, [field]: value };
    setCertForm(updatedForm);
    onUpdateCourse({ ...course, certificateConfig: updatedForm });
  };
  const handleSaveCertificate = async () => {
    if (!supabase) return;
    const toastId = showLoading('Salvando configurações do certificado...');
    try {
      const { error } = await supabase
        .from('courses')
        .update({ certificate_config: certForm })
        .eq('id', course.id);

      if (error) throw error;

      onUpdateCourse({ ...course, certificateConfig: certForm });
      showSuccess('Configurações do certificado salvas!');
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (err: any) {
      showError(`Erro ao salvar certificado: ${err.message}`);
    } finally {
      dismissToast(toastId);
    }
  };
  const handleCourseSettingsChange = (field: keyof typeof courseSettingsForm, value: string) => {
    setCourseSettingsForm(prev => ({ ...prev, [field]: value }));
  };
  const handleSaveCourseSettings = async () => {
    if (!supabase) {
      showError('Supabase não inicializado.');
      return;
    }
    const toastId = showLoading('Salvando configurações do curso...');
    try {
      // Atualiza o curso no Supabase
      const { error } = await supabase
        .from('courses')
        .update({
          title: courseSettingsForm.title,
          course_cover_url: courseSettingsForm.courseCoverUrl
        })
        .eq('id', course.id); // Assume que o curso tem um ID fixo 'c_quantum_full'

      if (error) throw error;

      onUpdateCourse({ ...course, title: courseSettingsForm.title, courseCoverUrl: courseSettingsForm.courseCoverUrl });
      showSuccess('Configurações do curso salvas com sucesso!');
      setShowCourseSaveSuccess(true);
      setTimeout(() => setShowCourseSaveSuccess(false), 3000);
    } catch (error: any) {
      showError(`Erro ao salvar configurações: ${error.message}`);
    } finally {
      dismissToast(toastId);
    }
  };

  const handleCourseCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase) {
      showError('Supabase client não inicializado. Verifique suas variáveis de ambiente.');
      return;
    }

    setIsUploadingCover(true);
    setUploadCoverProgress(0);
    const toastId = showLoading('Enviando imagem da capa...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `course_covers/${fileName}`;

      const { data, error } = await supabase.storage
        .from('course-covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // onUploadProgress is not directly supported by the client-side upload method
          // For real progress, you'd need a more complex setup (e.g., serverless function)
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('course-covers')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) throw new Error('Não foi possível obter a URL pública da imagem.');

      setCourseSettingsForm(prev => ({ ...prev, courseCoverUrl: publicUrlData.publicUrl }));
      showSuccess('Imagem da capa enviada com sucesso!');
      setUploadCoverProgress(100); // Simula 100% ao finalizar
    } catch (error: any) {
      showError(`Erro ao enviar imagem: ${error.message}`);
      setUploadCoverProgress(0);
    } finally {
      dismissToast(toastId);
      setIsUploadingCover(false);
      if (fileInputCoverRef.current) fileInputCoverRef.current.value = ''; // Limpa o input
    }
  };

  const toggleModuleStatus = async (module: Module) => {
    if (!supabase) return;
    const toastId = showLoading(module.isActive ? 'Desativando módulo...' : 'Ativando módulo...');
    try {
      const { error } = await supabase
        .from('modules')
        .update({ is_active: !module.isActive })
        .eq('id', module.id);

      if (error) throw error;

      const newModules = course.modules.map(m => m.id === module.id ? { ...m, isActive: !m.isActive } : m);
      onUpdateCourse({ ...course, modules: newModules });
      showSuccess(`Módulo ${!module.isActive ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (err: any) {
      showError(`Erro ao atualizar status: ${err.message}`);
    } finally {
      dismissToast(toastId);
    }
  };
  const toggleLessonStatus = async (moduleId: string, lesson: Lesson) => {
    if (!supabase) return;
    const toastId = showLoading(lesson.isActive ? 'Desativando aula...' : 'Ativando aula...');
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_active: !lesson.isActive })
        .eq('id', lesson.id);

      if (error) throw error;

      const newModules = course.modules.map(m => {
        if (m.id === moduleId) {
          const newLessons = m.lessons.map(l => l.id === lesson.id ? { ...l, isActive: !l.isActive } : l);
          return { ...m, lessons: newLessons };
        }
        return m;
      });
      onUpdateCourse({ ...course, modules: newModules });
      showSuccess(`Aula ${!lesson.isActive ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (err: any) {
      showError(`Erro ao atualizar status da aula: ${err.message}`);
    } finally {
      dismissToast(toastId);
    }
  };
  const moveModuleUp = async (index: number) => {
    if (index === 0 || !supabase) return;
    const toastId = showLoading('Reordenando módulos...');
    try {
      const newModules = [...course.modules];
      const mod1 = newModules[index];
      const mod2 = newModules[index - 1];

      // Update in DB (swap order_index)
      // Assuming order_index matches current array index
      const { error: err1 } = await supabase.from('modules').update({ order_index: index - 1 }).eq('id', mod1.id);
      const { error: err2 } = await supabase.from('modules').update({ order_index: index }).eq('id', mod2.id);

      if (err1 || err2) throw err1 || err2;

      newModules[index] = mod2;
      newModules[index - 1] = mod1;
      onUpdateCourse({ ...course, modules: newModules });
      showSuccess('Módulos reordenados!');
    } catch (err: any) {
      showError(`Erro ao reordenar: ${err.message}`);
    } finally {
      dismissToast(toastId);
    }
  };
  const moveModuleDown = async (index: number) => {
    if (index === course.modules.length - 1 || !supabase) return;
    const toastId = showLoading('Reordenando módulos...');
    try {
      const newModules = [...course.modules];
      const mod1 = newModules[index];
      const mod2 = newModules[index + 1];

      const { error: err1 } = await supabase.from('modules').update({ order_index: index + 1 }).eq('id', mod1.id);
      const { error: err2 } = await supabase.from('modules').update({ order_index: index }).eq('id', mod2.id);

      if (err1 || err2) throw err1 || err2;

      newModules[index] = mod2;
      newModules[index + 1] = mod1;
      onUpdateCourse({ ...course, modules: newModules });
      showSuccess('Módulos reordenados!');
    } catch (err: any) {
      showError(`Erro ao reordenar: ${err.message}`);
    } finally {
      dismissToast(toastId);
    }
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
  const saveModule = async () => {
    if (!moduleForm.title || !supabase) return alert("Título é obrigatório");
    const toastId = showLoading('Salvando módulo...');
    try {
      const isNew = !editingModuleId;
      const moduleId = editingModuleId || `m_${Date.now()}`;

      const moduleData = {
        id: moduleId,
        course_id: course.id,
        title: moduleForm.title,
        description: moduleForm.description || '',
        is_locked: !!moduleForm.isLocked,
        is_active: moduleForm.isActive ?? true,
        order_index: isNew ? course.modules.length : (course.modules.find(m => m.id === editingModuleId)?.id ? course.modules.findIndex(m => m.id === editingModuleId) : course.modules.length)
      };

      const { error } = await supabase
        .from('modules')
        .upsert(moduleData);

      if (error) throw error;

      let newModules = [...course.modules];
      if (editingModuleId) {
        newModules = newModules.map(m => m.id === editingModuleId ? { ...m, ...moduleForm } as Module : m);
      } else {
        const newModule: Module = {
          id: moduleId,
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
      showSuccess(`Módulo ${isNew ? 'criado' : 'atualizado'} com sucesso!`);
    } catch (err: any) {
      showError(`Erro ao salvar módulo: ${err.message}`);
    } finally {
      dismissToast(toastId);
    }
  };
  const deleteModule = async (moduleId: string) => {
    if (!supabase) return;
    if (window.confirm("Tem certeza? Todas as aulas deste módulo serão apagadas do banco de dados.")) {
      const toastId = showLoading('Excluindo módulo...');
      try {
        // As foreign keys devem estar configuradas com ON DELETE CASCADE no DB
        // Mas para garantir, podemos limpar manualmente se necessário.
        // Pelo esquema anterior, as aulas dependem de módulos.

        const { error } = await supabase
          .from('modules')
          .delete()
          .eq('id', moduleId);

        if (error) throw error;

        const newModules = course.modules.filter(m => m.id !== moduleId);
        onUpdateCourse({ ...course, modules: newModules });
        showSuccess('Módulo excluído com sucesso!');
      } catch (err: any) {
        showError(`Erro ao excluir módulo: ${err.message}`);
      } finally {
        dismissToast(toastId);
      }
    }
  };
  const openLessonModal = (moduleId: string, lesson?: Lesson) => {
    setActiveModuleForLesson(moduleId);
    setNewMaterial({ title: '', url: '', type: 'link' });
    setIsUploading(false);
    if (lesson) {
      setLessonForm(JSON.parse(JSON.stringify(lesson)));
      setEditingLessonId(lesson.id);
    } else {
      setLessonForm({ title: '', description: '', videoId: '', duration: '', content: '', isActive: true, materials: [], quiz: { id: `q_${Date.now()}`, question: '', options: [{ id: 'opt_1', text: '', isCorrect: false }, { id: 'opt_2', text: '', isCorrect: false }] } });
      setEditingLessonId(null);
    }
    setIsLessonModalOpen(true);
  };
  const saveLesson = async () => {
    if (!lessonForm.title || !activeModuleForLesson || !supabase) return alert("Título e Módulo são obrigatórios");
    const toastId = showLoading('Salvando aula e conteúdos...');
    try {
      const isNew = !editingLessonId;
      const lessonId = editingLessonId || `l_${Date.now()}`;

      const moduleIdx = course.modules.findIndex(m => m.id === activeModuleForLesson);
      const orderIndex = isNew
        ? (course.modules[moduleIdx]?.lessons.length || 0)
        : (course.modules[moduleIdx]?.lessons.findIndex(l => l.id === editingLessonId) ?? 0);

      // 1. Save Lesson
      const lessonData = {
        id: lessonId,
        module_id: activeModuleForLesson,
        title: lessonForm.title,
        description: lessonForm.description || '',
        video_id: lessonForm.videoId || '',
        duration: lessonForm.duration || '',
        content: lessonForm.content || '',
        is_active: lessonForm.isActive ?? true,
        order_index: orderIndex
      };

      const { error: lessonError } = await supabase.from('lessons').upsert(lessonData);
      if (lessonError) throw lessonError;

      // 2. Save Materials
      // Delete old materials and insert new ones to keep it simple
      await supabase.from('materials').delete().eq('lesson_id', lessonId);
      if (lessonForm.materials && lessonForm.materials.length > 0) {
        const materialsData = lessonForm.materials.map(m => ({
          id: m.id || `mat_${Math.random().toString(36).substr(2, 9)}`,
          lesson_id: lessonId,
          title: m.title,
          url: m.url,
          type: m.type
        }));
        const { error: matError } = await supabase.from('materials').insert(materialsData);
        if (matError) throw matError;
      }

      // 3. Save Quiz
      if (lessonForm.quiz) {
        const quizId = lessonForm.quiz.id || `q_${Date.now()}`;
        const { error: quizError } = await supabase.from('quizzes').upsert({
          id: quizId,
          lesson_id: lessonId,
          question: lessonForm.quiz.question || ''
        });
        if (quizError) throw quizError;

        // 4. Save Quiz Options
        await supabase.from('quiz_options').delete().eq('quiz_id', quizId);
        if (lessonForm.quiz.options && lessonForm.quiz.options.length > 0) {
          const optionsData = lessonForm.quiz.options.map((opt, idx) => ({
            id: opt.id || `opt_${quizId}_${idx}`,
            quiz_id: quizId,
            text: opt.text,
            is_correct: opt.isCorrect
          }));
          const { error: optError } = await supabase.from('quiz_options').insert(optionsData);
          if (optError) throw optError;
        }
      }

      // Update State
      const newModules = [...course.modules];
      const lessonToSave = { ...lessonForm, id: lessonId, materials: lessonForm.materials || [] } as Lesson;
      if (editingLessonId) {
        const lessons = newModules[moduleIdx].lessons.map(l => l.id === editingLessonId ? lessonToSave : l);
        newModules[moduleIdx] = { ...newModules[moduleIdx], lessons };
      } else {
        newModules[moduleIdx].lessons.push(lessonToSave);
      }

      onUpdateCourse({ ...course, modules: newModules });
      setIsLessonModalOpen(false);
      showSuccess(`Aula ${isNew ? 'criada' : 'atualizada'} com sucesso!`);
    } catch (err: any) {
      showError(`Erro ao salvar aula: ${err.message}`);
    } finally {
      dismissToast(toastId);
    }
  };
  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!supabase) return;
    if (window.confirm("Apagar esta aula do banco de dados?")) {
      const toastId = showLoading('Excluindo aula...');
      try {
        const { error } = await supabase
          .from('lessons')
          .delete()
          .eq('id', lessonId);

        if (error) throw error;

        const newModules = [...course.modules];
        const modIdx = newModules.findIndex(m => m.id === moduleId);
        newModules[modIdx].lessons = newModules[modIdx].lessons.filter(l => l.id !== lessonId);
        onUpdateCourse({ ...course, modules: newModules });
        showSuccess('Aula excluída com sucesso!');
      } catch (err: any) {
        showError(`Erro ao excluir aula: ${err.message}`);
      } finally {
        dismissToast(toastId);
      }
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const fakeUrl = `https://storage.quantum.edu/files/${file.name.replace(/\s/g, '_')}`;
          const autoTitle = newMaterial.title || file.name.split('.')[0];
          setNewMaterial(prev => ({ ...prev, url: fakeUrl, title: autoTitle }));
          setIsUploading(false);
        }
      }, 150);
    }
  };
  const addMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) return;
    const materialToAdd: Material = { id: `mat_${Date.now()}`, title: newMaterial.title, url: newMaterial.url, type: newMaterial.type as any };
    setLessonForm({ ...lessonForm, materials: [...(lessonForm.materials || []), materialToAdd] });
    setNewMaterial({ title: '', url: '', type: 'link' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const removeMaterial = (materialId: string) => {
    setLessonForm({ ...lessonForm, materials: (lessonForm.materials || []).filter(m => m.id !== materialId) });
  };
  const updateExistingMaterial = (idx: number, field: keyof Material, value: any) => {
    const newMaterials = [...(lessonForm.materials || [])];
    newMaterials[idx] = { ...newMaterials[idx], [field]: value };
    setLessonForm({ ...lessonForm, materials: newMaterials });
  };
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
  const toggleStudentActive = async (student: User) => {
    if (!supabase) return;
    const toastId = showLoading(student.isActive ? 'Desativando aluno...' : 'Ativando aluno...');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !student.isActive })
        .eq('id', student.id);

      if (error) throw error;

      onUpdateStudent({ ...student, isActive: !student.isActive });
      showSuccess(`Aluno ${!student.isActive ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (err: any) {
      showError(`Erro ao atualizar status do aluno: ${err.message}`);
    } finally {
      dismissToast(toastId);
    }
  };

  const handleAddStudentSubmit = async (studentData: { name: string; email: string; password: string; avatarUrl?: string }) => {
    setIsAddingStudent(true);
    const toastId = showLoading('Cadastrando novo aluno...');
    try {
      await onAddStudent(studentData);
      showSuccess('Aluno cadastrado com sucesso!');
      setIsAddStudentModalOpen(false);
    } catch (error: any) {
      showError(`Erro ao cadastrar aluno: ${error.message}`);
    } finally {
      dismissToast(toastId);
      setIsAddingStudent(false);
    }
  };

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const totalXP = students.reduce((acc, s) => acc + s.points, 0);
  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / (totalStudents || 1));
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );
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
            {activeTab === 'students' && <Button onClick={() => setIsAddStudentModalOpen(true)}>+ Cadastrar Novo Aluno</Button>} {/* Novo Botão */}
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
            onClick={() => setActiveTab('courseSettings')} // Nova aba
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'courseSettings' ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Configurações do Curso
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'certificate' ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Certificado
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'database' ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Diagnóstico DB
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

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-800 dark:text-white">Base de Alunos</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        className="pl-4 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-64"
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
                className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${module.isActive ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700 opacity-60 grayscale-[0.5]'
                  } ${draggedModuleIdx === index ? 'opacity-40 ring-2 ring-brand-500 border-transparent' : ''}`}
                draggable
                onDragStart={() => handleModuleDragStart(index)}
                onDragEnter={() => handleModuleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 cursor-move group">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400 cursor-grab hover:text-slate-600 dark:hover:text-slate-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
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
                    <button onClick={(e) => { e.stopPropagation(); toggleModuleStatus(module); }} title={module.isActive ? "Desativar Módulo" : "Ativar Módulo"} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${module.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
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

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-slate-50/30 dark:bg-slate-900/10">
                  {module.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className={`p-4 flex items-center justify-between transition-colors cursor-move 
                        ${lesson.isActive ? 'hover:bg-slate-50 dark:hover:bg-slate-700/20' : 'bg-slate-50/50 dark:bg-slate-800/50 opacity-70'}
                        ${draggedLessonInfo?.modIdx === index && draggedLessonInfo?.lessIdx === lIdx ? 'opacity-40 bg-slate-100 dark:bg-slate-700' : ''}
                        `}
                      draggable
                      onDragStart={(e) => { e.stopPropagation(); handleLessonDragStart(index, lIdx); }}
                      onDragEnter={(e) => { e.stopPropagation(); handleLessonDragEnter(index, lIdx); }}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center gap-4">
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

        {/* --- COURSE SETTINGS TAB (NEW) --- */}
        {activeTab === 'courseSettings' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Informações Gerais do Curso</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Título do Curso</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={courseSettingsForm.title}
                    onChange={e => handleCourseSettingsChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Imagem de Capa</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputCoverRef}
                      onChange={handleCourseCoverUpload}
                      className="hidden"
                      accept="image/*"
                      disabled={isUploadingCover}
                    />
                    <Button
                      onClick={() => fileInputCoverRef.current?.click()}
                      variant="outline"
                      size="sm"
                      disabled={isUploadingCover}
                      className="flex-shrink-0 dark:border-slate-600 dark:text-slate-300"
                    >
                      {isUploadingCover ? 'Enviando...' : 'Escolher Imagem'}
                    </Button>
                    <input
                      className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={courseSettingsForm.courseCoverUrl}
                      onChange={e => handleCourseSettingsChange('courseCoverUrl', e.target.value)}
                      placeholder="URL da imagem de capa"
                      readOnly={isUploadingCover}
                    />
                  </div>
                  {isUploadingCover && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all duration-150 ease-linear"
                        style={{ width: `${uploadCoverProgress}%` }}
                      />
                    </div>
                  )}
                  {courseSettingsForm.courseCoverUrl && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Pré-visualização:</p>
                      <img src={courseSettingsForm.courseCoverUrl} alt="Capa do Curso" className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Button
                  onClick={handleSaveCourseSettings}
                  fullWidth
                  className="flex items-center justify-center gap-2"
                  disabled={isUploadingCover}
                >
                  {showCourseSaveSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Salvo com Sucesso!
                    </>
                  ) : (
                    "Salvar Configurações do Curso"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- CERTIFICATE TAB --- */}
        {activeTab === 'certificate' && (
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
            {/* Form de Configuração */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Configuração Visual</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Título Principal</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={certForm.title}
                      onChange={e => handleCertChange('title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subtítulo</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={certForm.subtitle}
                      onChange={e => handleCertChange('subtitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nome da Instituição</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={certForm.institutionName}
                      onChange={e => handleCertChange('institutionName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cor Primária (Hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={certForm.primaryColor}
                        onChange={e => handleCertChange('primaryColor', e.target.value)}
                      />
                      <input
                        className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase font-mono dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={certForm.primaryColor}
                        onChange={e => handleCertChange('primaryColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Assinatura & Detalhes</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nome do Assinante</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={certForm.signerName}
                      onChange={e => handleCertChange('signerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cargo do Assinante</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={certForm.signerRole}
                      onChange={e => handleCertChange('signerRole', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Texto do Corpo</label>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={certForm.bodyText}
                      onChange={e => handleCertChange('bodyText', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sealCheck"
                      checked={certForm.displaySeal}
                      onChange={e => handleCertChange('displaySeal', e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="sealCheck" className="text-sm text-slate-700 dark:text-slate-300">Exibir Selo de Verificação</label>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Button
                    onClick={handleSaveCertificate}
                    fullWidth
                    className="flex items-center justify-center gap-2"
                  >
                    {showSaveSuccess ? (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Salvo com Sucesso!
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview em Tempo Real */}
            <div className="w-full lg:w-2/3 flex flex-col">
              <div className="bg-slate-800 p-8 rounded-xl shadow-inner border border-slate-700 flex-1 flex items-center justify-center min-h-[400px] overflow-hidden relative">
                <p className="absolute top-4 left-4 text-xs text-slate-500 uppercase tracking-wider font-bold z-10">Preview em Tempo Real</p>
                <div className="transform scale-[0.45] md:scale-[0.6] origin-center shadow-2xl">
                  <Certificate
                    studentName="Nome do Aluno Exemplo"
                    courseTitle={course.title}
                    completionDate="12/05/2024"
                    config={certForm}
                  />
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">
                Esta é apenas uma pré-visualização. O PDF final terá qualidade de impressão (A4).
              </p>
            </div>
          </div>
        )}

        {/* --- DATABASE DIAGNOSTIC TAB (NEW) --- */}
        {activeTab === 'database' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status da Conexão</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Verifique a saúde do banco de dados e integridade das tabelas.</p>
                </div>
                <Button onClick={checkDatabaseHealth} disabled={isCheckingDb}>
                  {isCheckingDb ? 'Verificando...' : 'Executar Diagnóstico'}
                </Button>
              </div>

              {dbCheckResults.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium">
                      <tr>
                        <th className="px-4 py-3">Componente</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Registros</th>
                        <th className="px-4 py-3">Mensagem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {dbCheckResults.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{res.name}</td>
                          <td className="px-4 py-3">
                            {res.status === 'OK' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Erro
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                            {res.count !== undefined ? res.count : '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-xs" title={res.message}>
                            {res.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  <p className="text-slate-500 dark:text-slate-400">Clique em "Executar Diagnóstico" para iniciar a verificação.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL DE AULA --- */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl my-8 border border-slate-200 dark:border-slate-700 animate-scale-in">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{editingLessonId ? 'Editar Aula' : 'Nova Aula'}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Esquerda: Dados Básicos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Título da Aula</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={lessonForm.title}
                    onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">YouTube ID</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono text-xs"
                      placeholder="Ex: dqw4w9WgXcQ"
                      value={lessonForm.videoId}
                      onChange={e => setLessonForm({ ...lessonForm, videoId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duração</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="Ex: 15 min"
                      value={lessonForm.duration}
                      onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Descrição Curta</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={lessonForm.description}
                    onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Conteúdo (Markdown/Texto)</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white h-40 font-mono text-sm"
                    value={lessonForm.content}
                    onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
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
                        onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value as any, url: '', title: '' })}
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
                        {isUploading ? (
                          <div className="w-full flex flex-col justify-center px-1">
                            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                              <span>Enviando...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-brand-600 h-full rounded-full transition-all duration-150 ease-linear"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
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
                              onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="col-span-4">
                          <input
                            placeholder="Título"
                            className="w-full text-xs px-2 py-1.5 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={newMaterial.title}
                            onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            placeholder="https://..."
                            className="w-full text-xs px-2 py-1.5 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={newMaterial.url}
                            onChange={e => setNewMaterial({ ...newMaterial, url: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <div className="col-span-1">
                      <button
                        onClick={addMaterial}
                        disabled={!newMaterial.url || isUploading}
                        className="w-full h-full bg-brand-600 text-white rounded flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    onChange={e => setLessonForm({ ...lessonForm, quiz: { ...lessonForm.quiz!, question: e.target.value } })}
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

      {/* --- MODAL DE MÓDULO (Simplificado para o código não ficar gigante, mas necessário) --- */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{editingModuleId ? 'Editar Módulo' : 'Novo Módulo'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Título</label>
                <input className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Descrição</label>
                <textarea className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white h-24" value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={moduleForm.isLocked} onChange={e => setModuleForm({ ...moduleForm, isLocked: e.target.checked })} />
                <label className="text-sm dark:text-slate-300">Trancar até completar anterior?</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setIsModuleModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveModule}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onAddStudent={handleAddStudentSubmit}
        isLoading={isAddingStudent}
      />
    </div>
  );
};