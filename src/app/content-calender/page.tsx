'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns'
import { Editor } from '@tinymce/tinymce-react'
import MainLayout from '../../components/MainLayout'
import DatePicker from 'react-datepicker'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-datepicker/dist/react-datepicker.css'

const locales = {
  'en-US': require('date-fns/locale/en-US')
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  content?: string
  allDay?: boolean
  platform?: 'instagram' | 'facebook' | 'x'
  promotionalContent?: string
  backgroundColor?: string
}

// Custom event component for calendar
const EventComponent = ({ event }: { event: Event }) => {
  const maxLen = 30
  const plainTitle = event.title || ''
  const display = plainTitle.length > maxLen ? plainTitle.slice(0, maxLen - 1) + '…' : plainTitle
  
  const platformIcon = event.platform === 'instagram' ? '📸' :
                      event.platform === 'facebook' ? '👥' :
                      event.platform === 'x' ? '🐦' : ''

  return (
    <div 
      className="group relative flex items-center gap-1 p-1 rounded hover:bg-gray-100"
    >
      <span className="flex-shrink-0">{platformIcon}</span>
      <span className="truncate">{display}</span>
      
      {/* Tooltip */}
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-1">{plainTitle}</div>
          <div className="text-gray-600 whitespace-pre-wrap text-xs">
            {event.promotionalContent}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContentCalenderPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [view] = useState<View>('month')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), addMonths(new Date(), 1)])
  const [startDate, endDate] = dateRange

  // Load persisted events on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('contentCalenderEvents')
      if (raw) {
        const parsed = JSON.parse(raw)
        const loaded = parsed.map((p: any) => {
          // Convert string dates to Date objects
          const start = new Date(p.start)
          const end = p.end ? new Date(p.end) : start
          
          return {
            id: p.id || new Date().getTime().toString(),
            title: p.title,
            content: p.content || '',
            promotionalContent: p.promotionalContent,
            platform: p.platform,
            start,
            end,
            allDay: p.allDay !== undefined ? p.allDay : true
          }
        })
        
        // Sort by start date descending
        loaded.sort((a: Event, b: Event) => b.start.getTime() - a.start.getTime())
        setEvents(loaded)
      }
    } catch (err) {
      console.error('Failed to load persisted events', err)
    }
  }, [])

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({
      id: new Date().getTime().toString(),
      title: 'New Event',
      start,
      end,
      content: '',
      promotionalContent: '',
      platform: 'instagram',
      allDay: true
    })
    setIsModalOpen(true)
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleSaveEvent = () => {
    if (!selectedEvent) return
    
    const eventIndex = events.findIndex(e => e.id === selectedEvent.id)
    let newEvents: Event[]
    
    // Ensure all required fields are present
    const eventToSave = {
      ...selectedEvent,
      id: selectedEvent.id || new Date().getTime().toString(),
      title: selectedEvent.title || '',
      content: selectedEvent.content || '',
      promotionalContent: selectedEvent.promotionalContent || '',
      platform: selectedEvent.platform || 'instagram',
      start: selectedEvent.start,
      end: selectedEvent.end,
      allDay: selectedEvent.allDay !== undefined ? selectedEvent.allDay : true
    }
    
    if (eventIndex > -1) {
      newEvents = [...events]
      newEvents[eventIndex] = eventToSave
    } else {
      newEvents = [eventToSave, ...events]
    }
    
    // Sort by start date descending
    newEvents.sort((a, b) => b.start.getTime() - a.start.getTime())
    setEvents(newEvents)
    
    // Persist to localStorage
    try {
      const toSave = newEvents.map(e => ({
        ...e,
        start: e.start.toISOString(),
        end: e.end.toISOString()
      }))
      localStorage.setItem('contentCalenderEvents', JSON.stringify(toSave))
    } catch (err) {
      console.error('Failed to persist events', err)
    }
    
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  return (
    <MainLayout>
      <div className="p-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
              <button
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                onClick={() => {
                  setSelectedEvent({
                    id: new Date().getTime().toString(),
                    title: 'New Event',
                    start: new Date(),
                    end: new Date(),
                    content: '',
                    promotionalContent: '',
                    platform: 'instagram',
                    allDay: true
                  })
                  setIsModalOpen(true)
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Event
              </button>
            </div>
            
            <div className="h-[700px]">
              <Calendar
                localizer={localizer}
                events={events.filter(event => {
                  if (!startDate || !endDate) return true;
                  return event.start >= startDate && event.end <= endDate;
                })}
                startAccessor="start"
                endAccessor="end"
                defaultView={view}
                views={['month']}
                min={startDate || undefined}
                max={endDate || undefined}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                components={{
                  toolbar: props => (
                    <div className="rbc-toolbar">
                      <span className="rbc-btn-group">
                        <button type="button" onClick={() => props.onNavigate('PREV')}>Back</button>
                        <button type="button" onClick={() => props.onNavigate('TODAY')}>Today</button>
                        <button type="button" onClick={() => props.onNavigate('NEXT')}>Next</button>
                      </span>
                      <span className="rbc-toolbar-label">{props.label}</span>
                      <span className="rbc-btn-group">
                        <DatePicker
                          selectsRange={true}
                          startDate={startDate}
                          endDate={endDate}
                          onChange={(update) => {
                            setDateRange(update);
                          }}
                          className="date-range-picker"
                          placeholderText="Select date range"
                        />
                      </span>
                    </div>
                  ),
                  event: EventComponent
                }}
                className="calendar-container"
              />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Event</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={format(selectedEvent.start, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setSelectedEvent({...selectedEvent, start: new Date(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={format(selectedEvent.end, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setSelectedEvent({...selectedEvent, end: new Date(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={selectedEvent.platform || 'instagram'}
                  onChange={(e) => setSelectedEvent({...selectedEvent, platform: e.target.value as 'instagram' | 'facebook' | 'x'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="x">X</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promotional Content
                </label>
                <div className="mt-1">
                  <Editor
                    value={selectedEvent.promotionalContent || ''}
                    onEditorChange={(content) => setSelectedEvent({ ...selectedEvent, promotionalContent: content })}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: ['link', 'image', 'lists'],
                      toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promotional Copy
                </label>
                <textarea
                  value={selectedEvent.promotionalContent || ''}
                  onChange={e => setSelectedEvent({...selectedEvent, promotionalContent: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                  onClick={handleSaveEvent}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container :global(.rbc-toolbar) {
          padding: 0.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .calendar-container :global(.rbc-toolbar-label) {
          font-weight: 600;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .calendar-container :global(.date-range-picker) {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          min-width: 300px;
          background: white;
          color: #1f2937;
        }

        .calendar-container :global(.rbc-btn-group button) {
          padding: 0.5rem 1rem;
          background: white;
          color: #6b7280;
          border-color: #e5e7eb;
        }

        .calendar-container :global(.rbc-btn-group button:hover) {
          background: #f9fafb;
        }

        .calendar-container :global(.rbc-btn-group button.rbc-active) {
          background: #f97316;
          color: white;
          border-color: #f97316;
        }

        .calendar-container :global(.rbc-btn-group button.rbc-active:hover) {
          background: #ea580c;
        }

        .calendar-container :global(.rbc-month-view) {
          border-radius: 0.5rem;
          border-color: #e5e7eb;
        }

        .calendar-container :global(.rbc-header) {
          padding: 0.75rem;
          font-weight: 600;
          color: #4b5563;
          border-color: #e5e7eb;
        }

        .calendar-container :global(.rbc-day-bg.rbc-today) {
          background: #fff7ed;
        }

        .calendar-container :global(.rbc-date-cell) {
          padding: 0.25rem;
          color: #1f2937;
        }

        .calendar-container :global(.rbc-date-cell.rbc-now) {
          color: #f97316;
          font-weight: 600;
        }

        .calendar-container :global(.rbc-event) {
          background: #f97316;
          border-radius: 0.25rem;
        }

        .calendar-container :global(.rbc-event:hover) {
          background: #ea580c;
        }

        :global(.rbc-event), :global(.rbc-day-slot .rbc-event) {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      `}</style>
    </MainLayout>
  )
}