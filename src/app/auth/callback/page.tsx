'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallback() {
  const searchParams = useSearchParams()
  const hasProcessed = useRef(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const next = '/content-creation'
        
        if (code) {
          // 处理 OAuth 回调
          await supabase.auth.exchangeCodeForSession(code)
          window.location.replace(next)
        } else {
          // 检查是否已有 session
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            window.location.replace(next)
          } else {
            window.location.replace('/login')
          }
        }
      } catch (err) {
        console.error('Callback error:', err)
        window.location.replace('/login')
      }
    }

    handleCallback()
  }, [searchParams, supabase])

  // 返回 null，不显示任何内容
  return null
}
