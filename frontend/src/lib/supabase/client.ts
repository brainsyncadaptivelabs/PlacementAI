import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("[SUPABASE_CLIENT] Warning: Supabase URL or Anon Key is missing! Check environment variables.");
  }
  return createBrowserClient(
    url || 'https://placeholder-supabase.co',
    anonKey || 'placeholder-anon-key'
  );
}
