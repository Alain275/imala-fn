import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getFarmVisits,
  getFarmVisit,
  createFarmVisit,
  updateFarmVisit,
  type FarmVisitsResponse,
  type FarmVisit,
  type FarmVisitFilters,
  type CreateFarmVisitInput,
  type UpdateFarmVisitInput,
} from "@/services/farmVisits"

// ── useFarmVisits ─────────────────────────────────────────────────────────────

interface UseFarmVisitsResult {
  data: FarmVisitsResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFarmVisits(filters: FarmVisitFilters = {}): UseFarmVisitsResult {
  const [data, setData] = useState<FarmVisitsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getFarmVisits(filters)
      setData(res)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load farm visits"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.farmerId, filters.page, filters.limit])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── useFarmVisit ──────────────────────────────────────────────────────────────

interface UseFarmVisitResult {
  data: FarmVisit | null
  loading: boolean
  error: string | null
}

export function useFarmVisit(id: string): UseFarmVisitResult {
  const [data, setData] = useState<FarmVisit | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setData(null); return }
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getFarmVisit(id)
        if (!cancelled) setData(res.visit)
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load visit"
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

// ── useCreateFarmVisit ────────────────────────────────────────────────────────

interface UseMutationResult {
  mutate: (body: CreateFarmVisitInput, onSuccess?: () => void) => void
  loading: boolean
}

export function useCreateFarmVisit(): UseMutationResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (body: CreateFarmVisitInput, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await createFarmVisit(body)
        toast.success("Farm visit created successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create visit"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}

// ── useUpdateFarmVisit ────────────────────────────────────────────────────────

interface UseUpdateResult {
  mutate: (id: string, body: UpdateFarmVisitInput, onSuccess?: () => void) => void
  loading: boolean
}

export function useUpdateFarmVisit(): UseUpdateResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (id: string, body: UpdateFarmVisitInput, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await updateFarmVisit(id, body)
        toast.success("Farm visit updated successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update visit"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}
