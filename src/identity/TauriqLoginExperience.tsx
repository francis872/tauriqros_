import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CloudSun, Sparkles, Battery, BatteryCharging, Wifi, Signal, MapPin } from 'lucide-react'
import { useSystemTime } from '../hooks/useSystemTime'
import { useRealEnvironmentData } from '../hooks/useRealEnvironmentData'
import type { EnvironmentWeather, UserIdentityProfile } from '../profiles/profileModels'
import { getDynamicGreeting } from '../intelligence/workspaceIntelligence'
import type { TauriqSessionRuntimeSnapshot } from '../session/tauriqSessionManager'

interface TauriqLoginExperienceProps {
  profile: UserIdentityProfile
  weather: EnvironmentWeather
  activeProjects: number
  runtimeSnapshot: TauriqSessionRuntimeSnapshot | null
  onEnterSession: () => void
}

export default function TauriqLoginExperience({
  profile,
  weather,
  activeProjects,
  runtimeSnapshot,
  onEnterSession,
}: TauriqLoginExperienceProps) {
  const { formatted, date } = useSystemTime()
  const greeting = getDynamicGreeting(profile.displayName)
  const startupNarrative = runtimeSnapshot?.aiInsight.startupNarrative ?? 'TAURIQ runtime initializing service mesh.'
  const daemonCount = runtimeSnapshot?.daemons.length ?? 0
  const runtimeState = runtimeSnapshot?.core.runtime.status ?? 'guarded'
  const aiOnline = runtimeSnapshot?.core.intelligenceCenter.aiRuntimeOnline ?? false
  const meshPeers = runtimeSnapshot?.core.distributed.sync.peers ?? 0
  const activeAgents = runtimeSnapshot?.core.agents.health.activeAgents ?? 0

  // Real device data
  const { battery, location, weather: realWeather, network, locationLoading } = useRealEnvironmentData()

  // Resolved display values
  const displayWeather = realWeather ?? weather
  const displayCity = location ? `${location.city}${location.country ? ` · ${location.country}` : ''}` : (locationLoading ? 'Locating…' : profile.city)
  const weatherValue = locationLoading && !realWeather
    ? `${weather.temperatureC}°C ${weather.condition}`
    : `${displayWeather.temperatureC}°C · ${'description' in displayWeather ? (displayWeather as typeof realWeather)?.description ?? displayWeather.condition : displayWeather.condition}`

  // Network card
  const networkTypeLabel: Record<string, string> = {
    wifi: 'Wi-Fi', ethernet: 'Ethernet', cellular: 'Cellular', unknown: 'Network',
  }
  const networkLabel = networkTypeLabel[network.type] ?? 'Network'
  const networkValue = network.online ? `${networkLabel} · connected` : 'Offline'
  const NetworkIcon = network.type === 'cellular' ? Signal : Wifi

  // Battery card
  const batteryValue = battery
    ? `${battery.level}% · ${battery.charging ? 'charging' : 'on battery'}`
    : `${daemonCount} daemons`
  const BatteryIcon = battery?.charging ? BatteryCharging : Battery

  return (
    <motion.section
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-40 overflow-hidden bg-black"
    >
      <div className="absolute inset-0 bg-[radial-gradient(58%_56%_at_20%_8%,rgba(34,211,238,0.32),transparent_72%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(54%_52%_at_88%_88%,rgba(139,92,246,0.24),transparent_74%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:34px_34px] opacity-25" />

      <motion.div
        animate={{ opacity: [0.3, 0.68, 0.3] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 left-20 h-[340px] w-[340px] rounded-full bg-cyan-300/22 blur-[130px]"
      />

      <div className="relative z-10 flex h-full items-end justify-center px-6 pb-14 md:items-center md:justify-between md:px-14 md:pb-0">
        <div className="max-w-[580px]">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200/90">TAURIQ Session Identity</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
            {greeting}
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Your workspace is ready. You have {activeProjects} active projects today.
          </p>
          <p className="mt-2 text-sm text-cyan-200/80">{startupNarrative}</p>
          <p className="mt-1 text-xs text-slate-400">
            Runtime {runtimeState}. AI runtime {aiOnline ? 'online' : 'warming up'}.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Agent supervisor {activeAgents} active · Distributed mesh peers {meshPeers}.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatusCard
              icon={<CloudSun size={15} />}
              label={locationLoading && !location ? 'Weather' : `Weather · ${location?.city ?? '…'}`}
              value={weatherValue}
            />
            <StatusCard
              icon={<NetworkIcon size={15} />}
              label="Network"
              value={networkValue}
            />
            <StatusCard
              icon={<BatteryIcon size={15} />}
              label={battery ? 'Battery' : 'Daemons'}
              value={batteryValue}
            />
          </div>

          <button
            onClick={onEnterSession}
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-300/15 px-5 py-3 text-sm font-medium text-cyan-50 transition-all hover:bg-cyan-300/20"
            title="Enter TAURIQ session"
          >
            <Sparkles size={15} />
            Enter TAURIQ Session
          </button>
        </div>

        <div className="hidden rounded-3xl border border-cyan-200/15 bg-[#09101a]/65 px-7 py-8 backdrop-blur-2xl md:block">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">Local Time</p>
          <p className="mt-4 text-6xl font-semibold text-cyan-50">{formatted}</p>
          <p className="mt-2 font-mono text-sm text-cyan-300/85">{date}</p>
          <p className="mt-5 flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin size={12} className="text-cyan-400/70" />
            {displayCity} · {profile.role}
          </p>
        </div>
      </div>
    </motion.section>
  )
}

function StatusCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm text-cyan-100">{value}</p>
    </div>
  )
}
