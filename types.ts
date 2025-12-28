export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'coordinator';
  isActive: boolean; // Novo campo
  progress: number; // 0 to 100
  points: number;
  level: number;
  badges: string[];
  completedLessons: string[]; // Array of Lesson IDs
  lastAccess?: string; // Para o dashboard
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface Material {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'image' | 'video' | 'doc' | 'ppt' | 'txt';
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoId: string; // YouTube ID
  duration: string;
  content: string; // Markdown or HTML string
  materials: Material[]; // Novo campo
  quiz: Quiz;
  isActive: boolean; // Novo campo
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isLocked: boolean;
  isActive: boolean; // Novo campo
}

export interface CertificateConfig {
  title: string;
  subtitle: string;
  bodyText: string;
  signerName: string;
  signerRole: string;
  institutionName: string;
  primaryColor: string; // Hex code
  displaySeal: boolean;
}

export interface Course {
  id: string;
  title: string;
  modules: Module[];
  certificateConfig: CertificateConfig; // Novo campo de configuração
  courseCoverUrl?: string; // Novo campo para a imagem de capa do curso
}

export type ViewState = 'dashboard' | 'course' | 'admin' | 'profile' | 'certificate';