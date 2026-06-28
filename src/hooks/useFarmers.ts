import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getAssignedFarmers,
  getFarmerDetail,
  type AssignedFarmersResponse,
  type Farmer,
} from "@/services/farmers"

// ── useAssignedFarmers ────────────────────────────────────────────────────────

interface UseAssignedFarmersResult {
  data: AssignedFarmersResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAssignedFarmers(
  page = 1,
  limit = 50
): UseAssignedFarmersResult {
  const [data, setData] = useState<AssignedFarmersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAssignedFarmers(page, limit)
      setData(res)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load farmers"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── useFarmerDetail ───────────────────────────────────────────────────────────

interface UseFarmerDetailResult {
  data: Farmer | null
  loading: boolean
  error: string | null
}

export function useFarmerDetail(id: string): UseFarmerDetailResult {
  const [data, setData] = useState<Farmer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setData(null)
      return
    }

    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getFarmerDetail(id)
        if (!cancelled) setData(res.farmer)
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load farmer details"
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