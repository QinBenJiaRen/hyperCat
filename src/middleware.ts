import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // OAuth回调路由，直接放行不做任何处理
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  // 公开路由（不需要认证）
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/debug-auth']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // 如果用户未登录且访问受保护路由，重定向到登录页
  if (!session && !isPublicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 如果用户已登录且访问登录/注册页，重定向到内容创建页
  if (session && isPublicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/content-creation'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|logo.jpg).*)',
  ],
}
