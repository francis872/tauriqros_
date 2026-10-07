import { useMemo, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DesktopSidebar, { type SidebarItem } from './components/DesktopSidebar'
import TopSystemBar from './components/TopSystemBar'
import DesktopBackdrop from './components/DesktopBackdrop'
import WindowManager from '../windows/WindowManager'
import { useDesktopStore } from '../store/desktopStore'
import { APP_REGISTRY } from '../apps/registry'
import NaturalLanguageLauncher from '../ai/NaturalLanguageLauncher'
import { DEFAULT_SESSION_STATE } from '../session/sessionModels'
import { LINUX_INTEGRATION_CAPABILITIES } from '../system/linuxIntegrationPlan'
import { useLauncherShortcuts } from '../launcher/launcherShortcuts'
import { type WorkspaceId } from '../workspace/workspaceModels'
import { getWorkspaceDefinition } from '../workspace/workspaceOrchestrator'
import { desktopEventBus } from '../services/desktopEventBus'
import { createDesktopOrchestrator } from '../services/desktopOrchestrator'
import Dock from '../components/Dock'
import PresenceLayer from '../presence/PresenceLayer'
import type { PresenceInsight } from '../intelligence/workspaceIntelligence'
import type { UserIdentityProfile } from '../profiles/profileModels'
import { useNotificationRuntime } from '../notifications/useNotificationRuntime'
import NotificationOverlay from '../notifications/NotificationOverlay'
import { createRuntimeEngineSnapshot } from '../runtime/runtimeEngine'
import type { TauriqSessionRuntimeSnapshot } from '../session/tauriqSessionManager'
import { recommendLayoutForWorkspace } from '../windows/layoutIntelligence'

interface DesktopEnvironmentProps {
  profile: UserIdentityProfile
  presence: PresenceInsight[]
  presenceOpen: boolean
  runtimeSnapshot: TauriqSessionRuntimeSnapshot | null
  onDismissPresence: () => void
  onLockRequest: () => void
}

const QUICK_APP_FOR_NAV: Record<Exclude<SidebarItem, 'home'>, keyof typeof APP_REGISTRY> = {
  ai: 'ai',
  files: 'files',
  terminal: 'terminal',
  settings: 'settings',
}

function HomeOverview({
  runtimeSnapshot,
  layoutPreset,
}: {
  runtimeSnapshot: TauriqSessionRuntimeSnapshot | null
  layoutPreset: string
}) {
  const plannedCapabilities = LINUX_INTEGRATION_CAPABILITIES.filter(
    (capability) => capability.status === 'planned',
  ).length
  const daemonCount = runtimeSnapshot?.daemons.length ?? 0
  const continuityMessage = runtimeSnapshot?.aiInsight.startupNarrative ?? 'Runtime continuity channel warming up.'
  const runtimeStatus = runtimeSnapshot?.core.runtime.status ?? 'guarded'
  const powerProfile = runtimeSnapshot?.core.powerProfile ?? 'balanced'
  const peers = runtimeSnapshot?.core.ecosystem.peersDiscovered ?? 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="pointer-events-auto absolute bottom-10 left-[118px] z-10 max-w-[580px] rounded-2xl border border-cyan-200/15 bg-[#0b0f17]/70 p-6 backdrop-blur-2xl"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300/90">TAURIQ Desktop Runtime</p>
      <h2 className="mt-2 text-2xl font-semibold text-cyan-50">AI-native Linux session shell</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        Fullscreen shell runtime with reusable windows, cinematic transitions, modular apps, and Linux integration scaffolding.
      </p>
      <p className="mt-2 text-xs text-cyan-200/80">{continuityMessage}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
        Runtime {runtimeStatus} · Power {powerProfile} · Peers {peers} · Layout {layoutPreset}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Session</p>
          <p className="mt-1 text-sm text-cyan-100">Wayland</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">App Windows</p>
          <p className="mt-1 text-sm text-cyan-100">{Object.keys(APP_REGISTRY).length} Modules</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Integration</p>
          <p className="mt-1 text-sm text-cyan-100">{plannedCapabilities} Planned · {daemonCount} Daemons</p>
        </div>
      </div>
    </motion.section>
  )
}

