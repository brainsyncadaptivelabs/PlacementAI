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
  technicalScore?: number;
  communicationScore?: number;
  confidenceScore?: number;
  finalAssessment: string;
  strengths: string[];
  areasForImprovement: string[];
  bodyLanguageTips?: string[];
  missedTopics?: string[];
  recommendedResources?: string[];
  improvementPlan?: string[];
  companyReadiness?: number;
  hiringProbability?: number;
  expectedSalary?: string;
  recruiterVerdict?: string;
  finalRecommendation?: string;
}

export interface MockInterviewRequest {
  role: string;
  experienceLevel: string;
  company?: string;
  difficulty?: string;
  interviewType?: string;
  jobDescription?: string;
  resumeText?: string;
}

export interface MockInterviewResponse {
  role: string;
  questions: string[];
  tips: string[];
}
