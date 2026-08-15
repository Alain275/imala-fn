import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { agronomistTrainingMaterialsService, TrainingMaterial } from '@/services/agronomistTrainingMaterials.service'

interface MaterialState {
  data: TrainingMaterial | null
  loading: boolean
  error: string | null
}

/**
 * Fetches once per id (or on an explicit refetch() call after an edit/publish
 * action) — never on hover, list-render, or a background interval. GET /:id
 * increments viewCount server-side, so extra silent fetches would inflate it.
 *
 * The `cancelled` flag alone is not enough here: React 18 StrictMode's dev-only
 * mount→unmount→remount cycle re-runs this effect twice in a row, and a
 * `cancelled` guard only discards the stale *result* — it doesn't stop the
 * first fetch() from actually reaching the server and incrementing viewCount.
 * `fetchedForRef` tracks the id we've already dispatched a real request for and
 * persists across StrictMode's replay (same fiber, not a new instance), so the
 * second synthetic invocation is skipped outright — no second network call.
 */
export function useAgronomistTrainingMaterial(id: string | undefined) {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<MaterialState>({ data: null, loading: true, error: null })
  const fetchedForRef = useRef<string | null>(null)

  const refetch = useCallback(() => {
    fetchedForRef.current = null
    setVersion(v => v + 1)
  }, [])

  useEffect(() => {
    if (!id) return
    if (fetchedForRef.current === id) return
    fetchedForRef.current = id

    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))

    agronomistTrainingMaterialsService.getMaterial(id)
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Training material not found'
        setState({ data: null, loading: false, error: message })
        toast.error(message)
      })

    return () => { cancelled = true }
  }, [id, version])

  return { ...state, refetch }
}
