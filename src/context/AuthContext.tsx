import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase, AppUser, AppRole } from '../lib/supabase'

interface AuthState {
  user: AppUser | null
  session: Session | null
  loading: boolean
}

export interface RegisterResult {
  error: AuthError | null
  needsConfirmation: boolean
}

interface AuthActions {
  login:    (email: string, password: string) => Promise<AuthError | null>
  register: (data: RegisterData) => Promise<RegisterResult>
  logout:   () => Promise<void>
  hasRole:  (role: AppRole | AppRole[]) => boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthError {
  message: string
  field?: 'email' | 'password' | 'general'
}

const AuthContext = createContext<(AuthState & AuthActions) | null>(null)

// Kolone u public.users koriste camelCase (firstName, lastName) prema SQL shemi
async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, "firstName", "lastName", phone, role')
    .eq('id', userId)
    .single()

  if (error) {
    console.warn('fetchProfile greška:', error.message, '| userId:', userId)
    return null
  }
  if (!data) return null

  return {
    id:        data.id,
    email:     data.email,
    firstName: data.firstName  ?? '',
    lastName:  data.lastName   ?? '',
    phone:     data.phone      ?? undefined,
    role:      ((data.role as string) ?? 'CLIENT') as AppRole,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Ako profil ne može biti pročitan (RLS ili nepostojanje), koristi podatke iz sesije
  function sessionFallback(authUser: { id: string; email?: string; user_metadata?: Record<string, string> }): AppUser {
    const meta = authUser.user_metadata ?? {}
    return {
      id:        authUser.id,
      email:     authUser.email ?? '',
      firstName: meta['first_name'] ?? authUser.email?.split('@')[0] ?? '',
      lastName:  meta['last_name']  ?? '',
      role:      'CLIENT' as AppRole,
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile ?? sessionFallback(session.user))
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setUser(profile ?? sessionFallback(session.user))
        } else {
          setUser(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, password: string): Promise<AuthError | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return null
    if (error.message.includes('Invalid login credentials'))
      return { message: 'Pogrešan email ili lozinka.', field: 'password' }
    if (error.message.includes('Email not confirmed'))
      return { message: 'Potvrdite email adresu prije prijave.', field: 'email' }
    return { message: 'Greška pri prijavi. Pokušajte ponovo.', field: 'general' }
  }

  async function register(data: RegisterData): Promise<RegisterResult> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options: { data: { first_name: data.firstName, last_name: data.lastName } },
    })

    if (authError) {
      if (authError.message.includes('already registered'))
        return { error: { message: 'Nalog sa ovim emailom već postoji.', field: 'email' }, needsConfirmation: false }
      if (authError.message.includes('Password should be at least'))
        return { error: { message: 'Lozinka mora imati najmanje 6 karaktera.', field: 'password' }, needsConfirmation: false }
      return { error: { message: 'Registracija nije uspjela. Pokušajte ponovo.', field: 'general' }, needsConfirmation: false }
    }

    if (!authData.user)
      return { error: { message: 'Greška pri kreiranju naloga.', field: 'general' }, needsConfirmation: false }

    // Trigger automatski kreira profil u public.users.
    // Ako sesija postoji odmah (email potvrda isključena), ažuriramo ime/telefon.
    if (authData.session) {
      await supabase.from('users').update({
        firstName: data.firstName,
        lastName:  data.lastName,
        phone:     data.phone ?? null,
      }).eq('id', authData.user.id)
    }

    // needsConfirmation = session je null → Supabase čeka email potvrdu
    return { error: null, needsConfirmation: !authData.session }
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  function hasRole(role: AppRole | AppRole[]): boolean {
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth mora biti unutar <AuthProvider>')
  return ctx
}
