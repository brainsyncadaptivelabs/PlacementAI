import api from '@/lib/api';
import { MockInterview, MockInterviewRequest, MockInterviewResponse } from '../types/interview.types';

export const interviewService = {
  generateInterview: async (request: MockInterviewRequest): Promise<MockInterviewResponse> => {
    const response = await api.post('/interview/generate', request);
    return response.data;
  },

  startAdaptiveInterview: async (request: MockInterviewRequest): Promise<{ interviewId: number, firstQuestion: string }> => {
    const response = await api.post('/interview/adaptive/start', request);
    return response.data;
  },

  answerAdaptiveInterview: async (interviewId: number, answer: string): Promise<{ isFinished: boolean, nextQuestion: string | null }> => {
    const response = await api.post('/interview/adaptive/answer', { interviewId, answer });
    return response.data;
  },

  saveResults: async (interview: MockInterview): Promise<MockInterview> => {
    const response = await api.post('/interview/save', interview);
    return response.data;
  },

  getHistory: async (): Promise<MockInterview[]> => {
    const response = await api.get('/interview/history');
    return response.data;
  },

  getById: async (id: string | number): Promise<MockInterview> => {
    const response = await api.get(`/interview/${id}`);
    return response.data;
  },

  deleteInterview: async (id: number | string): Promise<void> => {
    await api.delete(`/interview/${id}`);
  },

  getAnalytics: async (): Promise<any> => {
    const response = await api.get('/interview/analytics');
    return response.data;
  }
};
