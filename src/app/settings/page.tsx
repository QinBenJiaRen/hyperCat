'use client'

import { useTranslation } from 'react-i18next'
import MainLayout from '../../components/MainLayout'
import i18nInstance from '../../components/I18nextProvider'

export default function SettingsPage() {
  const { t } = useTranslation()

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value
    await i18nInstance.changeLanguage(newLang)
    // 可选：保存到 localStorage
    localStorage.setItem('preferredLanguage', newLang)
  }

  return (
    <MainLayout>
      <div className="p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('nav.settings')}
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              {/* Language Settings */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Language / 语言 / Sprache / Español / Français / 日本語
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select your preferred language
                  </label>
                  <select
                    id="language-select"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={i18nInstance.language}
                    onChange={handleLanguageChange}
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="ja">🇯🇵 日本語</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Changes will be applied immediately
                  </p>
                </div>
              </div>

              {/* Other settings can be added here */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('settings.notifications')}
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="email-notifications" className="block text-sm font-medium text-gray-700">
                        {t('settings.emailNotifications')}
                      </label>
                      <p className="text-sm text-gray-500">
                        {t('settings.emailNotificationsDesc')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="email-notifications"
                        className="form-checkbox h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('settings.privacy')}
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="data-collection" className="block text-sm font-medium text-gray-700">
                        {t('settings.dataCollection')}
                      </label>
                      <p className="text-sm text-gray-500">
                        {t('settings.dataCollectionDesc')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="data-collection"
                        className="form-checkbox h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}