import { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { AppRole } from '../../lib/supabase'

interface Props {
  children: ReactNode
  requiredRole?: AppRole | AppRole[]
  fallback?: ReactNode        // šta prikazati umesto sadržaja
  redirectTo?: () => void     // callback za navigaciju (bez react-router)
}

export default function ProtectedRoute({ children, requiredRole, fallback, redirectTo }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Nije ulogovan
  if (!user) {
    if (redirectTo) { redirectTo(); return null }
    return fallback ? <>{fallback}</> : <AccessDenied reason="login" />
  }

  // Nema potrebnu rolu
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowed.includes(user.role as AppRole)) {
      return fallback ? <>{fallback}</> : <AccessDenied reason="role" />
    }
  }

  return <>{children}</>
}

function AccessDenied({ reason }: { reason: 'login' | 'role' }) {
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm p-10 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">{reason === 'login' ? '🔐' : '🚫'}</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {reason === 'login' ? 'Prijava obavezna' : 'Pristup odbijen'}
        </h2>
        <p className="text-gray-500 text-sm">
          {reason === 'login'
            ? 'Morate biti prijavljeni da biste pristupili ovoj stranici.'
            : 'Nemate dozvolu za pristup ovoj stranici.'}
        </p>
      </div>
    </div>
  )
}
