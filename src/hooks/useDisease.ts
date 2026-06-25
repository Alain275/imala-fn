import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { diseaseService, Detection, DetectionList } from '@/services/disease'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useMyDetections(params?: { page?: number; limit?: number }) {
  const [state, setState] = useState<AsyncState<DetectionList>>({
    data: null,
    loading: true,
    error: null,
  })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))

    diseaseService
      .getMyDetections(params)
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to load detections'
        setState({ data: null, loading: false, error: message })
        toast.error(message)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, params?.page, params?.limit])

  const refetch = useCallback(() => setTick(t => t + 1), [])

  return { ...state, refetch }
}

export function useDetectDisease() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (file: File, onSuccess?: (detection: Detection) => void) => {
      setLoading(true)
      setError(null)
      try {
        const detection = await diseaseService.detectDisease(file)
        onSuccess?.(detection)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Detection failed'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading, error }
}
