import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'

export type AdminSection = 'overview' | 'appointments' | 'employees' | 'services'

interface NavItem {
  id: AdminSection
  icon: string
  labelKey: string
  badge?: number
}

const NAV: NavItem[] = [
  { id: 'overview',     icon: '▦',  labelKey: 'admin.tab_overview' },
  { id: 'appointments', icon: '◷',  labelKey: 'admin.tab_appointments', badge: 3 },
  { id: 'employees',    icon: '◈',  labelKey: 'admin.tab_employees' },
  { id: 'services',     icon: '◆',  labelKey: 'admin.tab_services' },
]

interface Props {
  section: AdminSection
  onSection: (s: AdminSection) => void
  onBack: () => void
  children: React.ReactNode
}

export default function AdminLayout({ section, onSection, onBack, children }: Props) {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-30
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:shrink-0
      `}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-100">
          <div className="w-7 h-7 bg-rose-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">B</div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">Bella Salon</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Admin panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="t-label px-3 mb-2">Meni</p>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => { onSection(item.id); setSidebarOpen(false) }}
              className={`sidebar-item w-full ${section === item.id ? 'active' : ''}`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1 text-left">{t(item.labelKey)}</span>
              {item.badge !== undefined && (
                <span className="text-[10px] font-semibold bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3 space-y-2">
          <button
            onClick={onBack}
            className="sidebar-item w-full text-gray-400"
          >
            <span className="text-base w-5 text-center">←</span>
            <span>Nazad na sajt</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center shrink-0">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">Admin</p>
              <p className="text-[10px] text-gray-400">admin@salon.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-ghost p-1.5"
              aria-label="Otvori meni"
            >
              ☰
            </button>
            <h1 className="text-sm font-semibold text-gray-800">
              {t(NAV.find(n => n.id === section)?.labelKey ?? 'admin.title')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center">A</div>
          </div>
        </header>

        {/* Content scroll area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
