import { createClient } from '@/lib/supabase/client';

export class SupabaseError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: any): never {
  console.error('[Supabase Error]:', error);
  
  if (error?.code) {
    switch (error.code) {
      case '23505':
        throw new SupabaseError('This record already exists.', 409);
      case '42501':
        throw new SupabaseError('Duplicate key violation.', 409);
      case '23503':
        throw new SupabaseError('Foreign key violation.', 400);
      default:
        throw new SupabaseError(error.message || 'A database error occurred.', 500);
    }
  }
  
  if (error?.message) {
    throw new SupabaseError(error.message, error.status || 500);
  }

  throw new SupabaseError('An unexpected error occurred.', 500);
}
