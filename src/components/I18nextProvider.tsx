'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入翻译资源
import en from '../../public/locales/en/common.json'
import zh from '../../public/locales/zh/common.json'
import de from '../../public/locales/de/common.json'

const resources = {
  en: { common: en },
  zh: { common: zh },
  de: { common: de }
}

const i18nInstance = i18next.createInstance()

i18nInstance
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh', 'de'],
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

export function I18nextProviderClient({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  )
}

export default i18nInstance