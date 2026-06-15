export interface MockInterview {
  id?: number;
  role: string;
  experienceLevel: string;
  company?: string;
  topic?: string;
  transcript?: string;
  questions?: InterviewQuestion[];
  feedback?: InterviewFeedback;
  createdAt?: string;
}

export interface InterviewQuestion {
  questionText: string;
  answerText?: string;
  score?: number;
}

export interface InterviewFeedback {
  totalScore: number;
  finalAssessment: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface MockInterviewRequest {
  role: string;
  experienceLevel: string;
}

export interface MockInterviewResponse {
  role: string;
  questions: string[];
  tips: string[];
}
