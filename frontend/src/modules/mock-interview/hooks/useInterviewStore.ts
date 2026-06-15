import { create } from 'zustand';

interface InterviewState {
  role: string;
  experienceLevel: string;
  questions: string[];
  setInterviewData: (data: { role: string; experienceLevel: string; questions: string[] }) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  role: '',
  experienceLevel: '',
  questions: [],
  setInterviewData: (data) => set(data),
  reset: () => set({ role: '', experienceLevel: '', questions: [] }),
}));
