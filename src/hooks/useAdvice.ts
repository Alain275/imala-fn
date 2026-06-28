import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getAdviceList,
  getAdvice,
  createAdvice,
  updateAdvice,
  deleteAdvice,
  type AdviceListResponse,
  type Advice,
  type AdviceFilters,
  type CreateAdviceInput,
  type UpdateAdviceInput,
} from "@/services/advice"

// ── useAdviceList ─────────────────────────────────────────────────────────────

interface UseAdviceListResult {
  data: AdviceListResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAdviceList(filters: AdviceFilters = {}): UseAdviceListResult {
  const [data, setData] = useState<AdviceListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdviceList(filters)
      setData(res)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load advice"
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

// ── useAdvice ─────────────────────────────────────────────────────────────────

interface UseAdviceResult {
  data: Advice | null
  loading: boolean
  error: string | null
}

export function useAdvice(id: string): UseAdviceResult {
  const [data, setData] = useState<Advice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setData(null); return }
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getAdvice(id)
        if (!cancelled) setData(res.advice)
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load advice"
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

// ── useCreateAdvice ───────────────────────────────────────────────────────────

interface UseCreateAdviceResult {
  mutate: (body: CreateAdviceInput, onSuccess?: () => void) => void
  loading: boolean
}

export function useCreateAdvice(): UseCreateAdviceResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (body: CreateAdviceInput, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await createAdvice(body)
        toast.success("Advice created successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create advice"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}

// ── useUpdateAdvice ───────────────────────────────────────────────────────────

interface UseUpdateAdviceResult {
  mutate: (id: string, body: UpdateAdviceInput, onSuccess?: () => void) => void
  loading: boolean
}

export function useUpdateAdvice(): UseUpdateAdviceResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (id: string, body: UpdateAdviceInput, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await updateAdvice(id, body)
        toast.success("Advice updated successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update advice"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}

// ── useDeleteAdvice ───────────────────────────────────────────────────────────

interface UseDeleteAdviceResult {
  mutate: (id: string, onSuccess?: () => void) => void
  loading: boolean
}

export function useDeleteAdvice(): UseDeleteAdviceResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (id: string, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await deleteAdvice(id)
        toast.success("Advice deleted successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete advice"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}
