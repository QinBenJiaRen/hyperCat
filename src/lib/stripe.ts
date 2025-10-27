// Stripe Configuration
// TODO: 安装 Stripe 包后取消注释
// npm install @stripe/stripe-js stripe

// import { loadStripe, Stripe } from '@stripe/stripe-js'

// let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  console.warn('Stripe is not installed yet. Please run: npm install @stripe/stripe-js stripe')
  return null
}

/* TODO: 安装 Stripe 后取消注释
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
*/
