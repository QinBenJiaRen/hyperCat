'use client'

import { useState, useEffect } from 'react'
import MainLayout from '../../components/MainLayout'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function ContentCreationPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()

  // 从 localStorage 初始化状态或使用默认值
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | 'x'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedPlatform') as 'instagram' | 'facebook' | 'x' || 'instagram'
    }
    return 'instagram'
  })

  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedModel') || 'gpt4'  // 默认使用 gpt4
    }
    return 'gpt4'  // 服务端渲染时的默认值
  })

  const [productInfo, setProductInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('productInfo') || ''
    }
    return ''
  })

  const [keywords, setKeywords] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedKeywords = localStorage.getItem('keywords')
      return savedKeywords ? JSON.parse(savedKeywords) : []
    }
    return []
  })

  const [isSensitiveFilterEnabled, setIsSensitiveFilterEnabled] = useState(true)

  const [generatedContent, setGeneratedContent] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedContent = localStorage.getItem('generatedContent')
      return savedContent ? JSON.parse(savedContent) : { content: '', hasError: false }
    }
    return { content: '', hasError: false }
  })

  const [platformContent, setPlatformContent] = useState<{
    [key: string]: {
      [title: string]: string;
    };
  }>(() => {
    if (typeof window !== 'undefined') {
      const savedContent = localStorage.getItem('platformContent')
      return savedContent ? JSON.parse(savedContent) : { instagram: {}, facebook: {}, x: {} }
    }
    return { instagram: {}, facebook: {}, x: {} }
  })

  const [selectedTitle, setSelectedTitle] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedTitle') || ''
    }
    return ''
  })

  const [isGeneratingPlatformContent, setIsGeneratingPlatformContent] = useState(false)
  
  // 添加生成内容的加载状态
  const [isGenerating, setIsGenerating] = useState(false)

  // 使用 useEffect 来保存状态到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('productInfo', productInfo)
      localStorage.setItem('keywords', JSON.stringify(keywords))
      localStorage.setItem('generatedContent', JSON.stringify(generatedContent))
      localStorage.setItem('platformContent', JSON.stringify(platformContent))
      localStorage.setItem('selectedTitle', selectedTitle)
      localStorage.setItem('selectedPlatform', selectedPlatform)
      localStorage.setItem('selectedModel', selectedModel)
    }
  }, [productInfo, keywords, generatedContent, platformContent, selectedTitle, selectedPlatform, selectedModel])

  // 添加刷新页面时清除数据的处理
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 清除所有存储的数据
      localStorage.removeItem('productInfo')
      localStorage.removeItem('keywords')
      localStorage.removeItem('generatedContent')
      localStorage.removeItem('platformContent')
      localStorage.removeItem('selectedTitle')
      localStorage.removeItem('selectedPlatform')
      localStorage.removeItem('selectedModel')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
  
  // 添加发布日期状态
  const [publishDate, setPublishDate] = useState<Date>(new Date())

  // 保存状态到 localStorage
  const saveToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPlatform', selectedPlatform)
      localStorage.setItem('selectedModel', selectedModel)
      // Only save platform and model selection
      // Content-related states are intentionally not persisted
    }
  }

  // 在组件卸载时保存状态
  useEffect(() => {
    return () => {
      saveToLocalStorage()
    }
  }, [selectedPlatform, selectedModel, productInfo, keywords, generatedContent, platformContent, selectedTitle])

  // 预设的热门关键词
  const hotKeywords = [
    'Summer Sale',
    'New Arrival',
    'Limited Offer',
    'Trending Now',
    'Flash Deal',
    'Exclusive',
    'Hot Item',
    'Best Seller'
  ]

  const handleKeywordClick = (keyword: string) => {
    setKeywords(prev => 
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    )
  }

  const generatePlatformContent = async (title: string, platform: 'instagram' | 'facebook' | 'x') => {
    try {
      // 检查是否已经生成过该标题对应平台的内容
      if (platformContent[platform][title]) {
        return platformContent[platform][title];
      }

      // 获取当前语言
      const currentLanguage = i18n.language;
      
      // 根据语言设置提示语和要求
      const requirementsMap = {
        zh: {
          intro: `请用中文根据以下标题为${platform}平台创建一个推广文案。要求：`,
          requirements: [
            "第一行展示原标题",
            "从第二行开始是推广文案",
            "文案长度限制在50-100字之间",
            "使用适当的emoji表情符号增加吸引力",
            "文案要简洁有力，富有吸引力",
            "确保用换行符分隔标题和内容"
          ],
          title: "标题：",
          productInfo: "产品信息："
        },
        en: {
          intro: `Create promotional content in English for ${platform} platform based on the following title. Requirements:`,
          requirements: [
            "Show original title in the first line",
            "Promotional content starts from the second line",
            "Content length should be between 50-100 characters",
            "Use appropriate emoji to enhance appeal",
            "Content should be concise and engaging",
            "Ensure title and content are separated by line breaks"
          ],
          title: "Title:",
          productInfo: "Product information:"
        },
        de: {
          intro: `Erstellen Sie Werbeinhalt auf Deutsch für die ${platform}-Plattform basierend auf folgendem Titel. Anforderungen:`,
          requirements: [
            "Originaltitel in der ersten Zeile anzeigen",
            "Werbeinhalt beginnt ab der zweiten Zeile",
            "Inhaltslänge sollte zwischen 50-100 Zeichen liegen",
            "Verwenden Sie passende Emojis zur Verbesserung der Attraktivität",
            "Inhalt sollte prägnant und ansprechend sein",
            "Stellen Sie sicher, dass Titel und Inhalt durch Zeilenumbrüche getrennt sind"
          ],
          title: "Titel:",
          productInfo: "Produktinformationen:"
        }
      };

      const langConfig = requirementsMap[currentLanguage as keyof typeof requirementsMap] || requirementsMap.en;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,  // 让后端处理 auto 的情况
          keywords,
          platform,
          language: currentLanguage,
          prompt: `${langConfig.intro}
${langConfig.requirements.map((req, index) => `${index + 1}. ${req}`).join('\n')}

${langConfig.title}${title}
${langConfig.productInfo}${productInfo}`
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.content
    } catch (error) {
      console.error(`Error generating ${platform} content:`, error)
      throw error
    }
  }

  const handleTitleClick = async (title: string) => {
    if (title === selectedTitle) {
      // 如果点击的是相同的标题，不需要重新生成
      return;
    }

    setSelectedTitle(title);
    setIsGeneratingPlatformContent(true);
    
    try {
      const content = await generatePlatformContent(title, selectedPlatform);
      
      // 更新缓存
      setPlatformContent(prev => ({
        ...prev,
        [selectedPlatform]: {
          ...prev[selectedPlatform],
          [title]: content
        }
      }));
    } catch (error) {
      console.error('Error generating platform content:', error);
    } finally {
      setIsGeneratingPlatformContent(false);
    }
  }

  const handleGenerateContent = async () => {
    if (!productInfo) {
      alert('Please enter product information')
      return
    }

    // 设置加载状态
    setIsGenerating(true)

    // 清空所有之前生成的内容
    setGeneratedContent({
      content: '',
      hasError: false
    })
    setPlatformContent({
      instagram: {},
      facebook: {},
      x: {}
    })
    setSelectedTitle('')
    
    try {
      setGeneratedContent({
        content: 'Generating content...',
        hasError: false
      })

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,  // 让后端处理 auto 的情况
          keywords: keywords,
          prompt: productInfo,
          sensitiveFilter: isSensitiveFilterEnabled
        })
      })
      
      const data = await response.json()
      setGeneratedContent({
        content: data.content,
        hasError: false
      })
    } catch (error) {
      console.error('Error generating content:', error)
      setGeneratedContent({
        content: '',
        hasError: true
      })
    } finally {
      // 无论成功还是失败，都需要重置加载状态
      setIsGenerating(false)
    }
  }

  return (
    <MainLayout>
      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Content Creation</h1>
            <div className="flex items-center">
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="text-gray-600 text-sm">Sensitive Word Filter</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isSensitiveFilterEnabled}
                    onChange={(e) => setIsSensitiveFilterEnabled(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Left Column: Product Information & Keywords */}
            <div className="space-y-4">
              {/* Model Selection */}
              <div className="mb-4">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="auto">{t('contentCreation.models.auto')}</option>
                  <option value="deepseek">{t('contentCreation.models.deepseek')}</option>
                  <option value="gpt41">{t('contentCreation.models.gpt41')}</option>
                  <option value="gpt4">{t('contentCreation.models.gpt4')}</option>
                  <option value="o3mini">{t('contentCreation.models.o3mini')}</option>
                </select>
              </div>

              {/* Product Information */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
                <textarea
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 h-48"
                  placeholder="Tell us about your product..."
                />
              </div>

              {/* Hot Keywords */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hot Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {hotKeywords.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => handleKeywordClick(keyword)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        keywords.includes(keyword)
                          ? 'bg-orange-500 text-white'
                          : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                      }`}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600'
                } text-white`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Content'
                )}
              </button>
            </div>

            {/* Right Column: Content Preview */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Content Preview</h2>
                {!generatedContent.hasError && generatedContent.content && (
                  <div className="flex items-center text-green-500 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    No sensitive words found
                  </div>
                )}
              </div>

              <div className="mb-4">
                {generatedContent.content && !generatedContent.hasError ? (
                  <div className="space-y-2">
                    {generatedContent.content.split('\n').map((line, index) => {
                      if (!line.trim()) return null;
                      const titleText = line.replace(/^\d+\.\s*/, '').trim();
                      const fullTitle = line.trim();
                      return (
                        <div key={index} className="group relative flex items-center">
                          <div 
                            className="flex-1 bg-gray-50 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100"
                            onClick={() => handleTitleClick(fullTitle)}
                          >
                            {line}
                          </div>
                          <style jsx>{`
                            @keyframes checkmark {
                              0% {
                                stroke-dashoffset: 24;
                              }
                              100% {
                                stroke-dashoffset: 0;
                              }
                            }
                            
                            .success {
                              background-color: #22c55e !important;
                              pointer-events: none;
                            }
                            
                            .success svg {
                              animation: checkmark 0.3s ease-in-out forwards;
                              stroke-dasharray: 24;
                              stroke-dashoffset: 24;
                            }
                          `}</style>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(titleText);
                            }}
                            className="ml-2 invisible group-hover:visible text-gray-500 hover:text-gray-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg ${generatedContent.hasError ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
                    {generatedContent.hasError ? 'Error generating content. Please try again.' : 'Generated content will appear here.'}
                  </div>
                )}
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedPlatform('instagram')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedPlatform === 'instagram'
                        ? 'bg-orange-50 text-orange-500'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Instagram
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('facebook')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedPlatform === 'facebook'
                        ? 'bg-orange-50 text-orange-500'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('x')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedPlatform === 'x'
                        ? 'bg-orange-50 text-orange-500'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    X
                  </button>
                </div>

                  {/* Platform Content Display */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  {isGeneratingPlatformContent ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : platformContent[selectedPlatform][selectedTitle] ? (
                    <div className="space-y-4">
                      <div className="font-bold text-gray-900 pb-2 border-b">
                        {selectedTitle}
                      </div>
                      <div className="prose max-w-none text-gray-700 leading-relaxed">
                        {platformContent[selectedPlatform][selectedTitle].split('\n').slice(1).join('\n')}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Publish date:</span>
                          <DatePicker
                            selected={publishDate}
                            onChange={(date: Date) => setPublishDate(date)}
                            className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            dateFormat="yyyy-MM-dd"
                            minDate={new Date()}
                          />
                        </div>
                          <style jsx>{`
                            @keyframes checkmark {
                              0% {
                                stroke-dashoffset: 24;
                              }
                              100% {
                                stroke-dashoffset: 0;
                              }
                            }
                            
                            .success {
                              background-color: #22c55e !important;
                              pointer-events: none;
                            }
                            
                            .success svg {
                              animation: checkmark 0.3s ease-in-out forwards;
                              stroke-dasharray: 24;
                              stroke-dashoffset: 24;
                            }
                          `}</style>
                          <button
                          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          onClick={async () => {
                            if (!selectedTitle || !platformContent[selectedPlatform][selectedTitle]) {
                              alert('No content to publish');
                              return;
                            }

                            try {
                              // 使用用户选择的发布日期
                              const selectedDate = new Date(publishDate);
                              // 设置为当天的早上9点
                              selectedDate.setHours(9, 0, 0, 0);

                              // 处理内容
                              const fullContent = platformContent[selectedPlatform][selectedTitle];
                              const lines = fullContent.split('\n');
                              const title = lines[0].replace(/^\d+\.\s*/, '').trim();
                              const promo = lines.slice(1).join('\n').trim();

                              // 设置社交媒体颜色
                              const colors: Record<string, string> = {
                                instagram: '#E1306C',
                                facebook: '#1877F2',
                                x: '#000000'
                              };

                              // 创建事件
                              const newEvent = {
                                id: `${Date.now()}`,
                                title,
                                start: selectedDate,
                                end: new Date(selectedDate.getTime() + 43200000), // +12小时
                                backgroundColor: colors[selectedPlatform],
                                platform: selectedPlatform,
                                allDay: false,
                                content: fullContent,
                                promotionalContent: promo
                              };

                              // 读取现有事件
                              const existing = JSON.parse(localStorage.getItem('contentCalenderEvents') || '[]');
                              
                              // 添加新事件到开头（保持降序）
                              localStorage.setItem('contentCalenderEvents', JSON.stringify([newEvent, ...existing]));

                              // 显示发布成功动画
                              const button = document.activeElement as HTMLButtonElement;
                              if (button) {
                                button.classList.add('success');
                                button.disabled = true;
                                const successIcon = (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                );
                                button.textContent = 'Published!';
                                
                                // 2秒后重置按钮并跳转
                                setTimeout(() => {
                                  router.push('/content-calender');
                                }, 2000);
                              }
                            } catch (error) {
                              console.error('Error publishing content:', error);
                              alert('Failed to publish content. Please try again.');
                            }
                          }}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Publishing
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      {t('contentCreation.platformContent.clickToGenerate', {
                        platform: selectedPlatform === 'instagram' ? 'Instagram' : selectedPlatform === 'facebook' ? 'Facebook' : 'X'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}