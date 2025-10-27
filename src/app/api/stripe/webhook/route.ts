import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// 使用 Service Role Key 来绕过 RLS
// 注意：在构建时这些可能为空，但运行时需要
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    // 检查必需的环境变量
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

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

    // 处理不同的事件类型
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (!userId || !planId) {
          console.error('Missing metadata in checkout session')
          break
        }

        // 更新用户订阅信息
        const { error } = await supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_plan: planId,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq('id', userId)

        if (error) {
          console.error('Error updating user subscription:', error)
        } else {
          console.log(`Subscription activated for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const stripeCustomerId = subscription.customer as string

        // 获取订阅状态
        const status = subscription.status

        // 根据 customer ID 查找并更新用户
        const { error } = await supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_status: status,
          })
          .eq('stripe_customer_id', stripeCustomerId)

        if (error) {
          console.error('Error updating subscription status:', error)
        } else {
          console.log(`Subscription updated for customer ${stripeCustomerId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const stripeCustomerId = subscription.customer as string

        // 将用户降级为免费计划
        const { error } = await supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_plan: 'free',
            subscription_status: 'inactive',
            subscription_current_period_end: null,
          })
          .eq('stripe_customer_id', stripeCustomerId)

        if (error) {
          console.error('Error downgrading subscription:', error)
        } else {
          console.log(`Subscription canceled for customer ${stripeCustomerId}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
