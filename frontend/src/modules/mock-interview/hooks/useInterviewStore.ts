import { create } from 'zustand';

interface InterviewState {
  role: string;
  experienceLevel: string;
  questions: string[];
  company?: string;
  difficulty?: string;
  interviewType?: string;
  setInterviewData: (data: { 
    role: string; 
    experienceLevel: string; 
    questions: string[];
    company?: string;
    difficulty?: string;
    interviewType?: string;
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
  setInterviewData: (data) => set(data),
  reset: () => set({ role: '', experienceLevel: '', questions: [], company: '', difficulty: '', interviewType: '' }),
}));
