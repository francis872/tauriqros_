/**
 * Session Flow Predictor — Phase 11
 * Predicts the likely sequence of apps and workspaces for an upcoming session
 * based on historical patterns and current semantic context.
 */

export interface SessionFlowStep {
  appId: string
  workspaceId: string
  estimatedDurationMs: number
  confidence: number
  reason: string
}

export interface SessionFlowPrediction {
  predictedSteps: SessionFlowStep[]
  totalDurationMs: number
  primaryWorkspace: string
  sessionType: 'deep-work' | 'research' | 'development' | 'ai-collaboration' | 'review'
  confidence: number
}

const SESSION_PROFILES: Record<string, Omit<SessionFlowPrediction, 'confidence'>> = {
  'ai-app': {
    predictedSteps: [
      { appId: 'ai-app', workspaceId: 'ai', estimatedDurationMs: 900000, confidence: 0.88, reason: 'Primary AI workspace' },
      { appId: 'monitor', workspaceId: 'development', estimatedDurationMs: 300000, confidence: 0.72, reason: 'Runtime monitoring follows AI work' },
      { appId: 'terminal', workspaceId: 'development', estimatedDurationMs: 600000, confidence: 0.65, reason: 'Terminal frequently used after AI sessions' },
    ],
    totalDurationMs: 1800000,
    primaryWorkspace: 'ai',
    sessionType: 'ai-collaboration',
  },
  'monitor': {
    predictedSteps: [
      { appId: 'monitor', workspaceId: 'development', estimatedDurationMs: 600000, confidence: 0.82, reason: 'System monitoring session' },
      { appId: 'ai-app', workspaceId: 'ai', estimatedDurationMs: 450000, confidence: 0.68, reason: 'AI consultation follows monitoring' },
    ],
    totalDurationMs: 1050000,
    primaryWorkspace: 'development',
    sessionType: 'review',
  },
}

export function predictSessionFlow(input: {
  dominantAppId: string
  workspaceId: string
  activeApps: string[]
}): SessionFlowPrediction {
  const profile = SESSION_PROFILES[input.dominantAppId]

  if (profile) {
    return { ...profile, confidence: 0.75 + input.activeApps.length * 0.03 }
  }

  // Generic development session
  return {
    predictedSteps: [
      { appId: input.dominantAppId, workspaceId: input.workspaceId, estimatedDurationMs: 1200000, confidence: 0.6, reason: 'Current app as primary session focus' },
      { appId: 'ai-app', workspaceId: 'ai', estimatedDurationMs: 600000, confidence: 0.45, reason: 'AI assistant commonly used across sessions' },
    ],
    totalDurationMs: 1800000,
    primaryWorkspace: input.workspaceId,
    sessionType: 'development',
    confidence: 0.52,
  }
}
