import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qcsojanmvzaardznqvov.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjc29qYW5tdnphYXJkem5xdm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjc4NzcsImV4cCI6MjA2NzgwMzg3N30.YSYoWTxsARO_mbHmD_LfiyvjJ4KXj10dx_PGXt8Vq4k'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
