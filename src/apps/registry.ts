import type { ComponentType } from 'react'
import FilesApp from './FilesApp'
import TerminalApp from './TerminalApp'
import NotesApp from './NotesApp'
import AIApp from './AIApp'
import SettingsApp from './SettingsApp'
import MonitorApp from './MonitorApp'
import TimelineApp from './TimelineApp'
import AsciiSearchApp from './AsciiSearchApp'
import DareApp from './DareApp'
import BrowserApp from './BrowserApp'
import BalanceApp from './balance/BalanceApp'
import RelayApp from './relay/RelayApp'
import JumperApp from './JumperApp'
import MyLynkApp from './MyLynkApp'
import AcordApp from './acord/AcordApp'

export interface AppDefinition {
  id: string
  label: string
  icon: string
  component: ComponentType<{ windowId: string; initialPath?: string }>
  defaultWidth: number
  defaultHeight: number
  description: string
  category: 'core' | 'system' | 'ai'
  route: string
  initialPath?: string
}

export const APP_REGISTRY: Record<string, AppDefinition> = {
  files: {
    id: 'files',
    label: 'Files',
    icon: 'folder',
    component: FilesApp,
    defaultWidth: 780,
    defaultHeight: 520,
    description: 'TAURIQ File Manager',
    category: 'core',
    route: '/apps/files',
  },
  terminal: {
    id: 'terminal',
    label: 'Terminal',
    icon: 'terminal',
    component: TerminalApp,
    defaultWidth: 700,
    defaultHeight: 480,
    description: 'TAURIQ Terminal',
    category: 'core',
    route: '/apps/terminal',
  },
  notes: {
    id: 'notes',
    label: 'Notes',
    icon: 'notebook',
    component: NotesApp,
    defaultWidth: 560,
    defaultHeight: 440,
    description: 'TAURIQ Notes',
    category: 'core',
    route: '/apps/notes',
  },
  ai: {
    id: 'ai',
    label: 'AI',
    icon: 'zap',
    component: AIApp,
    defaultWidth: 640,
    defaultHeight: 560,
    description: 'TAURIQ AI Command Center',
    category: 'ai',
    route: '/apps/ai',
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    component: SettingsApp,
    defaultWidth: 680,
    defaultHeight: 500,
    description: 'TAURIQ Settings',
    category: 'system',
    route: '/apps/settings',
  },
  monitor: {
    id: 'monitor',
    label: 'Monitor',
    icon: 'activity',
    component: MonitorApp,
    defaultWidth: 720,
    defaultHeight: 480,
    description: 'TAURIQ System Monitor',
    category: 'system',
    route: '/apps/monitor',
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    icon: 'timeline',
    component: TimelineApp,
    defaultWidth: 760,
    defaultHeight: 520,
    description: 'TAURIQ Live Knowledge Timeline',
    category: 'system',
    route: '/apps/timeline',
  },
  'ascii-search': {
    id: 'ascii-search',
    label: 'ASCII Search',
    icon: 'search',
    component: AsciiSearchApp,
    defaultWidth: 720,
    defaultHeight: 520,
    description: 'TAURIQ ASCII Search Interface',
    category: 'system',
    route: '/apps/ascii-search',
  },
  dare: {
    id: 'dare',
    label: 'DARE / Balance',
    icon: 'folder',
    component: DareApp,
    defaultWidth: 900,
    defaultHeight: 560,
    description: 'Open the DARE Balance app inside TAURIQ',
    category: 'core',
    route: '/apps/dare',
  },
  browser: {
    id: 'browser',
    label: 'ASCCI-R',
    icon: 'globe',
    component: BrowserApp,
    defaultWidth: 700,
    defaultHeight: 500,
    description: 'Launch ASCCI-R Browser - Advanced System Communication & Control Intelligence',
    category: 'core',
    route: '/apps/browser',
  },
  balance: {
    id: 'balance',
    label: 'Balance',
    icon: 'layers',
    component: BalanceApp,
    defaultWidth: 1100,
    defaultHeight: 680,
    description: 'Balance — Workspace inteligente: Kanban, OKRs, Estrategia, Finanzas',
    category: 'core',
    route: '/apps/balance',
  },
  relay: {
    id: 'relay',
    label: 'Relay',
    icon: 'zap',
    component: RelayApp,
    defaultWidth: 1200,
    defaultHeight: 720,
    description: 'Relay — AI Workforce Operating System',
    category: 'ai',
    route: '/apps/relay',
  },
  jumper: {
    id: 'jumper',
    label: 'Jumper',
    icon: 'radio',
    component: JumperApp,
    defaultWidth: 860,
    defaultHeight: 580,
    description: 'Jumper — Next-gen wireless protocol (Bluetooth successor)',
    category: 'core',
    route: '/apps/jumper',
  },
  mylynk: {
    id: 'mylynk',
    label: 'MY-LYNK',
    icon: 'network',
    component: MyLynkApp,
    defaultWidth: 900,
    defaultHeight: 640,
    description: 'MY-LYNK — Infraestructura cognitiva para comunicación y toma de decisiones',
    category: 'ai',
    route: '/apps/mylynk',
  },
  acord: {
    id: 'acord',
    label: 'Acordd',
    icon: 'music',
    component: AcordApp,
    defaultWidth: 1100,
    defaultHeight: 680,
    description: 'Acordd — Plataforma de streaming musical con Liryq IA',
    category: 'core',
    route: '/apps/acord',
  },
}

export const DEFAULT_DOCK_APPS = ['relay', 'balance', 'acord', 'files', 'terminal', 'notes', 'ai', 'browser', 'settings', 'monitor', 'timeline', 'ascii-search', 'dare', 'jumper', 'mylynk']
export const DOCK_APPS = [...DEFAULT_DOCK_APPS]
