import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Configuration Error: NEXT_PUBLIC_SUPABASE_URL is missing.");
  }
  if (!anonKey) {
    throw new Error("Configuration Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Supabase URL (Server):", url);
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        fetch: async (input, init) => {
          const reqUrl = typeof input === 'string' ? input : (input instanceof Request ? input.url : String(input));
          if (url.includes("glyvbdltoxjpwlzsbcyx") || reqUrl.includes("glyvbdltoxjpwlzsbcyx")) {
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
    }
  );
}
