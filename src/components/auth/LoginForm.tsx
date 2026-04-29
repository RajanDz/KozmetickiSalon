import { useState, FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'

// Validacija — ista pravila kao na backendu (Zod schema)
function validateLogin(email: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!email) {
    errors.email = 'Email je obavezan.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Unesite ispravan email.'
  }
  if (!password) errors.password = 'Lozinka je obavezna.'
  return errors
}

interface Props {
  onSuccess: () => void
  onRegister: () => void
}

export default function LoginForm({ onSuccess, onRegister }: Props) {
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validateLogin(email, password)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setSubmitting(true)
    const authError = await login(email, password)
    setSubmitting(false)

    if (authError) {
      if (authError.field && authError.field !== 'general') {
        setErrors({ [authError.field]: authError.message })
      } else {
        setErrors({ general: authError.message })
      }
      return
    }
    onSuccess()
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 max-w-sm w-full">
      <div className="text-center mb-8">
        <p className="text-3xl mb-2">💄</p>
        <h2 className="text-2xl font-bold text-gray-900">Dobrodošli</h2>
        <p className="text-gray-500 text-sm mt-1">Prijavite se na vaš nalog</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {errors.general}
          </div>
        )}

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          placeholder="marko@email.com"
          autoComplete="email"
        />

        <Field
          label="Lozinka"
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 disabled:bg-rose-300 transition-colors mt-2"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Prijavljivanje...
            </span>
          ) : 'Prijavi se'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Nemate nalog?{' '}
        <button onClick={onRegister} className="text-rose-600 font-semibold hover:underline">
          Registrujte se
        </button>
      </p>
    </div>
  )
}

function Field({ label, type, value, onChange, error, placeholder, autoComplete }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; error?: string
  placeholder?: string; autoComplete?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-400 focus:ring-red-200 bg-red-50'
            : 'border-gray-200 focus:ring-rose-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
