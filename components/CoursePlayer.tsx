import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, Module } from '../types';
import { Button } from './Button';

interface CoursePlayerProps {
  course: Course;
  completedLessons: string[];
  onCompleteLesson: (lessonId: string) => void;
  onBack: () => void;
  onViewCertificate: () => void; // New prop for navigation
  initialModuleIndex?: number;
  initialLessonIndex?: number;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ 
  course, 
  completedLessons, 
  onCompleteLesson,
  onBack,
  onViewCertificate,
  initialModuleIndex = 0,
  initialLessonIndex = 0
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(initialModuleIndex);
  const [activeLessonIndex, setActiveLessonIndex] = useState(initialLessonIndex);
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'quiz'>('content');
  const [noteContent, setNoteContent] = useState('');
  
  // Note saving state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quiz specific states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Update internal state if props change (navigating from outside while mounted, or remounting)
  useEffect(() => {
    setActiveModuleIndex(initialModuleIndex);
    setActiveLessonIndex(initialLessonIndex);
  }, [initialModuleIndex, initialLessonIndex]);

  const activeModule = course.modules[activeModuleIndex];
  const activeLesson = activeModule.lessons[activeLessonIndex];
  const isLessonCompleted = completedLessons.includes(activeLesson.id);

  // Determine if this is the absolute last lesson of the course
  const isLastModule = activeModuleIndex === course.modules.length - 1;
  const isLastLessonOfModule = activeLessonIndex === activeModule.lessons.length - 1;
  const isCourseFinished = isLastModule && isLastLessonOfModule;

  useEffect(() => {
    setActiveTab('content');
    setSelectedOptionId(null);
    setIsCorrect(false);
    setNoteContent(''); 
    setSaveStatus('idle');
  }, [activeLesson.id]);

  const handleLessonChange = (mIndex: number, lIndex: number) => {
    const targetModule = course.modules[mIndex];
    if (targetModule.isLocked) return;
    
    // Logic to prevent jumping ahead locked lessons
    if (lIndex > 0) {
       const prevLessonId = targetModule.lessons[lIndex - 1].id;
       if (!completedLessons.includes(prevLessonId)) {
         alert("Para liberar a próxima aula, você precisa acertar o Quiz da aula anterior.");
         return;
       }
    } else if (mIndex > 0) {
        // Check if last lesson of previous module is done
        const prevModule = course.modules[mIndex - 1];
        const lastLessonId = prevModule.lessons[prevModule.lessons.length - 1].id;
        if (!completedLessons.includes(lastLessonId)) {
             alert("Para liberar este módulo, você precisa completar todas as atividades do módulo anterior.");
             return;
        }
    }

    setActiveModuleIndex(mIndex);
    setActiveLessonIndex(lIndex);
  };

  const handleOptionSelect = (optionId: string, isOptCorrect: boolean) => {
    // Se o usuário já acertou, não permite mudar. Se errou, permite tentar outra.
    if (isLessonCompleted || isCorrect) return; 
    
    setSelectedOptionId(optionId);
    
    if (isOptCorrect) {
      setIsCorrect(true);
      onCompleteLesson(activeLesson.id);
    } else {
      setIsCorrect(false);
    }
  };

  const nextLesson = () => {
    if (activeLessonIndex < activeModule.lessons.length - 1) {
      handleLessonChange(activeModuleIndex, activeLessonIndex + 1);
    } else if (activeModuleIndex < course.modules.length - 1) {
      handleLessonChange(activeModuleIndex + 1, 0);
    }
  };

  const handleManualComplete = () => {
    // Alteração: O botão não conclui mais a aula se não estiver feita.
    // Ele redireciona para o Quiz SEM mostrar alerta.
    if (!isLessonCompleted) {
      setActiveTab('quiz');
    } else {
      // Se já estiver completa, apenas avança
      if (!isCourseFinished) {
        nextLesson();
      }
    }
  };

