import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, LangCode } from '../../i18n'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language as LangCode

  return (
    <div className="flex items-center gap-1">
      {SUPPORTED_LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.label}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            current === lang.code
              ? 'bg-rose-100 text-rose-700'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>{lang.flag}</span>
          <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
