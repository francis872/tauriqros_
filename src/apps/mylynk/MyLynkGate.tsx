import { useEffect, type ReactNode } from 'react'
import { useMyLynkAuth } from './mylynkAuthStore'
import MyLynkSignIn from './MyLynkSignIn'

interface Props {
  appId: string
  children: ReactNode
}

/**
 * Wraps an app with MY-LYNK authentication.
 * Shows the sign-in screen if no account is active; renders children once authenticated.
 */
export default function MyLynkGate({ appId, children }: Props) {
  const currentAccount = useMyLynkAuth((s) => s.currentAccount)
  const connectApp = useMyLynkAuth((s) => s.connectApp)

  useEffect(() => {
    if (currentAccount) {
      connectApp(appId)
    }
  }, [currentAccount, appId, connectApp])

  if (!currentAccount) {
    return <MyLynkSignIn appId={appId} />
  }

  return <>{children}</>
}
