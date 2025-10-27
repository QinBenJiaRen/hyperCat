import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const platform = searchParams.get('platform')

  if (!platform) {
    return NextResponse.json({ error: 'Platform is required' }, { status: 400 })
  }

  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => Promise.resolve(cookieStore)
    })
    
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 从数据库删除授权信息
    const { error } = await supabase
      .from('social_authorizations')
      .delete()
      .eq('user_id', session.user.id)
      .eq('platform', platform)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking auth:', error)
    return NextResponse.json({ error: 'Failed to revoke authorization' }, { status: 500 })
  }
}
