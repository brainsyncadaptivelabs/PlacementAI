import { create } from "zustand";
import {
  atsApi,
  AtsGeneralScanResponseDto,
  AtsJdScanResponseDto,
  AtsJdScanRequestDto,
} from "@/lib/ats/atsApi";

interface AtsAnalysisState {
  currentScan: AtsGeneralScanResponseDto | AtsJdScanResponseDto | null;
  scanHistory: Array<AtsGeneralScanResponseDto | AtsJdScanResponseDto>;
  isLoading: boolean;
  error: string | null;
  scanMode: "general" | "jd";

  setScanMode: (mode: "general" | "jd") => void;
  runGeneralScan: (resumeId: number) => Promise<void>;
  runJdScan: (resumeId: number, data: Omit<AtsJdScanRequestDto, "resumeId">) => Promise<void>;
  overrideLevel: (analysisId: number, newLevel: string) => Promise<void>;
  fetchHistory: (resumeId: number) => Promise<void>;
  selectHistoricalScan: (analysisId: number) => void;
  clearError: () => void;
}

export const useAtsAnalysisStore = create<AtsAnalysisState>((set, get) => ({
  currentScan: null,
  scanHistory: [],
  isLoading: false,
  error: null,
  scanMode: "general",

  setScanMode: (mode) => set({ scanMode: mode }),

  clearError: () => set({ error: null }),

  runGeneralScan: async (resumeId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await atsApi.scanGeneral(resumeId);
      set((state) => ({
        currentScan: data,
        scanHistory: [data, ...state.scanHistory.filter((s) => s.analysisId !== data.analysisId)],
        isLoading: false,
      }));
    } catch (err: any) {
      const status = err.response?.status;
      const errorMsg =
        status === 502
          ? "Scoring is temporarily unavailable, please try again shortly"
          : err.response?.data?.message || err.message || "Failed to complete general ATS scan.";
      set({ error: errorMsg, isLoading: false });
    }
  },

  runJdScan: async (resumeId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await atsApi.scanAgainstJd(resumeId, data);
      set((state) => ({
        currentScan: res,
        scanHistory: [res, ...state.scanHistory.filter((s) => s.analysisId !== res.analysisId)],
        isLoading: false,
      }));
    } catch (err: any) {
      const status = err.response?.status;
      const errorMsg =
        status === 502
          ? "Scoring is temporarily unavailable, please try again shortly"
          : err.response?.data?.message || err.message || "Failed to complete JD ATS scan.";
      set({ error: errorMsg, isLoading: false });
    }
  },

  overrideLevel: async (analysisId, newLevel) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await atsApi.overrideExperienceLevel(analysisId, newLevel);
      set((state) => ({
        currentScan: updated,
        scanHistory: state.scanHistory.map((s) => (s.analysisId === analysisId ? updated : s)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to update experience level.",
        isLoading: false,
      });
    }
  },

  fetchHistory: async (resumeId) => {
    set({ isLoading: true, error: null });
    try {
      const history = await atsApi.getScanHistory(resumeId);
      set({
        scanHistory: history,
        currentScan: history.length > 0 ? history[0] : null,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to load scan history.",
        isLoading: false,
      });
    }
  },

  selectHistoricalScan: (analysisId) => {
    const found = get().scanHistory.find((s) => s.analysisId === analysisId);
    if (found) {
      set({ currentScan: found });
    }
  },
}));
