import { NextRequest, NextResponse } from 'next/server'

// OAuth 配置 - 生产环境中应该从环境变量读取
const OAUTH_CONFIG = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_URL + '/api/social-auth/callback/instagram',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scope: 'user_profile,user_media'
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_URL + '/api/social-auth/callback/facebook',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scope: 'pages_manage_posts,pages_read_engagement'
  },
  x: {
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_URL + '/api/social-auth/callback/x',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scope: 'tweet.read tweet.write users.read'
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const platform = searchParams.get('platform') as keyof typeof OAUTH_CONFIG

  if (!platform || !OAUTH_CONFIG[platform]) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  const config = OAUTH_CONFIG[platform]

  // 检查是否配置了 OAuth 凭证
  if (!config.clientId) {
    // 如果没有配置，返回一个演示页面
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Configuration Required</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .card {
              background: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 15px;
            }
            code {
              background: #f0f0f0;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: monospace;
              color: #e83e8c;
            }
            .button {
              background: #0070f3;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 20px;
            }
            .button:hover {
              background: #0051cc;
            }
            .demo-mode {
              background: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🔑 OAuth Configuration Required</h1>
            <p>To enable ${platform.toUpperCase()} publishing, please configure your OAuth credentials in the environment variables:</p>
            <ul>
              <li><code>${platform.toUpperCase()}_CLIENT_ID</code></li>
              <li><code>${platform.toUpperCase()}_CLIENT_SECRET</code></li>
            </ul>
            <div class="demo-mode">
              <strong>Demo Mode:</strong> For testing purposes, you can simulate authorization by clicking the button below.
            </div>
            <button class="button" onclick="simulateAuth()">Simulate Authorization</button>
          </div>
          <script>
            function simulateAuth() {
              // 模拟授权成功
              fetch('/api/social-auth/callback/${platform}?code=demo_code&state=demo', {
                method: 'GET'
              }).then(() => {
                window.close();
              });
            }
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
  }

  // 构建授权 URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: Math.random().toString(36).substring(7)
  })

  const authUrl = `${config.authUrl}?${params.toString()}`

  // 重定向到授权页面
  return NextResponse.redirect(authUrl)
}
