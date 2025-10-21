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
      `
      <!DOCTYPE html>
      <html>
        <head><title>Authorization Failed</title></head>
        <body>
          <script>
            alert('Authorization failed or was cancelled');
            window.close();
          </script>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Not Logged In</title></head>
          <body>
            <script>
              alert('Please log in first');
              window.close();
            </script>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
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

    // 返回成功页面并关闭窗口
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .success {
              text-align: center;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .checkmark {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: #4CAF50;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 30px;
            }
            h1 {
              color: #333;
              margin: 0 0 10px;
            }
            p {
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="success">
            <div class="checkmark">✓</div>
            <h1>Authorization Successful!</h1>
            <p>You have successfully connected your ${platform} account.</p>
            <p>This window will close automatically...</p>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Authorization Error</title></head>
        <body>
          <script>
            alert('An error occurred during authorization');
            window.close();
          </script>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}
    })

    // 返回成功页面并关闭窗口
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .success {
              text-align: center;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .checkmark {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: #4CAF50;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 30px;
            }
            h1 {
              color: #333;
              margin: 0 0 10px;
            }
            p {
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="success">
            <div class="checkmark">✓</div>
            <h1>Authorization Successful!</h1>
            <p>You have successfully connected your ${platform} account.</p>
            <p>This window will close automatically...</p>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Authorization Error</title></head>
        <body>
          <script>
            alert('An error occurred during authorization');
            window.close();
          </script>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}
