import { useState, useEffect } from 'react'

export function useSystemTime() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')
  const date = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return { time, hours, minutes, seconds, date, formatted: `${hours}:${minutes}` }
}
