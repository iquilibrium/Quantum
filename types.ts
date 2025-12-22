export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'coordinator';
  progress: number; // 0 to 100
  points: number;
  level: number;
  badges: string[];
  completedLessons: string[]; // Array of Lesson IDs
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

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoId: string; // YouTube ID
  duration: string;
  content: string; // Markdown or HTML string
  quiz: Quiz;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isLocked: boolean;
}

export interface Course {
  id: string;
  title: string;
  modules: Module[];
}

export type ViewState = 'dashboard' | 'course' | 'admin' | 'profile' | 'certificate';