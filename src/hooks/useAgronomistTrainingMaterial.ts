import { useState, useEffect, useCallback } from 'react'
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
 */
export function useAgronomistTrainingMaterial(id: string | undefined) {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<MaterialState>({ data: null, loading: true, error: null })

  const refetch = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!id) return
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
