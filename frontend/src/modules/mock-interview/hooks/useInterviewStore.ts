import { create } from 'zustand';

interface InterviewState {
  role: string;
  experienceLevel: string;
  questions: string[];
  company?: string;
  difficulty?: string;
  interviewType?: string;
  topic?: string;
  isAdaptive?: boolean;
  adaptiveInterviewId?: number;
  conversationalStyle?: string;
  setInterviewData: (data: { 
    role: string; 
    experienceLevel: string; 
    questions: string[];
    company?: string;
    difficulty?: string;
    interviewType?: string;
    topic?: string;
    isAdaptive?: boolean;
    adaptiveInterviewId?: number;
    conversationalStyle?: string;
  }) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  role: '',
  experienceLevel: '',
  questions: [],
  company: '',
  difficulty: '',
  interviewType: '',
  topic: '',
  isAdaptive: false,
  adaptiveInterviewId: undefined,
  conversationalStyle: 'Professional',
  setInterviewData: (data) => set(data),
  reset: () => set({ role: '', experienceLevel: '', questions: [], company: '', difficulty: '', interviewType: '', topic: '', isAdaptive: false, adaptiveInterviewId: undefined, conversationalStyle: 'Professional' }),
}));

