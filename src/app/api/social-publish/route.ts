// Social Media Publishing API
// Fixed syntax issues - 2025-10-24

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// 平台 API 配置
const PLATFORM_APIS = {
  instagram: {
    endpoint: 'https://graph.instagram.com/v18.0',
    postPath: '/me/media'
  },
  facebook: {
    endpoint: 'https://graph.facebook.com/v18.0',
    postPath: '/me/feed'
  },
  x: {
    endpoint: 'https://api.twitter.com/2',
    postPath: '/tweets'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, content, accountId } = body

    if (!platform || !content) {
      return NextResponse.json(
        { error: 'Platform and content are required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => Promise.resolve(cookieStore)
    })
    
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in first.' },
        { status: 401 }
      )
    }

    // 从数据库获取授权信息
    const { data: authData, error: authError } = await supabase
      .from('social_authorizations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('platform', platform)
      .single()

    if (authError || !authData) {
      return NextResponse.json(
        { error: 'Not authorized. Please connect your account first.' },
        { status: 401 }
      )
    }

    // 检查 token 是否过期
    if (authData.token_expires_at && new Date(authData.token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Authorization expired. Please reconnect your account.' },
        { status: 401 }
      )
    }

    // 演示模式：如果使用的是 demo token，直接返回成功
    if (authData.access_token === 'demo_access_token') {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 记录发布历史
      await supabase.from('publishing_history').insert({
        user_id: session.user.id,
        platform,
        content,
        post_id: `demo_post_${Date.now()}`,
        post_url: `https://${platform}.com/post/demo_${Date.now()}`,
        status: 'success'
      })
      
      return NextResponse.json({
        success: true,
        postId: `demo_post_${Date.now()}`,
        url: `https://${platform}.com/post/demo_${Date.now()}`,
        message: 'Content published successfully (Demo Mode)'
      })
    }

    // 真实的 API 调用逻辑
    const apiConfig = PLATFORM_APIS[platform as keyof typeof PLATFORM_APIS]
    
    if (!apiConfig) {
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      )
    }

    // 根据不同平台构建请求
    let apiResponse
    
    switch (platform) {
      case 'instagram':
        // Instagram 发布需要两步：创建媒体容器 -> 发布
        apiResponse = await publishToInstagram(authData.access_token, content, accountId)
        break
        
      case 'facebook':
        // Facebook 页面发布
        apiResponse = await publishToFacebook(authData.access_token, content, accountId)
        break
        
      case 'x':
        // X (Twitter) 发布
        apiResponse = await publishToX(authData.access_token, content)
        break
        
      default:
        return NextResponse.json(
          { error: 'Platform not implemented' },
          { status: 501 }
        )
    }

    // 记录发布历史
    await supabase.from('publishing_history').insert({
      user_id: session.user.id,
      platform,
      content,
      post_id: apiResponse.postId,
      post_url: apiResponse.url || null,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      ...apiResponse
    })

  } catch (error: any) {
    console.error('Error publishing content:', error)
    
    // 记录失败的发布
    try {
      const cookieStore = await cookies()
      const supabase = createRouteHandlerClient({ 
        cookies: () => Promise.resolve(cookieStore)
      })
      const { data: { session } } = await supabase.auth.getSession()
      const body = await request.json()
      
      if (session) {
        await supabase.from('publishing_history').insert({
          user_id: session.user.id,
          platform: body.platform,
          content: body.content,
          status: 'failed',
          error_message: error.message || 'Unknown error'
        })
      }
    } catch (logError) {
      console.error('Error logging failure:', logError)
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to publish content',
        details: error.response?.data || error.toString()
      },
      { status: 500 }
    )
  }
}

// Instagram 发布函数
async function publishToInstagram(accessToken: string, content: string, accountId: string) {
  // 注意：Instagram API 需要图片或视频 URL
  // 这里仅作为示例，实际使用需要上传媒体文件
  const response = await fetch(
    `https://graph.instagram.com/v18.0/${accountId}/media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caption: content,
        access_token: accessToken
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Instagram API error')
  }

  const data = await response.json()
  return {
    postId: data.id,
    message: 'Posted to Instagram successfully'
  }
}

// Facebook 发布函数
async function publishToFacebook(accessToken: string, content: string, pageId?: string) {
  const targetId = pageId || 'me'
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${targetId}/feed`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        access_token: accessToken
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Facebook API error')
  }

  const data = await response.json()
  return {
    postId: data.id,
    message: 'Posted to Facebook successfully'
  }
}

// X (Twitter) 发布函数
async function publishToX(accessToken: string, content: string) {
  const response = await fetch(
    'https://api.twitter.com/2/tweets',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'X API error')
  }

  const data = await response.json()
  return {
    postId: data.data.id,
    message: 'Posted to X successfully'
  }
}
