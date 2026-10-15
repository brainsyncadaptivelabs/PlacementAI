import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) {
    throw new Error("Configuration Error: NEXT_PUBLIC_SUPABASE_URL is missing.");
  }
  if (!anonKey) {
    throw new Error("Configuration Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  }

  const isDeadProject = url.includes("glyvbdltoxjpwlzsbcyx");

  return createBrowserClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async (input, init) => {
        const reqUrl = typeof input === 'string' ? input : (input instanceof Request ? input.url : String(input));
        
        // If the Supabase project is known to be offline (NXDOMAIN), short-circuit immediately
        // without calling native fetch to avoid ERR_NAME_NOT_RESOLVED in browser console
        if (isDeadProject || reqUrl.includes("glyvbdltoxjpwlzsbcyx")) {
          return new Response(
            JSON.stringify({
              error: "invalid_grant",
              error_description: "Supabase project is offline",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        try {
          return await fetch(input, init);
        } catch {
          return new Response(
            JSON.stringify({
              error: "invalid_grant",
              error_description: "Supabase service unavailable",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  });
}
