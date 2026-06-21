import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  soilService,
  SoilTest,
  SoilTestList,
  SoilAnalysis,
  CreateSoilTestInput,
  UpdateSoilTestInput,
} from '@/services/soil'

interface SoilState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function useSoilFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  errorLabel: string,
  enabled = true
): SoilState<T> & { refetch: () => void } {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<SoilState<T>>({
    data: null,
    loading: enabled,
    error: null,
  })

  const refetch = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null })
      return
    }
    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))

    fetcher()
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : `Failed to load ${errorLabel}`
        setState({ data: null, loading: false, error: message })
        toast.error(`Soil error: ${message}`)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version, enabled])

  return { ...state, refetch }
}

// ── Read hooks ────────────────────────────────────────────────────────────────

export function useSoilAnalysis() {
  return useSoilFetch<SoilAnalysis>(
    () => soilService.getSoilAnalysis(),
    [],
    'soil analysis'
  )
}

export function useSoilTests(location: string, page = 1, limit = 10) {
  return useSoilFetch<SoilTestList>(
    () => soilService.getSoilTests(location, page, limit),
    [location, page, limit],
    'soil tests',
    !!location
  )
}

export function useLatestSoilTest() {
  return useSoilFetch<SoilTest>(
    () => soilService.getLatestSoilTest(),
    [],
    'latest soil test'
  )
}

export function useSoilTest(id: string) {
  return useSoilFetch<SoilTest>(
    () => soilService.getSoilTestById(id),
    [id],
    'soil test',
    !!id
  )
}

// ── Mutation hooks ────────────────────────────────────────────────────────────

export function useCreateSoilTest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (body: CreateSoilTestInput, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      await soilService.createSoilTest(body)
      toast.success('Soil test recorded successfully')
      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create soil test'
      setError(message)
      toast.error(`Soil error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useUpdateSoilTest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (id: string, body: UpdateSoilTestInput, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      await soilService.updateSoilTest(id, body)
      toast.success('Soil test updated successfully')
      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update soil test'
      setError(message)
      toast.error(`Soil error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useDeleteSoilTest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (id: string, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      await soilService.deleteSoilTest(id)
      toast.success('Soil test deleted')
      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete soil test'
      setError(message)
      toast.error(`Soil error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
