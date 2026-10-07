import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
  date: number
  title: string
  color?: 'cyan' | 'blue' | 'green' | 'yellow' | 'red'
}

interface CalendarProps {
  events?: CalendarEvent[]
  onDateSelect?: (date: Date) => void
}

export default function Calendar({ events = [], onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const today = new Date()
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear()

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getEventsForDate = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const colorClasses = {
    cyan: 'bg-cyan-300 text-[#031018]',
    blue: 'bg-blue-300 text-[#031018]',
    green: 'bg-green-300 text-[#031018]',
    yellow: 'bg-yellow-300 text-[#031018]',
    red: 'bg-red-300 text-[#031018]',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm rounded-lg border border-cyan-300/30 bg-[#0a0f1a]/90 p-4 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-1 text-slate-400 hover:text-cyan-100 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-sm font-semibold text-cyan-100 text-center flex-1">
          {monthName}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1 text-slate-400 hover:text-cyan-100 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[9px] font-mono text-slate-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const isToday =
            isCurrentMonth &&
            day === today.getDate()
          const dayEvents = getEventsForDate(day)

          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                const selectedDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day
                )
                onDateSelect?.(selectedDate)
              }}
              className={`aspect-square flex flex-col items-center justify-center rounded-md text-xs font-mono transition-colors relative ${
                isToday
                  ? 'bg-cyan-300/30 border border-cyan-300/60 text-cyan-100 font-semibold'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-cyan-100'
              }`}
            >
              {day}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${colorClasses[event.color || 'cyan']}`}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Events for selected day */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-cyan-300/20">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
            Upcoming Events
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {events.slice(0, 5).map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[9px] text-slate-300 p-1.5 rounded border border-cyan-300/10 bg-cyan-300/5 truncate"
              >
                {event.title}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
