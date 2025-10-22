'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('处理中...')
  const [error, setError] = useState('')
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (hasRedirected) {
      console.log('⚠️ Already redirected, skipping...')
      return
    }

    const handleCallback = async () => {
      try {
        const next = '/content-creation'
        
        console.log('=== Auth Callback Page ===')
        console.log('Full URL:', window.location.href)
        console.log('Hash:', window.location.hash)
        
        // 让Supabase自动处理URL中的session（hash或query参数）
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        console.log('Current session:', sessionData.session?.user?.email || 'No session')
        
        if (sessionError) {
          console.error('Session error:', sessionError)
        }
        
        // 如果已经有session，说明Supabase已经自动处理了OAuth回调
        if (sessionData.session) {
          console.log('✅ Session exists, proceeding with redirect')
          setStatus(`登录成功! 用户: ${sessionData.session.user.email}`)
          
          // 保存邮箱到localStorage
          localStorage.setItem('userEmail', sessionData.session.user.email)
          console.log('✅ Email saved to localStorage:', sessionData.session.user.email)
          
          // 立即跳转
          console.log('🚀 Attempting redirect to:', next)
          setHasRedirected(true)
          setStatus('🚀 正在跳转到首页...')
          
          // 直接跳转，不使用任何延迟
          console.log('🔄 Executing redirect NOW...')
          console.log('🔄 Target URL:', next)
          
          // 使用 setTimeout(0) 确保状态更新后再跳转
          setTimeout(() => {
            console.log('🔄 Inside setTimeout, about to redirect')
            window.location.href = next
            console.log('⚠️ This line should not appear')
          }, 100)
          
          return
        }
        
        // 如果没有session，尝试手动处理
        console.log('No session found, trying manual processing...')
        
        // 检查URL hash中的token（隐式流）
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        // 检查查询参数中的code（PKCE流）
        const code = searchParams.get('code')
        
        console.log('Access Token:', accessToken ? '存在' : '不存在')
        console.log('Code:', code ? '存在' : '不存在')
        
        if (accessToken && refreshToken) {
          // 处理隐式流的token
          setStatus('正在设置会话...')
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Set session error:', error)
            setError(`设置会话失败: ${error.message}`)
            setStatus('授权失败')
            setTimeout(() => window.location.href = '/login', 3000)
            return
          }

          console.log('Session created:', data.session?.user?.email)
          setStatus(`登录成功! 用户: ${data.session?.user?.email}`)
          
          // 保存邮箱到localStorage，避免弹框
          if (data.session?.user?.email) {
            localStorage.setItem('userEmail', data.session.user.email)
            console.log('✅ Email saved to localStorage:', data.session.user.email)
            console.log('✅ Verify localStorage:', localStorage.getItem('userEmail'))
          }
          
          // 使用window.location.href进行完整页面跳转，确保middleware能获取到新的session
          setTimeout(() => {
            console.log('Redirecting to:', next)
            window.location.href = next
          }, 1000)
        } else if (code) {
          // 处理PKCE流的code
          setStatus('正在交换授权码...')
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Exchange error:', error)
            setError(`交换失败: ${error.message}`)
            setStatus('授权失败')
            setTimeout(() => window.location.href = '/login', 3000)
            return
          }

          console.log('Session created:', data.session?.user?.email)
          setStatus(`登录成功! 用户: ${data.session?.user?.email}`)
          
          // 保存邮箱到localStorage，避免弹框
          if (data.session?.user?.email) {
            localStorage.setItem('userEmail', data.session.user.email)
            console.log('✅ Email saved to localStorage:', data.session.user.email)
            console.log('✅ Verify localStorage:', localStorage.getItem('userEmail'))
          }
          
          // 使用window.location.href进行完整页面跳转，确保middleware能获取到新的session
          setTimeout(() => {
            console.log('Redirecting to:', next)
            window.location.href = next
          }, 1000)
        } else {
          setError('未收到授权信息')
          setStatus('授权失败')
          setTimeout(() => window.location.href = '/login', 3000)
        }
      } catch (err: any) {
        console.error('Callback error:', err)
        setError(err.message)
        setStatus('处理出错')
        setTimeout(() => window.location.href = '/login', 3000)
      }
    }

    handleCallback()
  }, [searchParams, hasRedirected])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4">
            <svg className="animate-spin h-12 w-12 mx-auto text-orange-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">OAuth 登录处理</h2>
          
          <p className="text-lg text-gray-700 mb-4">{status}</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <a 
                href="/content-creation" 
                className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                点击这里手动跳转
              </a>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p>URL参数:</p>
            <pre className="mt-2 text-xs text-left bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify({
                hasAccessToken: !!new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.substring(1) : '').get('access_token'),
                hasCode: !!searchParams.get('code'),
                queryParams: Array.from(searchParams.entries()),
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
