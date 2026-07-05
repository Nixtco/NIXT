'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { translations } from './translations'

type Language = 'ar' | 'en'
type TranslationsType = typeof translations.ar

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationsType
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'ar'

    const saved = localStorage.getItem('nixt-lang') as Language | null
    return saved === 'ar' || saved === 'en' ? saved : 'ar'
  })

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('nixt-lang', language)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    dir: language === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
