'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import i18nInstance from './I18nextProvider'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
}

function FeedbackModal({ isOpen, onClose, isDarkMode }: FeedbackModalProps) {
  const { t } = useTranslation()
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'other'>('suggestion')
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return
    
    setIsSubmitting(true)
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里可以添加实际的提交逻辑，例如发送到后端API
    console.log('Feedback submitted:', { type: feedbackType, text: feedbackText })
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // 2秒后关闭弹窗
    setTimeout(() => {
      setIsSubmitted(false)
      setFeedbackText('')
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-[500px] max-w-[90vw] relative transition-colors`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`absolute top-4 right-4 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
              {t('feedback.thankYou', 'Thank You!')}
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('feedback.submitted', 'Your feedback has been submitted successfully.')}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                {t('feedback.title', 'Feedback')}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('feedback.subtitle', 'We value your feedback! Please share your thoughts with us.')}
              </p>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {t('feedback.typeLabel', 'Feedback Type')}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFeedbackType('bug')}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                    feedbackType === 'bug'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t('feedback.bug', 'Bug Report')}
                </button>
                <button
                  onClick={() => setFeedbackType('suggestion')}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                    feedbackType === 'suggestion'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t('feedback.suggestion', 'Suggestion')}
                </button>
                <button
                  onClick={() => setFeedbackType('other')}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                    feedbackType === 'other'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t('feedback.other', 'Other')}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {t('feedback.messageLabel', 'Your Message')}
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t('feedback.placeholder', 'Please describe your feedback in detail...')}
                className={`w-full h-32 px-4 py-3 rounded-lg border resize-none transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 py-2.5 px-4 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('feedback.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!feedbackText.trim() || isSubmitting}
                className={`flex-1 py-2.5 px-4 rounded-lg transition-colors ${
                  !feedbackText.trim() || isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isSubmitting ? t('feedback.submitting', 'Submitting...') : t('feedback.submit', 'Submit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface UserProfileModalProps {
  email: string
  fullName?: string
  isOpen: boolean
  onClose: () => void
  onSignOut: () => void
  isDarkMode: boolean
}

function UserProfileModal({ email, fullName, isOpen, onClose, onSignOut, isDarkMode }: UserProfileModalProps) {
  const { t } = useTranslation()
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-[400px] relative transition-colors`}>
        <button
          className={`absolute top-4 right-4 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        
        <div className="text-center">
          <div className={`w-16 h-16 ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            {fullName || 'User Profile'}
          </h3>
          
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Email</p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} break-all`}>{email}</p>
          </div>
          
          <button
            onClick={() => {
              onSignOut()
              onClose()
            }}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {t('auth.signOut', 'Sign Out')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MainLayout({ children }: LayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true'
    }
    return false
  })
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('sidebarWidth') || '240')
    }
    return 240
  })
  const [isResizing, setIsResizing] = useState(false)

  // 保存侧边栏状态到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed))
    }
  }, [isSidebarCollapsed])

  // 保存侧边栏宽度到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarWidth', String(sidebarWidth))
    }
  }, [sidebarWidth])

  // 保存主题状态到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(isDarkMode))
      // 可以在这里添加实际的主题切换逻辑
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  // 拖拽处理函数
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSidebarCollapsed) return
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    const newWidth = Math.max(200, Math.min(400, e.clientX))
    setSidebarWidth(newWidth)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Sidebar */}
      <div 
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden relative`}
        style={{ 
          width: isSidebarCollapsed ? '80px' : `${sidebarWidth}px`,
          minWidth: isSidebarCollapsed ? '80px' : '200px',
          maxWidth: isSidebarCollapsed ? '80px' : '400px'
        }}
      >
        {/* Main Navigation Section */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 relative">
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full pr-6' : ''}`}>
              <button
                onClick={() => router.push('/content-creation')}
                className={`flex items-center ${isSidebarCollapsed ? 'scale-90' : ''} transition-transform duration-300 hover:opacity-80`}
              >
                <div className={`${isSidebarCollapsed ? 'w-14 h-14 mr-0' : 'w-16 h-16 mr-1.5'} rounded-full overflow-hidden transition-all duration-300 flex-shrink-0`}>
                  <img 
                    src="/images/logo.jpg"
                    alt="HypeCat Logo"
                    className="w-full h-full object-cover object-top"
                    style={{ objectPosition: 'center 30%' }}
                  />
                </div>
                <div className={`flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
                  <span className="text-orange-500 text-2xl font-bold leading-none">
                    HypeCat
                  </span>
                  <span className="text-gray-700 text-2xl font-bold leading-none">
                    AI
                  </span>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all flex-shrink-0
                ${isSidebarCollapsed ? 'absolute -right-3 bg-white shadow-md border border-gray-200' : ''}`}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
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
              className={`group relative flex items-center w-full py-3 text-sm rounded-lg whitespace-nowrap text-left transition-all
                ${pathname === '/content-creation'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
                } ${isSidebarCollapsed ? 'justify-center px-3' : 'px-6'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {!isSidebarCollapsed && <span className="ml-3">{t('nav.contentCreation')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {t('nav.contentCreation')}
                </div>
              )}
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
              className={`group relative flex items-center w-full py-3 text-sm rounded-lg whitespace-nowrap text-left transition-all
                ${pathname === '/content-calender'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
                } ${isSidebarCollapsed ? 'justify-center px-3' : 'px-6'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!isSidebarCollapsed && <span className="ml-3">{t('nav.contentCalender')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {t('nav.contentCalender')}
                </div>
              )}
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
              className={`group relative flex items-center w-full py-3 text-sm rounded-lg whitespace-nowrap text-left transition-all
                ${pathname === '/publishing'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
                } ${isSidebarCollapsed ? 'justify-center px-3' : 'px-6'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {!isSidebarCollapsed && <span className="ml-3">{t('nav.publishing')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {t('nav.publishing')}
                </div>
              )}
            </button>

            {/* Analytics - Hidden */}
            {/* <button
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
              className={`group relative flex items-center w-full py-3 text-sm rounded-lg whitespace-nowrap text-left transition-all
                ${pathname === '/analytics'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
                } ${isSidebarCollapsed ? 'justify-center px-3' : 'px-6'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!isSidebarCollapsed && <span className="ml-3">{t('nav.analytics')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {t('nav.analytics')}
                </div>
              )}
            </button> */}

            <button
              onClick={async () => {
                const emailCheck = document.createElement('div');
                emailCheck.dataset.checkEmail = 'true';
                document.body.appendChild(emailCheck);
                
                const event = new CustomEvent('checkEmail', {
                  detail: {
                    onComplete: () => {
                      router.push('/membership');
                    }
                  }
                });
                document.dispatchEvent(event);
              }}
              className={`group relative flex items-center w-full py-3 text-sm rounded-lg whitespace-nowrap text-left transition-all
                ${pathname === '/membership'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
                } ${isSidebarCollapsed ? 'justify-center px-3' : 'px-6'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {!isSidebarCollapsed && <span className="ml-3">{t('nav.membership')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {t('nav.membership')}
                </div>
              )}
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
              className={`group relative flex items-center w-full py-3 text-sm rounded-lg whitespace-nowrap text-left transition-all
                ${pathname === '/settings'
                  ? 'text-orange-500 bg-orange-50 font-medium'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
                } ${isSidebarCollapsed ? 'justify-center px-3' : 'px-6'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!isSidebarCollapsed && <span className="ml-3">{t('nav.settings')}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {t('nav.settings')}
                </div>
              )}
            </button>
          </nav>
        </div>

        {/* User Profile - Fixed at Bottom */}
        <div className={`${isDarkMode ? 'border-gray-700' : 'border-gray-100'} border-t py-4 px-6 transition-colors min-h-[4.5rem]`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} transition-all h-full`}>
            <button
              onClick={() => setIsProfileOpen(true)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isDarkMode
                  ? 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50'
                  : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        {!isSidebarCollapsed && (
          <div
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-orange-500 transition-colors ${
              isResizing ? 'bg-orange-500' : 'bg-transparent'
            }`}
            onMouseDown={handleMouseDown}
            title="Drag to resize sidebar"
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header with Language Selector and Feedback */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-end items-center gap-4 transition-colors duration-300`}>
          {/* Feedback Button */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700 hover:text-orange-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="text-sm font-medium">Feedback</span>
          </button>

          {/* Language Selector */}
          <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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

        {/* Page Content */}
        <div className={`flex-1 overflow-y-auto transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {children}
        </div>

        {/* Footer */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t py-4 px-6 transition-colors min-h-[4.5rem]`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Footer Links */}
            <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <a href="#" className="hover:text-orange-500 transition-colors">Home</a>
              <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <a href="#" className="hover:text-orange-500 transition-colors">About</a>
              <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <a href="#" className="hover:text-orange-500 transition-colors">Changelog</a>
              <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <a href="#" className="hover:text-orange-500 transition-colors">Join Us</a>
              <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
              <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
              <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <a href="#" className="hover:text-orange-500 transition-colors">Status</a>
              <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <a href="#" className="hover:text-orange-500 transition-colors">Support</a>
              <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>HushFlock @2025 All Copyright Reserved</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm font-medium">Light</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="text-sm font-medium">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        email={user?.email || ''}
        fullName={user?.user_metadata?.full_name}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSignOut={signOut}
        isDarkMode={isDarkMode}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}