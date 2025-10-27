'use client'

import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { useEffect } from 'react'

// 导入翻译资源
import en from '../public/locales/en/common.json'
import zh from '../public/locales/zh/common.json'
import de from '../public/locales/de/common.json'
import es from '../public/locales/es/common.json'
import fr from '../public/locales/fr/common.json'
import ja from '../public/locales/ja/common.json'

const resources = {
  en: { common: en },
  zh: { common: zh },
  de: { common: de },
  es: { common: es },
  fr: { common: fr },
  ja: { common: ja }
}

const i18nInstance = i18next.createInstance()

i18nInstance
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh', 'de', 'es', 'fr', 'ja'],
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Force a re-render when the language changes
    const handleLanguageChanged = () => {
      // This will trigger a re-render
    }

    i18nInstance.on('languageChanged', handleLanguageChanged)

    return () => {
      i18nInstance.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  return children
}

export default i18nInstance