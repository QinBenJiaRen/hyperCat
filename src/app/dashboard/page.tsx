'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailModal from '../../components/EmailModal'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { useTranslation } from 'react-i18next'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en': require('date-fns/locale/en-US'),
  'zh': require('date-fns/locale/zh-CN'),
  'de': require('date-fns/locale/de'),
  'fr': require('date-fns/locale/fr'),
  'ja': require('date-fns/locale/ja'),
  'ko': require('date-fns/locale/ko'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [keyword, setKeyword] = useState('')
  const [titles, setTitles] = useState([])
  const [selectedTitle, setSelectedTitle] = useState('')
  const [generatedContent, setGeneratedContent] = useState({ instagram: '', facebook: '', twitter: '' })
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const { t, i18n } = useTranslation()
  
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value)
  }

  const handleEmailSubmit = async (email: string) => {
    // Handle email submission logic here
    console.log('Email submitted:', email)
    setIsEmailModalOpen(false)
  }

  const handleGenerateContent = async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: keyword })
      })
      
      const data = await response.json()
      setTitles(data.content.split('\n').slice(0, 5))
    } catch (error) {
      console.error('Error generating titles:', error)
    }
  }

  const handleTitleSelect = async (title: string) => {
    setSelectedTitle(title)
    try {
      const platforms = ['Instagram', 'Facebook', 'X']
      const contents = await Promise.all(
        platforms.map(platform =>
          fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Generate a ${platform} post for: ${title}`
            })
          }).then(res => res.json())
        )
      )
      
      setGeneratedContent({
        instagram: contents[0].content,
        facebook: contents[1].content,
        twitter: contents[2].content
      })
    } catch (error) {
      console.error('Error generating platform content:', error)
    }
  }

  return (
    <div className="flex h-screen">
      <EmailModal isOpen={isEmailModalOpen} onSubmit={handleEmailSubmit} />
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <nav className="space-y-2">
          <a href="/content-creation" className="block py-2 px-4 hover:bg-gray-700 rounded">Content Creation</a>
          <a href="/content-calendar" className="block py-2 px-4 hover:bg-gray-700 rounded">Content Calendar</a>
          <a href="/publishing" className="block py-2 px-4 hover:bg-gray-700 rounded">Publishing</a>
          <a href="/settings" className="block py-2 px-4 hover:bg-gray-700 rounded">Settings</a>
        </nav>
        
        <select
          onChange={handleLanguageChange}
          className="mt-4 w-full bg-gray-700 text-white p-2 rounded"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="col-span-2 mb-8">
            <Calendar
              localizer={localizer}
              events={[]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
            />
          </div>

          {/* Product Information */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Product Information</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter keywords..."
              />
              <button
                onClick={handleGenerateContent}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Generate Content
              </button>
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Content Preview</h2>
            {titles.length > 0 && (
              <div className="space-y-4">
                <div className="border p-4 rounded">
                  <h3 className="font-bold mb-2">Generated Titles</h3>
                  {titles.map((title, index) => (
                    <div
                      key={index}
                      onClick={() => handleTitleSelect(title)}
                      className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                    >
                      {title}
                    </div>
                  ))}
                </div>

                {selectedTitle && (
                  <div className="border p-4 rounded">
                    <h3 className="font-bold mb-2">Platform Content</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Instagram</h4>
                        <p>{generatedContent.instagram}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Facebook</h4>
                        <p>{generatedContent.facebook}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">X (Twitter)</h4>
                        <p>{generatedContent.twitter}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}