'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import MainLayout from '../../components/MainLayout'
import { useTranslation } from 'react-i18next'

interface PublishRecord {
  id: string
  title: string
  content: string
  publishedAt: string // ISO string
  platform: 'instagram' | 'facebook' | 'x'
  promotionalContent?: string
}

export default function PublishingPage() {
  const { t } = useTranslation()
  const [publishRecords, setPublishRecords] = useState<PublishRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    // Load published records from localStorage
    try {
      const raw = localStorage.getItem('contentCalenderEvents')
      if (raw) {
        const events = JSON.parse(raw)
        // Convert events to publish records format
        const records: PublishRecord[] = events.map((event: any) => ({
          id: event.id,
          title: event.title,
          content: event.content || '',
          publishedAt: event.start,
          platform: event.platform,
          promotionalContent: event.promotionalContent
        }))
        // Sort by publishedAt descending
        records.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        setPublishRecords(records)
      }
    } catch (err) {
      console.error('Failed to load publish records:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Group records by date
  const groupedRecords = publishRecords.reduce((groups: Record<string, PublishRecord[]>, record) => {
    const date = format(new Date(record.publishedAt), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(record)
    return groups
  }, {})

  // Get sorted dates
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '📸'
      case 'facebook':
        return '👥'
      case 'x':
        return '🐦'
      default:
        return ''
    }
  }

  return (
    <MainLayout>
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('nav.publishing')}
          </h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : sortedDates.length > 0 ? (
            <div className="space-y-6">
              {sortedDates.map(date => (
                <div key={date} className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </h2>
                  
                  <div className="space-y-4">
                    {groupedRecords[date].map(record => (
                      <div 
                        key={record.id} 
                        className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-xl" role="img" aria-label={record.platform}>
                              {getPlatformIcon(record.platform)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-medium text-gray-900 truncate">
                                {record.title}
                              </h3>
                              <span className="text-sm text-gray-500">
                                {format(new Date(record.publishedAt), 'HH:mm')}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {record.promotionalContent || record.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No published content yet</h3>
              <p className="text-gray-500 mt-1">
                Content you publish will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}