import { NextRequest, NextResponse } from 'next/server'
// import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// TODO: 安装 Stripe 包后取消注释
// npm install @stripe/stripe-js stripe

/*
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
*/

// Supabase Admin Client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // TODO: 安装 Stripe 后取消注释
  return NextResponse.json(
    { error: 'Stripe is not installed yet. Please run: npm install @stripe/stripe-js stripe' },
    { status: 503 }
  )

  /* TODO: 安装 Stripe 后取消注释以下代码
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // 处理事件
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (userId && planId) {
          // 更新用户订阅状态到数据库
          const { error } = await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_plan: planId,
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating user subscription:', error)
          }

          // 保存到本地存储（在客户端处理）
          console.log('Subscription activated for user:', userId, 'Plan:', planId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // 根据 customer ID 查找用户
        const { data: user } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_status: subscription.status,
            })
            .eq('id', user.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // 根据 customer ID 查找用户
        const { data: user } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_plan: 'free',
              subscription_status: 'canceled',
            })
            .eq('id', user.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Error processing webhook:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
  */
}
