'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface SocialMediaPublisherProps {
  platform: 'instagram' | 'facebook' | 'x'
  content: string
  onPublishSuccess?: () => void
  onPublishError?: (error: string) => void
}

interface AuthStatus {
  isAuthorized: boolean
  accountName?: string
  accountId?: string
}

export default function SocialMediaPublisher({
  platform,
  content,
  onPublishSuccess,
  onPublishError
}: SocialMediaPublisherProps) {
  const { t } = useTranslation()
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthorized: false })
  const [isPublishing, setIsPublishing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // 检查授权状态
  useEffect(() => {
    checkAuthStatus()
  }, [platform])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`/api/social-auth/status?platform=${platform}`)
      if (response.ok) {
        const data = await response.json()
        setAuthStatus(data)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    }
  }

  // 开始授权流程
  const handleAuthorize = () => {
    // 打开授权窗口
    const authUrl = `/api/social-auth/authorize?platform=${platform}`
    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    
    const authWindow = window.open(
      authUrl,
      'social-auth',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    // 监听授权完成
    const checkAuth = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkAuth)
        checkAuthStatus()
        setShowAuthModal(false)
      }
    }, 500)
  }

  // 取消授权
  const handleRevokeAuth = async () => {
    try {
      const response = await fetch(`/api/social-auth/revoke?platform=${platform}`, {
        method: 'POST'
      })
      if (response.ok) {
        setAuthStatus({ isAuthorized: false })
      }
    } catch (error) {
      console.error('Error revoking auth:', error)
    }
  }

  // 发布内容
  const handlePublish = async () => {
    if (!authStatus.isAuthorized) {
      setShowAuthModal(true)
      return
    }

    if (!content) {
      onPublishError?.(t('contentCreation.noContentToPublish'))
      return
    }

    setIsPublishing(true)

    try {
      const response = await fetch('/api/social-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          content,
          accountId: authStatus.accountId
        })
      })

      if (response.ok) {
        const data = await response.json()
        onPublishSuccess?.()
      } else {
        const error = await response.json()
        onPublishError?.(error.message || t('contentCreation.publishError'))
      }
    } catch (error) {
      console.error('Error publishing content:', error)
      onPublishError?.(t('contentCreation.publishError'))
    } finally {
      setIsPublishing(false)
    }
  }

  const getPlatformName = () => {
    const names = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      x: 'X (Twitter)'
    }
    return names[platform]
  }

  const getPlatformColor = () => {
    const colors = {
      instagram: 'bg-pink-500 hover:bg-pink-600',
      facebook: 'bg-blue-600 hover:bg-blue-700',
      x: 'bg-black hover:bg-gray-800'
    }
    return colors[platform]
  }

  return (
    <div>
      {/* 发布按钮 */}
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className={`w-full ${getPlatformColor()} text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
          isPublishing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isPublishing ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('contentCreation.publishingNow')}
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {t('contentCreation.publishNow', { platform: getPlatformName() })}
          </>
        )}
      </button>

      {/* 授权状态指示 */}
      <div className="mt-2 text-xs text-center">
        {authStatus.isAuthorized ? (
          <span className="text-green-600 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('contentCreation.authorizedAs', { account: authStatus.accountName || 'Account' })}
          </span>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="text-orange-500 hover:text-orange-600 underline"
          >
            {t('contentCreation.authorizeAccount')}
          </button>
        )}
      </div>

      {/* 授权模态框 */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] max-w-[90vw]">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('contentCreation.authorizeTitle', { platform: getPlatformName() })}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {t('contentCreation.authorizeDescription', { platform: getPlatformName() })}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('contentCreation.cancel')}
              </button>
              <button
                onClick={handleAuthorize}
                className={`flex-1 py-2 px-4 text-white rounded-lg ${getPlatformColor()}`}
              >
                {t('contentCreation.authorize')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
