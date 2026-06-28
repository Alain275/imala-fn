import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getTrainingMaterialsList,
  getTrainingMaterial,
  createTrainingMaterial,
  updateTrainingMaterial,
  deleteTrainingMaterial,
  type TrainingMaterialListResponse,
  type TrainingMaterial,
  type TrainingMaterialFilters,
  type CreateTrainingMaterialInput,
  type UpdateTrainingMaterialInput,
} from "@/services/trainingMaterials"

// ── useTrainingMaterialsList ──────────────────────────────────────────────────

interface UseTrainingMaterialsListResult {
  data: TrainingMaterialListResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTrainingMaterialsList(
  filters: TrainingMaterialFilters = {}
): UseTrainingMaterialsListResult {
  const [data, setData] = useState<TrainingMaterialListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getTrainingMaterialsList(filters)
      setData(res)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load training materials"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.language, filters.isPublished, filters.page, filters.limit])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── useTrainingMaterial ──────────────────────────────────────────────────────

interface UseTrainingMaterialResult {
  data: TrainingMaterial | null
  loading: boolean
  error: string | null
}

export function useTrainingMaterial(id: string): UseTrainingMaterialResult {
  const [data, setData] = useState<TrainingMaterial | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setData(null); return }
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getTrainingMaterial(id)
        if (!cancelled) setData(res.material)
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load training material"
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [id])

  return { data, loading, error }
}

// ── useCreateTrainingMaterial ─────────────────────────────────────────────────

interface UseCreateTrainingMaterialResult {
  mutate: (body: CreateTrainingMaterialInput, onSuccess?: () => void) => void
  loading: boolean
}

export function useCreateTrainingMaterial(): UseCreateTrainingMaterialResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (body: CreateTrainingMaterialInput, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await createTrainingMaterial(body)
        toast.success("Training material created successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create training material"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}

// ── useUpdateTrainingMaterial ─────────────────────────────────────────────────

interface UseUpdateTrainingMaterialResult {
  mutate: (id: string, body: UpdateTrainingMaterialInput, onSuccess?: () => void) => void
  loading: boolean
}

export function useUpdateTrainingMaterial(): UseUpdateTrainingMaterialResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (id: string, body: UpdateTrainingMaterialInput, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await updateTrainingMaterial(id, body)
        toast.success("Training material updated successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update training material"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}

// ── useDeleteTrainingMaterial ─────────────────────────────────────────────────

interface UseDeleteTrainingMaterialResult {
  mutate: (id: string, onSuccess?: () => void) => void
  loading: boolean
}

export function useDeleteTrainingMaterial(): UseDeleteTrainingMaterialResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (id: string, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await deleteTrainingMaterial(id)
        toast.success("Training material deleted successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete training material"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}