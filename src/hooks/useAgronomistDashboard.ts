import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { agronomistDashboardService, AgronomistDashboardSummary } from '@/services/agronomistDashboard.service'

interface DashboardState {
  data: AgronomistDashboardSummary | null
  loading: boolean
  error: string | null
}

export function useAgronomistDashboardSummary() {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<DashboardState>({ data: null, loading: true, error: null })

  const refetch = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))

    agronomistDashboardService.getSummary()
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to load dashboard summary'
        setState({ data: null, loading: false, error: message })
        toast.error(message)
      })

    return () => { cancelled = true }
  }, [version])

  return { ...state, refetch }
}
