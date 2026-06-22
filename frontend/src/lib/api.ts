// Legacy API stub
// The backend has been migrated to Supabase. This file serves as a stub 
// to prevent compilation errors in modules not yet migrated to the Supabase client.
// Please use the Supabase client (@/lib/supabase/client) for all new data fetching.

const api = {
  get: async (url: string, config?: any) => { console.warn(`Deprecated API GET call to ${url}`); return { data: [] as any }; },
  post: async (url: string, data?: any, config?: any) => { console.warn(`Deprecated API POST call to ${url}`); return { data: {} as any }; },
  put: async (url: string, data?: any, config?: any) => { console.warn(`Deprecated API PUT call to ${url}`); return { data: {} as any }; },
  delete: async (url: string, config?: any) => { console.warn(`Deprecated API DELETE call to ${url}`); return { data: {} as any }; },
};

export default api;
