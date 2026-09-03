import { create } from 'zustand';
import api from '@/lib/api';

export interface DashboardState {
  stats: any | null;
  placementIntel: any | null;
  mentorData: any | null;
  timelineData: any | null;
  loading: boolean;
  error: string | null;
  fetchPromise: Promise<void> | null;
  lastFetched: number | null;
  fetchDashboard: (force?: boolean) => Promise<void>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  placementIntel: null,
  mentorData: null,
  timelineData: null,
  loading: false,
  error: null,
  fetchPromise: null,
  lastFetched: null,
  fetchDashboard: async (force = false) => {
    const { stats, fetchPromise, lastFetched } = get();
    
    if (fetchPromise) {
      return fetchPromise;
    }

    const now = Date.now();
    if (!force && stats && lastFetched && (now - lastFetched < CACHE_TTL_MS)) {
      return;
    }

    set({ loading: true, error: null });

    const promise = (async () => {
      try {
        const [statsResult, intelResult, mentorResult, timelineResult] = await Promise.allSettled([
          api.get("/dashboard/stats"),
          api.get("/placement-intelligence/dashboard"),
          api.get("/placement-intelligence/mentor"),
          api.get("/placement-intelligence/timeline"),
        ]);

        const statsData = statsResult.status === "fulfilled" ? statsResult.value.data : null;
        const intelData = intelResult.status === "fulfilled" ? intelResult.value.data : null;
        const mentorData = mentorResult.status === "fulfilled" ? mentorResult.value.data : null;
        const timelineData = timelineResult.status === "fulfilled" ? timelineResult.value.data : [];

        // If both core endpoints failed completely, surface an error
        if (!statsData && !intelData) {
          throw new Error("Core dashboard endpoints failed");
        }

        set({
          stats: statsData,
          placementIntel: intelData,
          mentorData: mentorData,
          timelineData: timelineData,
          lastFetched: Date.now(),
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("Dashboard fetch failed:", err);
        set({
          error: "Unable to load dashboard data. Please try again later.",
          loading: false,
        });
        throw err;
      } finally {
        set({ fetchPromise: null });
      }
    })();

    set({ fetchPromise: promise });
    return promise;
  },
}));