export default function DesktopEnvironment({
  profile,
  presence,
  presenceOpen,
  runtimeSnapshot,
  onDismissPresence,
  onLockRequest,
}: DesktopEnvironmentProps) {
  const {
    activeSidebarItem,
    activeWorkspaceId,
    notificationsOpen,
    launcherOpen,
    windows,
    setActiveSidebarItem,
    setLauncherOpen,
    toggleNotifications,
    openApp,
    switchWorkspace,
    setAiCommandCenterOpen,
    layoutPreset,
    setLayoutPreset,
  } = useDesktopStore()

  const { notifications, unreadCount, notify, markAllRead } = useNotificationRuntime()
  const continuityAnnouncementRef = useRef(false)
  const runtimeAnnouncementWorkspaceRef = useRef<string | null>(null)
  const phase7AnnouncementRef = useRef(false)
  const predictivePromptAnnouncementRef = useRef(false)

  useLauncherShortcuts({
    onOpenLauncher: () => setLauncherOpen(true),
    onCloseLauncher: () => setLauncherOpen(false),
    onOpenAsciiSearch: () => {
      const app = APP_REGISTRY['ascii-search']
      if (app) {
        openApp(app.id, app.label, app.defaultWidth, app.defaultHeight)
      }
    },
  })

  const workspaceDefinition = getWorkspaceDefinition(activeWorkspaceId)

  const activeWindowsCount = useMemo(
    () => windows.filter((windowItem) => windowItem.workspaceId === activeWorkspaceId && !windowItem.minimized).length,
    [activeWorkspaceId, windows],
  )

  const orchestrator = useMemo(
    () => createDesktopOrchestrator({
      openApp: (appId) => {
        const app = APP_REGISTRY[appId]
        if (!app) {
          return
        }
        openApp(app.id, app.label, app.defaultWidth, app.defaultHeight)
      },
      switchWorkspace,
      openLauncher: () => setLauncherOpen(true),
      openAiCenter: () => {
        setAiCommandCenterOpen(true)
        const app = APP_REGISTRY.ai
        openApp(app.id, app.label, app.defaultWidth, app.defaultHeight)
      },
      notify,
      activeWorkspaceId,
    }),
    [openApp, setAiCommandCenterOpen, setLauncherOpen, switchWorkspace, notify, activeWorkspaceId],
  )

  useEffect(() => {
    setLayoutPreset(recommendLayoutForWorkspace(activeWorkspaceId))
  }, [activeWorkspaceId, setLayoutPreset])

  useEffect(() => {
    if (!runtimeSnapshot) {
      return
    }

    if (continuityAnnouncementRef.current) {
      return
    }

    continuityAnnouncementRef.current = true

    notify({
      title: 'Session Continuity',
      message: runtimeSnapshot.aiInsight.startupNarrative,
      tone: 'info',
      workspaceId: activeWorkspaceId,
    })
  }, [runtimeSnapshot, notify, activeWorkspaceId])

  useEffect(() => {
    if (!runtimeSnapshot || predictivePromptAnnouncementRef.current) {
      return
    }

    predictivePromptAnnouncementRef.current = true

    notify({
      title: 'Predictive Workspace',
      message: runtimeSnapshot.core.predictiveWorkspace.prompt,
      tone: 'info',
      workspaceId: activeWorkspaceId,
    })
  }, [runtimeSnapshot, notify, activeWorkspaceId])

  useEffect(() => {
    if (!runtimeSnapshot) {
      return
    }

    if (phase7AnnouncementRef.current) {
      return
    }

    phase7AnnouncementRef.current = true

    notify({
      title: 'Cognitive Runtime',
      message: runtimeSnapshot.core.agents.proactiveHint,
      tone: 'info',
      workspaceId: activeWorkspaceId,
    })

    if (runtimeSnapshot.core.healing.anomalies.length > 0) {
      notify({
        title: 'Self-Healing Runtime',
        message: runtimeSnapshot.core.healing.anomalies[0],
        tone: 'warning',
        workspaceId: activeWorkspaceId,
      })
    }
  }, [runtimeSnapshot, notify, activeWorkspaceId])

  useEffect(() => {
    if (runtimeAnnouncementWorkspaceRef.current === activeWorkspaceId) {
      return
    }

    const snapshot = createRuntimeEngineSnapshot()
    const degraded = snapshot.processes.filter((processItem) => processItem.status === 'degraded').length
    runtimeAnnouncementWorkspaceRef.current = activeWorkspaceId

    notify({
      title: 'Runtime Engine',
      message: degraded > 0
        ? `${degraded} runtime services degraded.`
        : 'Runtime engine synchronized with lifecycle manager.',
      tone: degraded > 0 ? 'warning' : 'success',
      workspaceId: activeWorkspaceId,
    })
  }, [activeWorkspaceId, notify])

  useEffect(() => {
    const offAppOpen = desktopEventBus.on('app:open', ({ appId }) => {
      const app = APP_REGISTRY[appId]
      if (!app) {
        return
      }
      openApp(app.id, app.label, app.defaultWidth, app.defaultHeight)
    })

    const offWorkspaceSwitch = desktopEventBus.on('workspace:switch', ({ workspaceId }) => {
      switchWorkspace(workspaceId as WorkspaceId)
    })

    const offWorkflowTrigger = desktopEventBus.on('workflow:trigger', ({ workflowId }) => {
      void orchestrator.runWorkflow(workflowId)
    })

    const offNotificationPush = desktopEventBus.on('notification:push', ({ title, message, tone }) => {
      notify({ title, message, tone, workspaceId: activeWorkspaceId })
    })

    const offSystemAction = desktopEventBus.on('system:action', ({ action }) => {
      void orchestrator.runSystemAction(
        action as
          | 'shutdown'
          | 'restart'
          | 'suspend'
          | 'lock'
          | 'logout'
          | 'audio'
          | 'brightness'
          | 'wifi'
          | 'bluetooth'
          | 'battery'
          | 'updates'
          | 'notifications',
      )
    })

    return () => {
      offAppOpen()
      offWorkspaceSwitch()
      offWorkflowTrigger()
      offNotificationPush()
      offSystemAction()
    }
  }, [openApp, orchestrator, switchWorkspace, notify, activeWorkspaceId])

  const handleSidebarSelect = (item: SidebarItem) => {
    setActiveSidebarItem(item)

    if (item !== 'home') {
      const appId = QUICK_APP_FOR_NAV[item]
      const app = APP_REGISTRY[appId]
      openApp(app.id, app.label, app.defaultWidth, app.defaultHeight)

      if (item === 'ai') {
        setAiCommandCenterOpen(true)
      }
    }
  }

  useEffect(() => {
    const openAppForRoute = (route: string) => {
      const app = Object.values(APP_REGISTRY).find((appEntry) => appEntry.route === route)
      if (app) {
        openApp(app.id, app.label, app.defaultWidth, app.defaultHeight)
      }
    }

    const currentRoute = window.location.pathname
    openAppForRoute(currentRoute)

    const onPopState = () => {
      openAppForRoute(window.location.pathname)
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [openApp])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 h-screen w-screen overflow-hidden"
    >
      <DesktopBackdrop />

      <div className="relative z-10 flex h-full w-full border border-cyan-200/10 bg-[#060910]/40 backdrop-blur-[1px]">
        <DesktopSidebar activeItem={activeSidebarItem} onSelect={handleSidebarSelect} />

        <section className="relative flex min-w-0 flex-1 flex-col">
          <TopSystemBar
            sessionState={DEFAULT_SESSION_STATE}
            activeWorkspaceId={activeWorkspaceId}
            profile={profile}
            unreadCount={unreadCount}
            onNotificationsClick={toggleNotifications}
            onLauncherOpen={() => setLauncherOpen(true)}
            onWorkspaceSwitch={switchWorkspace}
            onLockRequest={onLockRequest}
          />

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWorkspaceId}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-6 top-6 z-20 rounded-xl border border-cyan-200/15 bg-[#0a1018]/70 px-3.5 py-2.5 backdrop-blur-2xl"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">Workspace</p>
                <p className="mt-1 text-sm text-cyan-50">{workspaceDefinition.label}</p>
                <p className="mt-1 font-mono text-[10px] text-slate-400">{activeWindowsCount} active windows</p>
              </motion.div>
            </AnimatePresence>

            {activeSidebarItem === 'home' && <HomeOverview runtimeSnapshot={runtimeSnapshot} layoutPreset={layoutPreset} />}
            <WindowManager />
            <PresenceLayer open={presenceOpen} insights={presence} onDismiss={onDismissPresence} />

            {notificationsOpen && (
              <NotificationOverlay
                open={notificationsOpen}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAllRead={markAllRead}
                runtimeSnapshot={runtimeSnapshot}
              />
            )}
          </div>

          <Dock
            runtimeSnapshot={runtimeSnapshot}
            unreadCount={unreadCount}
            onOpenNotifications={toggleNotifications}
            onOpenLauncher={() => setLauncherOpen(true)}
          />
        </section>
      </div>

      <NaturalLanguageLauncher
        open={launcherOpen}
        onClose={() => setLauncherOpen(false)}
        runtimeSnapshot={runtimeSnapshot}
        unreadCount={unreadCount}
        onRunAction={(actionId) => {
          const app = APP_REGISTRY[actionId as keyof typeof APP_REGISTRY]
          if (!app) {
            return
          }

          openApp(app.id, app.label, app.defaultWidth, app.defaultHeight)
        }}
        onSwitchWorkspace={switchWorkspace}
        onTriggerWorkflow={(workflowId) => {
          void orchestrator.runWorkflow(workflowId)
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_28%_at_50%_100%,rgba(34,211,238,0.15),transparent_72%)]" />
    </motion.div>
  )
}
