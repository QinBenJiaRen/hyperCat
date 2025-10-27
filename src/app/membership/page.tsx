'use client'

import { useState, useEffect } from 'react'
import MainLayout from '../../components/MainLayout'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function MembershipPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)
  
  // 初始化当前计划状态
  const [currentPlan, setCurrentPlan] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentPlan') || 'free'
    }
    return 'free'
  })

  // 初始化选中计划状态为当前计划
  const [selectedPlan, setSelectedPlan] = useState<string>(() => currentPlan)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(() => {
    // 从 localStorage 获取用户邮箱
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : ''
    
    return {
      email: userEmail, // 预填充用户邮箱
      agree: false
    }
  })

  const plans = [
    {
      id: 'free',
      tag: 'Starter',
      price: 0,
      period: 'month',
      features: [
        'Up to 5 contents / month',
        'Basic templates',
        'Community support'
      ]
    },
    {
      id: 'plus',
      tag: 'Most popular',
      price: 9.9,
      period: 'month',
      features: [
        'Up to 100 contents / month',
        'Scheduling & Publishing',
        'Email support'
      ],
      tagStyle: {
        background: '#FEF3C7',
        borderColor: '#FDE68A',
        color: '#92400E'
      }
    },
    {
      id: 'pro',
      tag: 'For teams',
      price: 19.9,
      period: 'month',
      features: [
        '1,000+ contents / month',
        'Advanced analytics',
        'Priority support'
      ]
    }
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleContinue = async () => {
    if (currentStep === 1) {
      // 在第一步完成时更新当前计划
      localStorage.setItem('currentPlan', selectedPlan)
      setCurrentPlan(selectedPlan)
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
    
    // 如果是最后一步，完成订阅流程
    if (currentStep === 3) {
      router.push('/dashboard')
    }
  }

  // 处理 Stripe 支付
  const handleStripePayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // 免费计划直接激活
      if (selectedPlan === 'free') {
        localStorage.setItem('currentPlan', 'free')
        setCurrentPlan('free')
        setCurrentStep(3)
        setIsProcessing(false)
        return
      }

      // 创建 Stripe Checkout Session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // 重定向到 Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(error.message || 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  // 检查支付成功/取消状态
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success) {
      // 支付成功
      localStorage.setItem('currentPlan', selectedPlan)
      setCurrentPlan(selectedPlan)
      setCurrentStep(3)
      // 清理 URL 参数
      router.replace('/membership')
    } else if (canceled) {
      // 支付取消
      alert('Payment was canceled. Please try again.')
      router.replace('/membership')
    }
  }, [searchParams])

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 表单验证函数
  const validateForm = () => {
    // 如果是免费计划，不需要验证支付信息
    if (selectedPlan === 'free') {
      return true
    }

    // Stripe Checkout 只需要 email 和同意条款
    // 卡信息在 Stripe 的安全页面输入
    if (!formData.email.trim() || !formData.email.includes('@')) return false
    if (!formData.agree) return false

    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Membership & Billing</h1>
          <div className="px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-full text-xs font-semibold">
            Current plan: {plans.find(p => p.id === currentPlan)?.tag || 'Free'}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 text-orange-900 px-3 py-2 rounded-lg mb-4 flex items-center gap-2 text-sm">
          <strong>Heads up:</strong> You've used 100% of your free credits. Upgrade to continue creating content without limits.
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
          {/* Stepper */}
          <div className="border-b border-gray-200 p-3">
            <div className="flex justify-between items-center relative">
              {/* Progress bar background */}
              <div className="absolute left-0 right-0 h-[2px] top-[12px] bg-gray-200 -z-1"></div>
              
              {/* Active progress bar */}
              <div 
                className="absolute left-0 h-[2px] top-[12px] bg-orange-500 transition-all duration-300 -z-1"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>

              {/* Steps */}
              {['Select a plan', 'Payment details', 'Confirmation'].map((step, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center relative ${
                    currentStep > index + 1 ? 'text-orange-500' :
                    currentStep === index + 1 ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {/* Step number circle */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                    ${currentStep > index + 1 ? 'bg-orange-500 text-white' :
                      currentStep === index + 1 ? 'border-2 border-orange-500 bg-orange-50 text-orange-500' :
                      'border-2 border-gray-200 bg-white'
                    } transition-all duration-300`}
                  >
                    {currentStep > index + 1 ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  {/* Step label */}
                  <div className="mt-1.5 text-xs font-medium whitespace-nowrap">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Plan Selection */}
          {currentStep === 1 && (
            <div className="p-4">
              <h2 className="text-lg font-bold mb-1">Step 1 · Choose the plan that fits</h2>
              <p className="text-gray-500 text-sm mb-4">Change anytime. No hidden fees.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all
                      ${selectedPlan === plan.id ? 'border-orange-500 shadow-orange-100' : 'border-gray-200'}
                      hover:shadow-lg hover:-translate-y-0.5`}
                  >
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2
                      ${selectedPlan === plan.id ? 'bg-orange-500 border-orange-500' : 'border-gray-200'}
                      flex items-center justify-center text-white text-xs`}>
                      {selectedPlan === plan.id && '✓'}
                    </div>
                    <div className="inline-block px-2 py-0.5 text-xs font-bold rounded-full mb-2"
                      style={plan.tagStyle || {
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        color: '#475569'
                      }}>
                      {plan.tag}
                    </div>
                    <div className="text-xl font-bold mb-2">
                      ${plan.price} <span className="text-xs font-semibold text-gray-500">/ {plan.period}</span>
                    </div>
                    <ul className="space-y-1 text-gray-700 text-sm list-disc pl-4">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!selectedPlan}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold text-white
                    ${selectedPlan ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === 2 && (
            <div className="p-4">
              <h2 className="text-lg font-bold mb-1">Step 2 · Payment details</h2>
              {selectedPlan === 'free' ? (
                <p className="text-gray-500 text-sm mb-3">The Free plan doesn't require payment. Click "Activate Free" to continue.</p>
              ) : (
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Payment Form */}
                  <div className="flex-1">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">Secure Payment with Stripe</p>
                          <p>You'll be redirected to Stripe's secure checkout page to enter your card information. We never store your card details.</p>
                        </div>
                      </div>
                    </div>

                    <form className="space-y-3">
                      <div>
                        <label className="block font-semibold text-sm mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          placeholder="jane@company.com"
                        />
                        <p className="mt-1 text-xs text-gray-500">We'll send your receipt to this email</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          name="agree"
                          checked={formData.agree}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <label className="text-gray-700 text-sm">
                          I agree to the <a href="#" className="text-orange-500 hover:underline">billing terms</a> & <a href="#" className="text-orange-500 hover:underline">privacy policy</a>
                        </label>
                      </div>
                    </form>
                  </div>

                  {/* Order Summary */}
                  <div className="w-full md:w-72">
                    <div className="border-2 border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-sm">Selected plan</h3>
                          <p className="text-gray-500 text-xs">
                            {plans.find(p => p.id === selectedPlan)?.tag || '—'}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100">
                          Monthly
                        </span>
                      </div>
                      
                      <hr className="border-gray-200 my-3" />
                      
                      <div className="flex justify-between mb-1.5 text-sm">
                        <span>Subtotal</span>
                        <span>${plans.find(p => p.id === selectedPlan)?.price.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between mb-3 text-sm">
                        <span>Est. tax</span>
                        <span>$0.00</span>
                      </div>
                      
                      <hr className="border-gray-200 my-3" />
                      
                      <div className="flex justify-between font-bold text-base">
                        <span>Total due today</span>
                        <span>${plans.find(p => p.id === selectedPlan)?.price.toFixed(2) || '0.00'}</span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-3">
                        Secured by Stripe · Cancel anytime from Settings
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleBack}
                  disabled={isProcessing}
                  className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleStripePayment}
                  disabled={!validateForm() || isProcessing}
                  className={`px-5 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2
                    ${validateForm() && !isProcessing
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedPlan === 'free' ? 'Activate Free' : 'Pay with Stripe'}
                      {selectedPlan !== 'free' && validateForm() && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-3xl text-white shadow-lg shadow-orange-200">
                ✓
              </div>
              <h2 className="text-xl font-bold mb-2">All set! Your subscription is active</h2>
              <p className="text-gray-500 text-sm mb-4">
                Thank you for your payment. We've sent you an email with your receipt.
              </p>
              <button
                onClick={() => router.push('/content-creation')}
                className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 flex items-center justify-center mx-auto gap-2"
              >
                <span>Start Creation</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}