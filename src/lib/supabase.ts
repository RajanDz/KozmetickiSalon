import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.REACT_APP_SUPABASE_URL
const supabaseAnon = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Nedostaju Supabase env varijable.\n' +
    'Provjeri da postoji .env.local sa REACT_APP_SUPABASE_URL i REACT_APP_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type AppRole = 'ADMIN' | 'EMPLOYEE' | 'CLIENT'

export interface AppUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: AppRole
}
