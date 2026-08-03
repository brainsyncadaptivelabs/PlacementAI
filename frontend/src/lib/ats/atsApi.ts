import api from "@/lib/api";

export interface AtsGeneralScanResponseDto {
  analysisId: number;
  resumeId: number;
  scanType: 'GENERAL' | 'JD_BASED';
  atsScore: number;
  inferredRole: string;
  inferredExperienceLevel: string;
  inferenceConfidence: number;
  inferenceReasoning: string;
  candidateOverrideLevel?: string;
  effectiveExperienceLevel: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
  growthAreas: string[];
  createdAt: string;
}

export interface AtsJdScanResponseDto extends AtsGeneralScanResponseDto {
  coreFitScore: number;
  fullJdMatchScore: number;
  jdInferredLevel: string;
  levelGapDetected: boolean;
  jdTextSnapshot?: string;
}

export interface AtsJdScanRequestDto {
  resumeId: number;
  jdText?: string;
  jdFileUrl?: string;
  targetRole?: string;
}

export interface AtsLevelOverrideRequestDto {
  analysisId: number;
  newLevel: string;
}

export const atsApi = {
  scanGeneral: async (resumeId: number): Promise<AtsGeneralScanResponseDto> => {
    const res = await api.post(`/ats/scan/general/${resumeId}`);
    return res.data;
  },

  scanAgainstJd: async (resumeId: number, data: Omit<AtsJdScanRequestDto, 'resumeId'>): Promise<AtsJdScanResponseDto> => {
    const res = await api.post(`/ats/scan/jd/${resumeId}`, { resumeId, ...data });
    return res.data;
  },

  overrideExperienceLevel: async (analysisId: number, newLevel: string): Promise<AtsGeneralScanResponseDto | AtsJdScanResponseDto> => {
    // Uses fetch directly for PATCH support if api wrapper is limited
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    const response = await fetch(`${BASE_URL}/ats/scan/${analysisId}/override-level`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ analysisId, newLevel }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try { errorData = errorText ? JSON.parse(errorText) : {}; } catch { errorData = errorText; }
      const err = new Error(`HTTP error! status: ${response.status}`);
      (err as any).response = { status: response.status, data: errorData };
      throw err;
    }

    return await response.json();
  },

  getScanHistory: async (resumeId: number): Promise<Array<AtsGeneralScanResponseDto | AtsJdScanResponseDto>> => {
    const res = await api.get(`/ats/scan/history/${resumeId}`);
    return res.data;
  },
};
