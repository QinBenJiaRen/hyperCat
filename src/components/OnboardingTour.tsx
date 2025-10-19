'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface OnboardingTourProps {
  onComplete: () => void
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [showFinalOptions, setShowFinalOptions] = useState(false)

  const steps = [
    {
      target: 'model-select',
      message: t('contentCreation.onboarding.step1'),
      position: 'bottom'
    },
    {
      target: 'product-info',
      message: t('contentCreation.onboarding.step2'),
      position: 'top'
    },
    {
      target: 'purpose-section',
      message: t('contentCreation.onboarding.step3'),
      position: 'top'
    },
    {
      target: 'keywords-section',
      message: t('contentCreation.onboarding.step4'),
      position: 'top'
    }
  ]

  useEffect(() => {
    // 高亮当前步骤的元素
    const targetId = steps[currentStep]?.target
    if (targetId) {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowFinalOptions(true)
    }
  }

  const handleDontShowAgain = () => {
    localStorage.setItem('onboardingCompleted', 'true')
    onComplete()
  }

  const handleContinue = () => {
    onComplete()
  }

  if (showFinalOptions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {t('contentCreation.onboarding.step4')}
            </h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDontShowAgain}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {t('contentCreation.onboarding.dontShowAgain')}
              </button>
              <button
                onClick={handleContinue}
                className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                {t('contentCreation.onboarding.continue')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  if (!currentStepData) return null

  return (
    <>
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={handleNext} />
      
      {/* 高亮区域 */}
      <style jsx global>{`
        #${currentStepData.target} {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          border-radius: 8px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(251, 146, 60, 0.8), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }
        }
      `}</style>

      {/* 提示框 */}
      <div className="fixed z-50" style={{
        left: '50%',
        top: currentStepData.position === 'bottom' ? '20%' : '60%',
        transform: 'translateX(-50%)'
      }}>
        <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md mx-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-500 font-bold text-lg">{currentStep + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentStepData.message}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  {currentStep < steps.length - 1 ? t('contentCreation.onboarding.continue') : t('contentCreation.onboarding.continue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
