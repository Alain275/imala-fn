import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getQuestionsList,
  getQuestion,
  answerQuestion,
  type QuestionListResponse,
  type Question,
  type QuestionFilters,
  type AnswerQuestionInput,
} from "@/services/questions"

// ── useQuestionsList ──────────────────────────────────────────────────────────

interface UseQuestionsListResult {
  data: QuestionListResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useQuestionsList(filters: QuestionFilters = {}): UseQuestionsListResult {
  const [data, setData] = useState<QuestionListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getQuestionsList(filters)
      setData(res)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load questions"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category, filters.page, filters.limit])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── useQuestion ───────────────────────────────────────────────────────────────

interface UseQuestionResult {
  data: Question | null
  loading: boolean
  error: string | null
}

export function useQuestion(id: string): UseQuestionResult {
  const [data, setData] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setData(null); return }
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getQuestion(id)
        if (!cancelled) setData(res.question)
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load question"
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

// ── useAnswerQuestion ─────────────────────────────────────────────────────────

interface UseAnswerQuestionResult {
  mutate: (id: string, body: AnswerQuestionInput, onSuccess?: () => void) => void
  loading: boolean
}

export function useAnswerQuestion(): UseAnswerQuestionResult {
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (id: string, body: AnswerQuestionInput, onSuccess?: () => void) => {
      setLoading(true)
      try {
        await answerQuestion(id, body)
        toast.success("Question answered successfully")
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to answer question"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading }
}