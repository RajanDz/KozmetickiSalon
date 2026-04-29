import { useState, FormEvent } from 'react'
import { useAuth, RegisterData } from '../../context/AuthContext'

interface FieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  phone?: string
  general?: string
}

// Ista pravila kao Zod schema na backendu
function validate(form: typeof EMPTY_FORM): FieldErrors {
  const e: FieldErrors = {}
  if (!form.firstName.trim()) e.firstName = 'Ime je obavezno.'
  if (!form.lastName.trim())  e.lastName  = 'Prezime je obavezno.'
  if (!form.email) {
    e.email = 'Email je obavezan.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    e.email = 'Unesite ispravan email.'
  }
  if (form.phone && !/^[0-9+\s()-]{7,15}$/.test(form.phone)) {
    e.phone = 'Unesite ispravan broj telefona.'
  }
  if (!form.password) {
    e.password = 'Lozinka je obavezna.'
  } else if (form.password.length < 6) {
    e.password = 'Lozinka mora imati najmanje 6 karaktera.'
  }
  if (form.password !== form.confirmPassword) {
    e.confirmPassword = 'Lozinke se ne podudaraju.'
  }
  return e
}

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' }

interface Props {
  onSuccess: () => void
  onLogin: () => void
}

export default function RegisterForm({ onSuccess, onLogin }: Props) {
  const { register } = useAuth()
  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]         = useState(false)

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    // Brišemo grešku za polje čim korisnik počne da kuca
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setSubmitting(true)

    const data: RegisterData = {
      email:     form.email,
      password:  form.password,
      firstName: form.firstName,
      lastName:  form.lastName,
      phone:     form.phone || undefined,
    }

    const { error: authError, needsConfirmation } = await register(data)
    setSubmitting(false)

    if (authError) {
      if (authError.field && authError.field !== 'general') {
        setErrors({ [authError.field]: authError.message })
      } else {
        setErrors({ general: authError.message })
      }
      return
    }

    if (needsConfirmation) {
      // Email potvrda je uključena — prikaži "provjeri email" ekran
      setDone(true)
    } else {
      // Sesija kreirana odmah — direktno na homepage
      onSuccess()
    }
  }

  // Supabase šalje confirmation email — prikaži poruku
  if (done) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Proverite email</h2>
        <p className="text-gray-500 text-sm mb-6">
          Poslali smo link za potvrdu na <strong>{form.email}</strong>.
          Kliknite na link da aktivirate nalog.
        </p>
        <button
          onClick={onLogin}
          className="text-rose-600 text-sm font-semibold hover:underline"
        >
          Nazad na prijavu
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 max-w-sm w-full">
      <div className="text-center mb-6">
        <p className="text-3xl mb-2">✨</p>
        <h2 className="text-2xl font-bold text-gray-900">Kreirajte nalog</h2>
        <p className="text-gray-500 text-sm mt-1">Registracija je besplatna</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ime"     value={form.firstName} onChange={v => update('firstName', v)} error={errors.firstName} placeholder="Marko" />
          <Field label="Prezime" value={form.lastName}  onChange={v => update('lastName',  v)} error={errors.lastName}  placeholder="Nikolić" />
        </div>
        <Field label="Email"  type="email" value={form.email} onChange={v => update('email', v)} error={errors.email} placeholder="marko@email.com" autoComplete="email" />
        <Field label="Telefon (opciono)" type="tel" value={form.phone} onChange={v => update('phone', v)} error={errors.phone} placeholder="065 123 4567" />
        <Field label="Lozinka" type="password" value={form.password} onChange={v => update('password', v)} error={errors.password} placeholder="Min. 6 karaktera" autoComplete="new-password" />
        <Field label="Potvrdi lozinku" type="password" value={form.confirmPassword} onChange={v => update('confirmPassword', v)} error={errors.confirmPassword} placeholder="Ponovite lozinku" autoComplete="new-password" />

        {/* Password strength indicator */}
        {form.password.length > 0 && (
          <PasswordStrength password={form.password} />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 disabled:bg-rose-300 transition-colors mt-2"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Kreiranje naloga...
            </span>
          ) : 'Registruj se'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Već imate nalog?{' '}
        <button onClick={onLogin} className="text-rose-600 font-semibold hover:underline">
          Prijavite se
        </button>
      </p>
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const hasLower  = /[a-z]/.test(password)
  const hasUpper  = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isLong    = password.length >= 8

  const score = [hasLower, hasUpper, hasNumber, isLong].filter(Boolean).length
  const labels = ['', 'Slaba', 'Srednja', 'Dobra', 'Jaka']
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400']

  return (
    <div>
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-xs mt-1 ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-500' : 'text-green-600'}`}>
          {labels[score]} lozinka
        </p>
      )}
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, error, placeholder, autoComplete }: {
  label: string; type?: string; value: string
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
          error ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-rose-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
