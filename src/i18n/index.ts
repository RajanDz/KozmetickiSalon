import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import me from './locales/me/common.json'
import en from './locales/en/common.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'me', label: 'Crnogorski', flag: '🇲🇪' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  // Dodavanje novog jezika: dodati JSON u locales/ i ovdje unos
] as const

export type LangCode = typeof SUPPORTED_LANGUAGES[number]['code']

const saved = localStorage.getItem('lang') as LangCode | null
const browser = navigator.language.slice(0, 2) as LangCode
const supported = SUPPORTED_LANGUAGES.map(l => l.code)
const defaultLang: LangCode = saved
  ?? (supported.includes(browser) ? browser : 'me')

i18n
  .use(initReactI18next)
  .init({
    resources: {
      me: { common: me },
      en: { common: en },
    },
    lng: defaultLang,
    fallbackLng: 'me',
    defaultNS: 'common',
    interpolation: {
      // React već escapeuje HTML — ne treba dvostruko
      escapeValue: false,
    },
  })

// Persistuj izbor jezika
i18n.on('languageChanged', (lang) => {
  localStorage.setItem('lang', lang)
  document.documentElement.lang = lang
})

export default i18n
