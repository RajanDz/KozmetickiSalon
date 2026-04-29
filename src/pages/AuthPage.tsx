import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'

interface Props {
  onSuccess: () => void
  defaultTab?: 'login' | 'register'
}

export default function AuthPage({ onSuccess, defaultTab = 'login' }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="flex bg-white rounded-2xl p-1 border border-gray-200 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'login' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Prijava
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'register' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Registracija
          </button>
        </div>

        {tab === 'login'
          ? <LoginForm    onSuccess={onSuccess} onRegister={() => setTab('register')} />
          : <RegisterForm onSuccess={onSuccess} onLogin={() => setTab('login')} />
        }
      </div>
    </div>
  )
}
