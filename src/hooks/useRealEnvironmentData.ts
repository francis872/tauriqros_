import { useState, useEffect } from 'react'

// ── Browser type extensions ────────────────────────────────────────────────────
interface BatteryManager extends EventTarget {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>
    connection?: {
      type?: string
      effectiveType?: string
    }
  }
}

// ── Public types ───────────────────────────────────────────────────────────────
export interface RealBattery {
  level: number      // 0–100
  charging: boolean
}

export interface RealLocation {
  city: string
  country: string
}

export interface RealWeather {
  temperatureC: number
  condition: 'clear' | 'cloudy' | 'rain' | 'storm'
  description: string
}

export interface RealNetwork {
  online: boolean
  type: 'wifi' | 'ethernet' | 'cellular' | 'unknown'
}

export interface RealEnvironmentData {
  battery: RealBattery | null
  location: RealLocation | null
  weather: RealWeather | null
  network: RealNetwork
  locationLoading: boolean
}

// ── WMO weather code → condition ──────────────────────────────────────────────
function mapWmoCode(code: number): { condition: RealWeather['condition']; description: string } {
  if (code === 0) return { condition: 'clear', description: 'clear sky' }
  if (code <= 3) return { condition: 'cloudy', description: 'partly cloudy' }
  if (code <= 48) return { condition: 'cloudy', description: 'foggy' }
  if (code <= 67) return { condition: 'rain', description: 'drizzle / rain' }
  if (code <= 77) return { condition: 'cloudy', description: 'snow' }
  if (code <= 82) return { condition: 'rain', description: 'rain showers' }
  if (code <= 99) return { condition: 'storm', description: 'thunderstorm' }
  return { condition: 'cloudy', description: 'overcast' }
}

function resolveNetworkType(): RealNetwork['type'] {
  const conn = navigator.connection
  if (!conn) return 'unknown'
  const raw = conn.type ?? conn.effectiveType ?? ''
  if (raw === 'wifi') return 'wifi'
  if (raw === 'ethernet') return 'ethernet'
  if (raw === 'cellular' || raw === '4g' || raw === '3g' || raw === '2g') return 'cellular'
  return 'unknown'
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useRealEnvironmentData(): RealEnvironmentData {
  const [battery, setBattery] = useState<RealBattery | null>(null)
  const [location, setLocation] = useState<RealLocation | null>(null)
  const [weather, setWeather] = useState<RealWeather | null>(null)
  const [networkType] = useState<RealNetwork['type']>(() => resolveNetworkType())
  const [locationLoading, setLocationLoading] = useState(true)

  // ── Battery ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.getBattery) {
      setBattery(null)
      return
    }

    let bat: BatteryManager | null = null

    const update = () => {
      if (!bat) return
      setBattery({ level: Math.round(bat.level * 100), charging: bat.charging })
    }

    navigator.getBattery().then((b) => {
      bat = b
      update()
      b.addEventListener('levelchange', update)
      b.addEventListener('chargingchange', update)
    }).catch(() => { setBattery(null) })

    return () => {
      if (bat) {
        bat.removeEventListener('levelchange', update)
        bat.removeEventListener('chargingchange', update)
      }
    }
  }, [])

  // ── Geolocation → city + weather ─────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false)
      return
    }

    let cancelled = false

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        if (cancelled) return

        // Reverse geocode via Nominatim (no API key required)
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'Accept-Language': 'en-US,en' } },
          )
          if (!cancelled) {
            const geo = await geoRes.json() as {
              address?: {
                city?: string; town?: string; village?: string
                county?: string; country_code?: string
              }
            }
            const a = geo.address ?? {}
            const city = a.city ?? a.town ?? a.village ?? a.county ?? 'Unknown'
            const country = (a.country_code ?? '').toUpperCase()
            setLocation({ city, country })
          }
        } catch { /* keep null */ }

        // Real weather via Open-Meteo (free, no API key)
        try {
          const wxRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
          )
          if (!cancelled) {
            const wx = await wxRes.json() as {
              current?: { temperature_2m?: number; weather_code?: number }
            }
            const temp = Math.round(wx.current?.temperature_2m ?? 0)
            const { condition, description } = mapWmoCode(wx.current?.weather_code ?? 0)
            setWeather({ temperatureC: temp, condition, description })
          }
        } catch { /* keep null */ }

        if (!cancelled) setLocationLoading(false)
      },
      () => {
        // Permission denied or timeout — stop loading
        if (!cancelled) setLocationLoading(false)
      },
      { timeout: 10_000, maximumAge: 300_000 },
    )

    return () => { cancelled = true }
  }, [])

  return {
    battery,
    location,
    weather,
    network: { online: navigator.onLine, type: networkType },
    locationLoading,
  }
}
