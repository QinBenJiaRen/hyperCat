import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// 从数据库读取授权信息
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const platform = searchParams.get('platform')

  if (!platform) {
    return NextResponse.json({ error: 'Platform is required' }, { status: 400 })
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ isAuthorized: false })
    }

    // 从数据库查询授权信息
    const { data, error } = await supabase
      .from('social_authorizations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('platform', platform)
      .single()

    if (error || !data) {
      return NextResponse.json({ isAuthorized: false })
    }

    // 检查 token 是否过期
    if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
      return NextResponse.json({ 
        isAuthorized: false,
        expired: true 
      })
    }

    return NextResponse.json({
      isAuthorized: true,
      accountName: data.account_name,
      accountId: data.account_id
    })
  } catch (error) {
    console.error('Error checking auth status:', error)
    return NextResponse.json({ isAuthorized: false })
  }
}
