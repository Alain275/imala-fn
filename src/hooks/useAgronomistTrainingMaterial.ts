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
 * React 18 StrictMode's dev-only mount→unmount→remount cycle re-runs this
 * effect twice in a row. `fetchedForRef` tracks the id we've already
 * dispatched a real request for and persists across StrictMode's replay (same
 * fiber, not a new instance), so the second synthetic invocation is skipped
 * outright — no second network call.
 *
 * Deliberately NOT using a per-invocation `cancelled` closure + cleanup here:
 * StrictMode calls invocation #1's cleanup (setting its `cancelled = true`)
 * *before* invocation #2 runs, and invocation #2 exits immediately via the
 * ref-guard above without starting a new fetch or registering new cleanup —
 * so invocation #1's own response would arrive with `cancelled` already true
 * and get silently discarded, leaving the UI stuck on the loading state
 * forever. Instead, the resolution check reads `fetchedForRef.current === id`
 * at response time: StrictMode's replay never touches the ref (invocation #2
 * returns before reaching it), so invocation #1's real response still applies
 * correctly. A genuine new navigation *does* reassign the ref to the new id
 * before the old promise settles, so a stale response is still correctly
 * discarded — same protection, just keyed off the ref instead of a closure
 * boolean that StrictMode's replay silently poisons.
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

    setState(prev => ({ ...prev, loading: true, error: null }))

    agronomistTrainingMaterialsService.getMaterial(id)
      .then(data => {
        if (fetchedForRef.current === id) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (fetchedForRef.current !== id) return
        const message = err instanceof Error ? err.message : 'Training material not found'
        setState({ data: null, loading: false, error: message })
        toast.error(message)
      })
  }, [id, version])

  return { ...state, refetch }
}