  // Logic for Notes Auto-Save
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNoteContent(newValue);
    setSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Debounce save (simulate API call after 2 seconds of inactivity)
    autoSaveTimerRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 2000);
  };

  const handleManualSaveNotes = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setSaveStatus('saving');
    
    // Simulate API request
    setTimeout(() => {
      setSaveStatus('saved');
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative transition-colors duration-200">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 md:px-6 justify-between flex-shrink-0 bg-white dark:bg-slate-800 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium hidden md:inline">Dashboard</span>
          </button>
          <div className="border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
            <h2 className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-0.5">{activeModule.title}</h2>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">{activeLesson.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {isLessonCompleted && (
             <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-bold border border-green-200 dark:border-green-800 shadow-sm hidden sm:flex">
               <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
               Concluído
             </span>
           )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <div className="max-w-4xl mx-auto p-4 pb-24 md:p-8 md:pb-12">
            
            {/* Video Player */}
            <div className="aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl mb-8 ring-1 ring-black/5 dark:ring-white/10">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${activeLesson.videoId}`} 
                title={activeLesson.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="flex border-b border-slate-100 dark:border-slate-700 justify-between items-center overflow-x-auto no-scrollbar">
                <div className="flex">
                  <button 
                    onClick={() => setActiveTab('content')}
                    className={`px-4 md:px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'content' ? 'border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-900/10' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    Conteúdo
                  </button>
                  <button 
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 md:px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'notes' ? 'border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-900/10' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    Anotações
                  </button>
                  <button 
                    onClick={() => setActiveTab('quiz')}
                    className={`px-4 md:px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'quiz' ? 'border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-900/10' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    Quiz
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-8">
                {activeTab === 'content' && (
                  <div className="flex flex-col h-full">
                    <div className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-brand-600 dark:prose-a:text-brand-400 max-w-none flex-1">
                      {/* Header com Título e Botão de Ação Imediata */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white m-0">{activeLesson.title}</h3>
                        
                        {/* Primary Action Button Logic */}
                        {isCourseFinished && isLessonCompleted ? (
                           <Button 
                             onClick={onViewCertificate} 
                             size="sm" 
                             className="flex-shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                           >
                             Imprimir Certificado
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                             </svg>
                           </Button>
                        ) : (
                           <Button 
                            onClick={handleManualComplete} 
                            size="sm" 
                            variant={isLessonCompleted ? "outline" : "primary"}
                            className="flex-shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto dark:border-slate-600 dark:text-slate-300"
                           >
                            {isLessonCompleted ? "Próxima" : "Responder Quiz"} 
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                           </Button>
                        )}
                      </div>
                      
                      <div className="whitespace-pre-line text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                        {activeLesson.content}
                      </div>
                    </div>

                    {/* Botão de Conclusão Manual no final do conteúdo */}
                    <div className="mt-8 md:mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                            {isLessonCompleted 
                              ? (isCourseFinished ? "Parabéns! Você concluiu todo o curso." : "Você já completou esta aula.")
                              : "Finalizou o conteúdo? Responda o Quiz para avançar."}
                        </p>
                        
                        {isCourseFinished && isLessonCompleted ? (
                           <div className="w-full text-center animate-fade-in">
                               <Button 
                                onClick={onViewCertificate} 
                                size="lg" 
                                className="flex items-center justify-center gap-2 shadow-lg w-full md:w-auto md:px-12 bg-amber-500 hover:bg-amber-600 border-amber-500 text-white"
                               >
                                  Imprimir Certificado de Conclusão
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                  </svg>
                               </Button>
                               <p className="text-xs text-slate-400 mt-3">Você poderá baixar o PDF na próxima tela.</p>
                           </div>
                        ) : (
                          <Button 
                            onClick={handleManualComplete} 
                            size="lg" 
                            variant={isLessonCompleted ? "secondary" : "primary"}
                            className={`flex items-center justify-center gap-2 shadow-lg w-full ${isLessonCompleted ? 'animate-pulse hover:animate-none dark:bg-slate-700 dark:text-white' : ''}`}
                          >
                              {isLessonCompleted ? "Próxima Aula" : "Responder Quiz para Avançar"}
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                          </Button>
                        )}
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Caderno de Estudos</label>
                        <div className="flex items-center gap-2 h-5">
                            {saveStatus === 'saving' && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 animate-pulse transition-opacity">
                                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Salvando alterações...
                                </span>
                            )}
                            {saveStatus === 'saved' && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-opacity">
                                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Salvo automaticamente
                                </span>
                            )}
                        </div>
                    </div>
                    <textarea 
                      className="w-full flex-1 min-h-[320px] p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm transition-all"
                      placeholder="Escreva seus insights e reflexões sobre esta aula..."
                      value={noteContent}
                      onChange={handleNoteChange}
                    ></textarea>
                    
                    <div className="flex justify-end pt-2 border-t border-slate-50 dark:border-slate-700 mt-2">
                        <Button 
                            onClick={handleManualSaveNotes} 
                            disabled={saveStatus === 'saving' || (saveStatus === 'saved' && noteContent === '')}
                            variant={saveStatus === 'saved' ? "outline" : "primary"}
                            className="min-w-[160px] transition-all duration-300 dark:border-slate-600 dark:text-slate-300"
                        >
                            {saveStatus === 'saving' ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Salvando...
                                </span>
                            ) : (
                                saveStatus === 'saved' ? (
                                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Anotações Salvas
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                        Salvar Anotações
                                    </span>
                                )
                            )}
                        </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="max-w-2xl mx-auto py-2">
                    <div className="mb-8">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-4">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Teste de Conhecimento
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                        {activeLesson.quiz.question}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Responda para ganhar pontos extras no ranking.</p>
                    </div>
                    
                    <div className="space-y-4">
                      {activeLesson.quiz.options.map((option) => {
                        const isSelected = selectedOptionId === option.id;
                        
                        // Definição de estilos base
                        let containerClass = "border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-700/50";
                        let iconClass = "border-slate-300 dark:border-slate-600 text-transparent";
                        let iconSvg = null;
                        let textClass = "text-slate-700 dark:text-slate-300";

                        // Lógica de Feedback Imediato
                        if (isSelected) {
                          if (option.isCorrect) {
                            // Estilo para RESPOSTA CORRETA (Verde)
                            containerClass = "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500 shadow-sm";
                            iconClass = "border-green-500 bg-green-500 text-white";
                            textClass = "text-green-800 dark:text-green-400 font-bold";
                            iconSvg = (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            );
                          } else {
                            // Estilo para RESPOSTA INCORRETA (Vermelho Intenso)
                            // Aumentei a saturação e o ring para destacar
                            containerClass = "border-red-500 bg-red-100 dark:bg-red-900/20 ring-2 ring-red-500 shadow-md transform scale-[1.01]";
                            iconClass = "border-red-500 bg-red-600 text-white";
                            textClass = "text-red-900 dark:text-red-400 font-bold";
                            iconSvg = (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            );
                          }
                        }

                        return (
                          <button
                            key={option.id}
                            disabled={isCorrect} 
                            onClick={() => handleOptionSelect(option.id, option.isCorrect)}
                            className={`
                              relative w-full p-5 text-left rounded-xl border-2 transition-all duration-200 group flex items-center gap-4
                              ${containerClass}
                            `}
                          >
                            {/* Ícone de Status (Check ou X) */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${iconClass}`}>
                              {iconSvg}
                            </div>
                            
                            {/* Texto da Opção */}
                            <span className={`text-base md:text-lg transition-colors duration-200 ${textClass} flex-1`}>
                              {option.text}
                            </span>

                            {/* Badge Incorreto Explicito dentro do botão */}
                            {isSelected && !option.isCorrect && (
                                <span className="flex-shrink-0 text-[10px] md:text-xs font-bold text-red-600 bg-white border border-red-200 px-2 py-1 rounded shadow-sm uppercase tracking-wide animate-pulse">
                                  Incorreto
                                </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Área de Mensagem de Feedback (Aparece após seleção) */}
                    <div className="mt-8 transition-all duration-500 ease-in-out">
                        {selectedOptionId && (
                           <>
                             {/* Feedback Negativo */}
                             {!isCorrect && (
                                <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex flex-col md:flex-row items-center md:items-start gap-4 animate-fade-in text-center md:text-left">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400 flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-900 dark:text-red-300 text-lg mb-1">Resposta Incorreta</h4>
                                        <p className="text-red-800 dark:text-red-400 mb-0">Não desanime. Tente selecionar outra opção para encontrar a resposta certa.</p>
                                    </div>
                                </div>
                             )}

                             {/* Feedback Positivo */}
                             {isCorrect && (
                                <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex flex-col md:flex-row items-center md:items-start gap-4 animate-fade-in text-center md:text-left shadow-sm">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-400 flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-green-900 dark:text-green-300 text-lg mb-1">Excelente!</h4>
                                        <p className="text-green-800 dark:text-green-400">Você compreendeu o conceito fundamental.</p>
                                        
                                        <div className="mt-4 pt-4 border-t border-green-200/60 dark:border-green-800/60 flex justify-center md:justify-end">
                                             {isCourseFinished ? (
                                                <Button 
                                                  onClick={onViewCertificate} 
                                                  size="lg" 
                                                  className="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 shadow-lg"
                                                >
                                                    Imprimir Certificado
                                                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                </Button>
                                             ) : (
                                               <Button onClick={nextLesson} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-lg animate-pulse hover:animate-none">
                                                  Próxima Aula <span className="ml-2">→</span>
                                               </Button>
                                             )}
                                        </div>
                                    </div>
                                </div>
                             )}
                           </>
                        )}

                        {/* Estado quando a aula já estava concluída ao carregar */}
                        {isLessonCompleted && !selectedOptionId && (
                           <div className="p-8 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Quiz Concluído</h4>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">Você já garantiu seus pontos nesta aula.</p>
                                {isCourseFinished ? (
                                    <Button 
                                      onClick={onViewCertificate} 
                                      className="bg-amber-500 hover:bg-amber-600 text-white"
                                    >
                                        Imprimir Certificado
                                    </Button>
                                ) : (
                                    <Button onClick={nextLesson} variant="secondary" className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
                                        Avançar para Próxima Aula →
                                    </Button>
                                )}
                           </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Sidebar (Playlist) */}
        <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 hidden lg:flex flex-col flex-shrink-0 transition-colors">
          <div className="p-5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Lista de Reprodução</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {course.modules.map((module, mIdx) => (
              <div key={module.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className={`px-5 py-4 bg-slate-50/50 dark:bg-slate-700/30 flex items-center justify-between ${module.isLocked ? 'opacity-75' : ''}`}>
                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{module.title}</h4>
                  {module.isLocked && <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                </div>
                {!module.isLocked && (
                  <div>
                    {module.lessons.map((lesson, lIdx) => {
                       const isActive = activeLesson.id === lesson.id;
                       const isDone = completedLessons.includes(lesson.id);
                       // Simplistic lock check for internal playlist
                       const isLocked = lIdx > 0 && !completedLessons.includes(module.lessons[lIdx - 1].id) && !completedLessons.includes(lesson.id);

                       return (
                         <button
                           key={lesson.id}
                           onClick={() => !isLocked && handleLessonChange(mIdx, lIdx)}
                           disabled={isLocked}
                           className={`w-full text-left p-4 pl-6 flex items-start gap-3 text-sm transition-all border-l-[3px] ${
                             isActive 
                               ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-600 dark:border-brand-500 text-brand-900 dark:text-brand-300' 
                               : isLocked 
                                 ? 'text-slate-400 dark:text-slate-600 border-transparent cursor-not-allowed bg-slate-50/30 dark:bg-slate-800'
                                 : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                           }`}
                         >
                           <div className={`mt-0.5 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors ${
                             isDone 
                               ? 'bg-green-500 border-green-500 text-white' 
                               : isActive 
                                 ? 'border-brand-600 dark:border-brand-500 bg-white dark:bg-slate-800'
                                 : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                           }`}>
                             {isDone && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                             {!isDone && isActive && <div className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-500" />}
                           </div>
                           <div className="flex-1">
                             <p className={`font-medium ${isActive ? 'text-brand-900 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>{lesson.title}</p>
                             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {lesson.duration}
                             </p>
                           </div>
                         </button>
                       );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};