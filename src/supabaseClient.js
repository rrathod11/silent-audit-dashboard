import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise fallback to hardcoded values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qcsojanmvzaardznqvov.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjc29qYW5tdnphYXJkem5xdm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjc4NzcsImV4cCI6MjA2NzgwMzg3N30.YSYoWTxsARO_mbHmD_LfiyvjJ4KXj10dx_PGXt8Vq4k'

// Create Supabase client with auto-refresh token handling
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  return {
    message: error?.message || 'An unexpected error occurred',
    status: error?.status || 500
  }
}
