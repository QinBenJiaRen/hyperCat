'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import i18nInstance from './I18nextProvider'

interface LayoutProps {
  children: ReactNode
}

interface UserProfileModalProps {
  email: string
  isOpen: boolean
  onClose: () => void
}

function UserProfileModal({ email, isOpen, onClose }: UserProfileModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            User Profile
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-600 break-all">{email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MainLayout({ children }: LayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Load email from localStorage
    const savedEmail = localStorage.getItem('userEmail')
    if (savedEmail) {
      setUserEmail(savedEmail)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Main Navigation Section */}
        <div className="flex-1 p-4">
          <div className="flex items-center mb-6">
            <span className="text-orange-500 text-2xl font-bold">HypeCat</span>
            <span className="text-gray-700 text-2xl font-bold">AI</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col space-y-3">
            <button
              onClick={async () => {
                const emailCheck = document.createElement('div');
                emailCheck.dataset.checkEmail = 'true';
                document.body.appendChild(emailCheck);
                
                const event = new CustomEvent('checkEmail', {
                  detail: {
                    onComplete: () => {
                      router.push('/content-creation');
                    }
                  }
                });
                document.dispatchEvent(event);
              }}
              className={`flex items-center w-full px-6 py-3 text-sm rounded-lg whitespace-nowrap text-left ${
                pathname === '/content-creation'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="truncate">{t('nav.contentCreation')}</span>
            </button>

            <button
              onClick={async () => {
                const emailCheck = document.createElement('div');
                emailCheck.dataset.checkEmail = 'true';
                document.body.appendChild(emailCheck);
                
                const event = new CustomEvent('checkEmail', {
                  detail: {
                    onComplete: () => {
                      router.push('/content-calender');
                    }
                  }
                });
                document.dispatchEvent(event);
              }}
              className={`flex items-center w-full px-6 py-3 text-sm rounded-lg whitespace-nowrap text-left ${
                pathname === '/content-calender'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{t('nav.contentCalender')}</span>
            </button>

            <button
              onClick={async () => {
                const emailCheck = document.createElement('div');
                emailCheck.dataset.checkEmail = 'true';
                document.body.appendChild(emailCheck);
                
                const event = new CustomEvent('checkEmail', {
                  detail: {
                    onComplete: () => {
                      router.push('/publishing');
                    }
                  }
                });
                document.dispatchEvent(event);
              }}
              className={`flex items-center w-full px-6 py-3 text-base text-left ${
                pathname === '/publishing'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {t('nav.publishing')}
            </button>

            <button
              onClick={async () => {
                const emailCheck = document.createElement('div');
                emailCheck.dataset.checkEmail = 'true';
                document.body.appendChild(emailCheck);
                
                const event = new CustomEvent('checkEmail', {
                  detail: {
                    onComplete: () => {
                      router.push('/analytics');
                    }
                  }
                });
                document.dispatchEvent(event);
              }}
              className={`flex items-center w-full px-6 py-3 text-base text-left ${
                pathname === '/analytics'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t('nav.analytics')}
            </button>

            <button
              onClick={async () => {
                const emailCheck = document.createElement('div');
                emailCheck.dataset.checkEmail = 'true';
                document.body.appendChild(emailCheck);
                
                const event = new CustomEvent('checkEmail', {
                  detail: {
                    onComplete: () => {
                      router.push('/settings');
                    }
                  }
                });
                document.dispatchEvent(event);
              }}
              className={`flex items-center w-full px-6 py-3 text-base text-left ${
                pathname === '/settings'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('nav.settings')}
            </button>
          </nav>
        </div>

        {/* Language Indicator - Fixed at Bottom */}
        <div className="border-t border-gray-100">
          <div className="p-4 text-sm text-gray-600 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>
              {i18nInstance.language === 'zh' ? '中文' : 
               i18nInstance.language === 'de' ? 'Deutsch' : 
               'English'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-end items-center">
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        email={userEmail}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  )
}