'use client'

import { useState } from 'react'
import MainLayout from '../../components/MainLayout'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function MembershipPage() {
  const router = useRouter()
  const { t } = useTranslation()
  
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
      fullName: '',
      email: userEmail, // 预填充用户邮箱
      card: '',
      exp: '',
      cvc: '',
      country: '',
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

  const handleContinue = () => {
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

    // 验证所有必填字段
    if (!formData.fullName.trim()) return false
    if (!formData.email.trim() || !formData.email.includes('@')) return false
    if (!formData.card.trim() || formData.card.replace(/\s/g, '').length !== 16) return false
    if (!formData.exp.trim() || !/^\d{2}\/\d{2}$/.test(formData.exp)) return false
    if (!formData.cvc.trim() || !/^\d{3,4}$/.test(formData.cvc)) return false
    if (!formData.country) return false
    if (!formData.agree) return false

    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let formattedValue = value

    // 格式化信用卡号（每4位添加空格）
    if (name === 'card') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
    }
    // 格式化过期日期（自动添加斜杠）
    else if (name === 'exp') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4)
      }
    }
    // 限制 CVC 为 3-4 位数字
    else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : formattedValue
    }))
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Membership & Billing</h1>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-800 rounded-full text-sm font-semibold">
            Current plan: {plans.find(p => p.id === currentPlan)?.tag || 'Free'}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 text-orange-900 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <strong>Heads up:</strong> You've used 100% of your free credits. Upgrade to continue creating content without limits.
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
          {/* Stepper */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex justify-between items-center relative">
              {/* Progress bar background */}
              <div className="absolute left-0 right-0 h-[2px] top-[15px] bg-gray-200 -z-1"></div>
              
              {/* Active progress bar */}
              <div 
                className="absolute left-0 h-[2px] top-[15px] bg-orange-500 transition-all duration-300 -z-1"
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep > index + 1 ? 'bg-orange-500 text-white' :
                      currentStep === index + 1 ? 'border-2 border-orange-500 bg-orange-50 text-orange-500' :
                      'border-2 border-gray-200 bg-white'
                    } transition-all duration-300`}
                  >
                    {currentStep > index + 1 ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  {/* Step label */}
                  <div className="mt-2 text-sm font-medium whitespace-nowrap">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Plan Selection */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Step 1 · Choose the plan that fits</h2>
              <p className="text-gray-500 mb-6">Change anytime. No hidden fees.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all
                      ${selectedPlan === plan.id ? 'border-orange-500 shadow-orange-100' : 'border-gray-200'}
                      hover:shadow-lg hover:-translate-y-0.5`}
                  >
                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2
                      ${selectedPlan === plan.id ? 'bg-orange-500 border-orange-500' : 'border-gray-200'}
                      flex items-center justify-center text-white`}>
                      {selectedPlan === plan.id && '✓'}
                    </div>
                    <div className="inline-block px-2 py-1 text-xs font-bold rounded-full mb-3"
                      style={plan.tagStyle || {
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        color: '#475569'
                      }}>
                      {plan.tag}
                    </div>
                    <div className="text-2xl font-bold mb-2">
                      ${plan.price} <span className="text-sm font-semibold text-gray-500">/ {plan.period}</span>
                    </div>
                    <ul className="space-y-2 text-gray-700 list-disc pl-5">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!selectedPlan}
                  className={`px-4 py-2 rounded-lg font-semibold text-white
                    ${selectedPlan ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Step 2 · Payment details</h2>
              {selectedPlan === 'free' ? (
                <p className="text-gray-500 mb-6">The Free plan doesn't require payment. Click "Activate Free" to continue.</p>
              ) : (
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Payment Form */}
                  <div className="flex-1">
                    <form className="space-y-4">
                      <div>
                        <label className="block font-semibold mb-2">Full name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                          placeholder="Jane Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block font-semibold mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                          placeholder="jane@company.com"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-2">Card number</label>
                        <input
                          type="text"
                          name="card"
                          value={formData.card}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                          placeholder="4242 4242 4242 4242"
                        />
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block font-semibold mb-2">Expiry</label>
                          <input
                            type="text"
                            name="exp"
                            value={formData.exp}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block font-semibold mb-2">CVC</label>
                          <input
                            type="text"
                            name="cvc"
                            value={formData.cvc}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            placeholder="CVC"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-2">Country/Region</label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        >
                          <option value="">Select country</option>
                          <option value="CA">Canada</option>
                          <option value="US">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="DE">Germany</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="agree"
                          checked={formData.agree}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <label className="text-gray-700">
                          I agree to the billing terms & privacy policy
                        </label>
                      </div>
                    </form>
                  </div>

                  {/* Order Summary */}
                  <div className="w-full md:w-80">
                    <div className="border-2 border-gray-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold">Selected plan</h3>
                          <p className="text-gray-500">
                            {plans.find(p => p.id === selectedPlan)?.tag || '—'}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100">
                          Monthly
                        </span>
                      </div>
                      
                      <hr className="border-gray-200 my-4" />
                      
                      <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>${plans.find(p => p.id === selectedPlan)?.price.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span>Est. tax</span>
                        <span>$0.00</span>
                      </div>
                      
                      <hr className="border-gray-200 my-4" />
                      
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total due today</span>
                        <span>${plans.find(p => p.id === selectedPlan)?.price.toFixed(2) || '0.00'}</span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-4">
                        Secured by Stripe · Cancel anytime from Settings
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!validateForm()}
                  className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2
                    ${validateForm()
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {selectedPlan === 'free' ? 'Activate Free' : 'Pay'}
                  {selectedPlan !== 'free' && validateForm() && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-4xl text-white shadow-lg shadow-orange-200">
                ✓
              </div>
              <h2 className="text-2xl font-bold mb-2">All set! Your subscription is active</h2>
              <p className="text-gray-500 mb-6">
                Thank you for your payment. We've sent you an email with your receipt.
              </p>
              <button
                onClick={() => router.push('/content-creation')}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 flex items-center justify-center mx-auto gap-2"
              >
                <span>Start Creation</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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