import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { agronomistFarmersService, FarmerDetail } from '@/services/agronomistFarmers.service'

interface DetailState {
  data: FarmerDetail | null
  loading: boolean
  error: string | null
}

export function useAgronomistFarmerDetail(farmerId: string | undefined) {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<DetailState>({ data: null, loading: true, error: null })

  const refetch = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!farmerId) return
    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))

    agronomistFarmersService.getFarmerDetail(farmerId)
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to load farmer'
        setState({ data: null, loading: false, error: message })
        toast.error(message)
      })

    return () => { cancelled = true }
  }, [farmerId, version])

  return { ...state, refetch }
}
