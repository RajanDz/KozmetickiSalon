import { createClient } from '@supabase/supabase-js'

// Service role key — ima puna admin prava, NIKADA ne izlagati frontendu
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)
