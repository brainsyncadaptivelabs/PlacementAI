import api from "@/lib/api";

export interface PlacementIntelligenceDto {
  version: string;
  generatedAt: string;
  overallPlacementReadiness: number;
  atsScore: number;
  jdMatch: number;
  codingScore: number;
  communicationScore: number;
  problemSolving: number;
  resumeQuality: number;
  learningProgress: number;
  activityScore: number;
  companyReadiness: Record<string, number>;
  salaryPrediction: string;
  hiringProbability: number;
  riskAnalysis: string[];
  aiSummary: string;
}

export class PlacementIntelligenceService {
  static async getCandidateIntelligence(candidateId: string): Promise<PlacementIntelligenceDto> {
    const response = await api.get(`/intelligence/candidates/${candidateId}`);
    return response.data;
  }

  static async getMyIntelligence(): Promise<PlacementIntelligenceDto> {
    const response = await api.get('/intelligence/me');
    return response.data;
  }
}
