import { useState, useEffect } from 'react'

interface SystemStats {
  cpu: number
  memory: number
  network: 'online' | 'offline'
  aiActivity: number
}

export function useSystemStats(): SystemStats {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    network: 'online',
    aiActivity: 0,
  })

  useEffect(() => {
    const update = () => {
      setStats({
        cpu: Math.floor(20 + Math.random() * 60),
        memory: Math.floor(40 + Math.random() * 30),
        network: navigator.onLine ? 'online' : 'offline',
        aiActivity: Math.floor(Math.random() * 100),
      })
    }
    update()
    const id = setInterval(update, 2000)
    return () => clearInterval(id)
  }, [])

  return stats
}
