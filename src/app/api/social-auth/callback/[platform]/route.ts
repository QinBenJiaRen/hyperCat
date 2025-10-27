import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Auth Failed</title></head><body><script>
if(window.opener){window.opener.postMessage({type:'oauth-error',message:'Authorization failed'},'*');window.close();}else{window.location.href='/content-creation';}
</script></body></html>`,
      { 
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store',
        } 
      }
    )
  }

  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => Promise.resolve(cookieStore)
    })
    
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return new NextResponse(
        `<!DOCTYPE html><html><head><title>Not Logged In</title></head><body><script>
if(window.opener){window.opener.postMessage({type:'oauth-error',message:'Please log in first'},'*');window.close();}else{window.location.href='/login';}
</script></body></html>`,
        { 
          headers: { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store',
          } 
        }
      )
    }

    // 在真实的实现中，这里需要：
    // 1. 使用 code 交换 access_token
    // 2. 获取用户信息
    // 3. 将 token 存储到数据库
    
    // 这里是演示实现，直接存储模拟数据
    const authData = {
      user_id: session.user.id,
      platform,
      access_token: code === 'demo_code' ? 'demo_access_token' : code,
      account_name: `Demo ${platform} Account`,
      account_id: `${platform}_${Date.now()}`,
      token_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    }

    // 存储到数据库（upsert = 如果存在则更新，不存在则插入）
    const { error } = await supabase
      .from('social_authorizations')
      .upsert(authData, {
        onConflict: 'user_id,platform,account_id'
      })

    if (error) {
      console.error('Error saving authorization:', error)
      throw error
    }

    // 返回最小化脚本，立即执行
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Auth</title></head><body><script>
if(window.opener){window.opener.postMessage({type:'oauth-success',platform:'${platform}',accountName:'${authData.account_name}'},'*');window.close();}else{window.location.href='/content-creation';}
</script></body></html>`,
      {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Auth Error</title></head><body><script>
if(window.opener){window.opener.postMessage({type:'oauth-error',message:'Authorization error'},'*');window.close();}else{window.location.href='/content-creation';}
</script></body></html>`,
      { 
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store',
        } 
      }
    )
  }
}
