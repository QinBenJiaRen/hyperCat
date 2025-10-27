import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { planId, email } = await request.json()

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({
      cookies: () => Promise.resolve(cookieStore)
    })

    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // 定义计划价格（以美分为单位）
    const planPrices: Record<string, number> = {
      plus: 990,  // $9.90
      pro: 1990   // $19.90
    }

    if (!planPrices[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // 创建 Stripe Checkout Session
    const session_stripe = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `HypeCat AI - ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
              description: planId === 'plus' 
                ? 'Up to 100 contents / month with scheduling & publishing'
                : '1,000+ contents / month with advanced analytics',
            },
            unit_amount: planPrices[planId],
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/membership?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/membership?canceled=true`,
      customer_email: email,
      metadata: {
        userId: session.user.id,
        planId: planId,
      },
    })

    return NextResponse.json({ sessionId: session_stripe.id, url: session_stripe.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
