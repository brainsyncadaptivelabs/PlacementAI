export interface MockInterview {
  id?: number;
  role: string;
  experienceLevel: string;
  company?: string;
  topic?: string;
  conversationalStyle?: string;
  transcript?: string;
  questions?: InterviewQuestion[];
  feedback?: InterviewFeedback;
  createdAt?: string;
  status?: string;
}

export interface InterviewQuestion {
  questionText: string;
  answerText?: string;
  score?: number;
  codeText?: string;
  language?: string;
  compilerOutput?: string;
  aiFeedback?: string;
}

export interface InterviewFeedback {
  totalScore: number;
  technicalScore?: number;
  communicationScore?: number;
  confidenceScore?: number;
  problemSolvingScore?: number;
  codingScore?: number;
  behavioralScore?: number;
  roleReadiness?: number;
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
  competencies?: Competency[];
  candidateSummary?: string;
  technicalAbilityComment?: string;
  communicationComment?: string;
  leadershipComment?: string;
  problemSolvingComment?: string;
  cultureFitComment?: string;
  teamFitComment?: string;
  riskAssessment?: string;
  recruiterNotes?: string;
  interviewConfidence?: number;
  benchmark?: Benchmark;
}

export interface Benchmark {
  percentileCategory: string;
  percentile: number;
  roleAverage: number;
  collegeAverage: number;
  companyAverage: number;
  globalAverage: number;
  totalCompared: number;
}

export interface Competency {
  category: string;
  competency: string;
  status: boolean;
}

export interface MockInterviewRequest {
  role: string;
  experienceLevel: string;
  company?: string;
  difficulty?: string;
  interviewType?: string;
  jobDescription?: string;
  resumeText?: string;
  topic?: string;
  conversationalStyle?: string;
}

export interface MockInterviewResponse {
  role: string;
  questions: string[];
  tips: string[];
}
