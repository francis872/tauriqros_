export const RUNTIME_RECOVERY_POLICIES = [
  {
    id: 'daemon-restart',
    trigger: 'daemon-failure',
    action: 'restart-daemon',
  },
  {
    id: 'workflow-rehydrate',
    trigger: 'workflow-interruption',
    action: 'resume-workflow',
  },
  {
    id: 'thermal-protect',
    trigger: 'thermal-spike',
    action: 'reduce-background-load',
  },
] as const
