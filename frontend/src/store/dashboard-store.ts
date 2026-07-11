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
        const [statsRes, intelRes, mentorRes, timelineRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/placement-intelligence/dashboard"),
          api.get("/placement-intelligence/mentor"),
          api.get("/placement-intelligence/timeline"),
        ]);

        set({
          stats: statsRes.data,
          placementIntel: intelRes.data,
          mentorData: mentorRes.data,
          timelineData: timelineRes.data,
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
