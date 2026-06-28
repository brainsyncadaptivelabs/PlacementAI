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

  if (process.env.NODE_ENV === "development") {
    console.log("Supabase URL (Client):", url);
  }

  return createBrowserClient(url, anonKey);
}
