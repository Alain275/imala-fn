import api from "./api"

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuestionStatus = "pending" | "answered" | "closed"

export interface Question {
  id: string
  farmerId: string
  farmerName?: string
  farmerDistrict?: string
  farmerSector?: string
  category: string
  question: string
  answer?: string
  status: QuestionStatus
  createdAt: string
  updatedAt?: string
  answeredAt?: string
}

export interface QuestionListResponse {
  success: boolean
  questions: Question[]
  total: number
  page?: number
  limit?: number
}

export interface QuestionResponse {
  success: boolean
  question: Question
}

export interface AnswerQuestionInput {
  answer: string
}

export interface QuestionFilters {
  status?: QuestionStatus | ""
  category?: string
  page?: number
  limit?: number
}

// ── Requests ──────────────────────────────────────────────────────────────────

export async function getQuestionsList(
  filters: QuestionFilters = {}
): Promise<QuestionListResponse> {
  const params = new URLSearchParams()
  if (filters.status) params.append("status", filters.status)
  if (filters.category) params.append("category", filters.category)
  params.append("page", String(filters.page ?? 1))
  params.append("limit", String(filters.limit ?? 20))

  return api.request<QuestionListResponse>(
    `/agronomists/questions?${params.toString()}`,
    { requiresAuth: true }
  )
}

export async function getQuestion(id: string): Promise<QuestionResponse> {
  return api.request<QuestionResponse>(
    `/agronomists/questions/${id}`,
    { requiresAuth: true }
  )
}

export async function answerQuestion(
  id: string,
  body: AnswerQuestionInput
): Promise<QuestionResponse> {
  return api.request<QuestionResponse>(`/agronomists/questions/${id}/answer`, {
    requiresAuth: true,
    method: "PATCH",
    body: JSON.stringify(body),
  })
}