import { useEffect } from 'react'
import { getRefreshToken, getLastActive, storeTokens, updateLastActive } from '@/lib/auth'
import { toast } from 'sonner'

const INACTIVITY_THRESHOLD = 10 * 60 * 1000 // 10 minutes

// refresh on interacting with the app

export const useSessionRefresh = () => {
  useEffect(() => {
    const handleUserActivity = async () => {
      const lastActive = getLastActive()
      const now = Date.now()

      if (now - lastActive > INACTIVITY_THRESHOLD) {
        const refreshToken = getRefreshToken()
        if (!refreshToken) return

        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })

          if (!res.ok) throw new Error('Token refresh failed')

          const data = await res.json()
          storeTokens(data.accessToken, refreshToken)
          toast.success('Session extended.')
        } catch (err: any) {
          toast.error('Session expired. Please log in again.')
          sessionStorage.clear()
          window.location.href = '/login'
        }
      } else {
        updateLastActive()
      }
    }

    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll']
    activityEvents.forEach((e) => window.addEventListener(e, handleUserActivity))

    return () => {
      activityEvents.forEach((e) => window.removeEventListener(e, handleUserActivity))
    }
  }, [])
}
