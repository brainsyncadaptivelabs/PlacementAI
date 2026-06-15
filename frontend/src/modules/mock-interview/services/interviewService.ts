import api from '@/lib/api';
import { MockInterview, MockInterviewRequest, MockInterviewResponse } from '../types/interview.types';

export const interviewService = {
  generateInterview: async (request: MockInterviewRequest): Promise<MockInterviewResponse> => {
    const response = await api.post('/interview/generate', request);
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
  }
};
