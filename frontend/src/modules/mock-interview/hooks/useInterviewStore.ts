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
  setInterviewData: (data) => set(data),
  reset: () => set({ role: '', experienceLevel: '', questions: [], company: '', difficulty: '', interviewType: '', topic: '', isAdaptive: false, adaptiveInterviewId: undefined }),
}));

