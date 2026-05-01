import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LanguageSwitcher from './components/ui/LanguageSwitcher';
import PromoBanner from './components/ui/PromoBanner';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const [page, setPage] = useState('home');
  const [bookingServiceId, setBookingServiceId] = useState(null);
  const { user, logout, loading } = useAuth();
  const { t } = useTranslation();

  function navigate(to) { setPage(to); window.scrollTo(0, 0); }

  function handleBook(serviceId) {
    setBookingServiceId(serviceId);
    navigate('booking');
  }

  async function handleLogout() { await logout(); navigate('home'); }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Učitavanje...</p>
        </div>
      </div>
    );
  }

  // Admin ima vlastiti full-screen layout sa sidebarom
  if (page === 'admin') {
    return (
      <ProtectedRoute requiredRole="ADMIN" redirectTo={() => navigate('home')}>
        <AdminPage onBack={() => navigate('home')} />
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PromoBanner
        text="Ljetna akcija: -20% na sve tretmane lica tokom avgusta 2025."
        cta="Zakaži"
        onCta={() => navigate('booking')}
      />
      {/* Navbar — samo za public stranice */}
      <nav className="h-14 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center">
        <div className="max-w-5xl mx-auto px-4 w-full flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-gray-900 hover:text-rose-600 transition-colors"
          >
            <div className="w-6 h-6 bg-rose-600 rounded-md flex items-center justify-center text-white text-xs font-bold">B</div>
            <span className="text-sm font-semibold">Bella Salon</span>
          </button>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {[
              { key: 'home',    label: t('nav.services') },
              { key: 'booking', label: t('nav.book') },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  page === item.key
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('admin')}
                    className="btn-secondary text-xs py-1.5"
                  >
                    {t('nav.admin')}
                  </button>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors hidden sm:block"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('auth')}
                className="btn-primary text-xs py-1.5"
              >
                {t('nav.login')}
              </button>
            )}
          </div>
        </div>
      </nav>

      {page === 'home'    && <HomePage onBook={handleBook} />}
      {page === 'auth'    && <AuthPage onSuccess={() => navigate('home')} />}
      {page === 'booking' && (
        <BookingPage preselectedServiceId={bookingServiceId} onAuth={() => navigate('auth')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
