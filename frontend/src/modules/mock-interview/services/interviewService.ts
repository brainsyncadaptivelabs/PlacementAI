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

  answerAdaptiveInterview: async (
    interviewId: number,
    answer: string,
    code?: string,
    language?: string,
    terminalOutput?: string,
    thinkingTimeSeconds?: number,
    timeTakenSeconds?: number
  ): Promise<{ isFinished: boolean, nextQuestion: string | null }> => {
    const response = await api.post('/interview/adaptive/answer', {
      interviewId,
      answer,
      code,
      language,
      terminalOutput,
      thinkingTimeSeconds,
      timeTakenSeconds
    });
    return response.data;
  },

  generateSpeech: async (text: string): Promise<Blob> => {
    const response = await api.post('/interview/tts', { text }, { responseType: 'blob' });
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
  },

  transcribeVoiceTurn: async (
    interviewId: number,
    audioBlob: Blob,
    thinkingTimeMs: number,
    totalDurationMs: number
  ): Promise<Blob> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    const response = await api.post(
      `/voice/transcribe/${interviewId}?thinkingTimeMs=${thinkingTimeMs}&totalDurationMs=${totalDurationMs}`,
      formData,
      { responseType: 'blob' }
    );
    return response.data;
  },

  cancelAdaptiveInterview: async (interviewId: number): Promise<void> => {
    await api.post(`/interview/adaptive/cancel/${interviewId}`);
  },

  bargeIn: async (
    interviewId: number,
    audioBlob: Blob,
    aiSpeaking: boolean
  ): Promise<{
    interrupted: boolean;
    transcription: string;
    classification: string;
    responseText: string;
    action: string;
    audioBase64?: string;
  }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'interruption.wav');
    
    const response = await api.post(
      `/voice/barge-in/${interviewId}?aiSpeaking=${aiSpeaking}`,
      formData
    );
    return response.data;
  },

  getAllResumes: async (): Promise<any[]> => {
    const response = await api.get('/resume/all');
    return response.data;
  },

  getResumeAnalysis: async (resumeId: number): Promise<any> => {
    const response = await api.get(`/resume/${resumeId}/analysis`);
    return response.data;
  },

  matchJobDescription: async (resumeText: string, jobDescription: string): Promise<any> => {
    const response = await api.post('/jd/match', {
      resumeText,
      jobDescription
    });
    return response.data;
  },

  synthesizeNvidiaTts: async (text: string): Promise<Blob> => {
    const response = await api.post(
      '/voice/tts',
      { text },
      { responseType: 'blob' }
    );
    return response.data;
  }
};
