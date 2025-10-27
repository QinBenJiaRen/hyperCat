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
    // Demo 模式：直接模拟授权成功并立即跳转
    const callbackUrl = `${config.redirectUri}?code=demo_code&state=demo`
    return NextResponse.redirect(callbackUrl)
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
