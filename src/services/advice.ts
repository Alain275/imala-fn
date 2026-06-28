import api from "./api"

// ── Types ─────────────────────────────────────────────────────────────────────

export type AdviceStatus = "pending" | "in_progress" | "resolved" | "closed"

export interface Advice {
  id: string
  farmerId: string
  farmId: string
  title: string
  problem: string
  recommendation: string
  status: AdviceStatus
  createdAt: string
  updatedAt?: string
  farmer?: {
    id: string
    name: string
    district?: string
    sector?: string
  }
}

export interface AdviceListResponse {
  success: boolean
  advice: Advice[]
  total: number
  page?: number
  limit?: number
}

export interface AdviceResponse {
  success: boolean
  advice: Advice
}

export interface CreateAdviceInput {
  farmerId: string
  farmId: string
  title: string
  problem: string
  recommendation: string
}

export interface UpdateAdviceInput {
  title?: string
  problem?: string
  recommendation?: string
  status?: AdviceStatus
}

export interface AdviceFilters {
  status?: AdviceStatus | ""
  farmerId?: string
  page?: number
  limit?: number
}

// ── Requests ──────────────────────────────────────────────────────────────────

export async function getAdviceList(
  filters: AdviceFilters = {}
): Promise<AdviceListResponse> {
  const params = new URLSearchParams()
  if (filters.status) params.append("status", filters.status)
  if (filters.farmerId) params.append("farmerId", filters.farmerId)
  params.append("page", String(filters.page ?? 1))
  params.append("limit", String(filters.limit ?? 20))

  return api.request<AdviceListResponse>(
    `/agronomists/advice?${params.toString()}`,
    { requiresAuth: true }
  )
}

export async function getAdvice(id: string): Promise<AdviceResponse> {
  return api.request<AdviceResponse>(
    `/agronomists/advice/${id}`,
    { requiresAuth: true }
  )
}

export async function createAdvice(
  body: CreateAdviceInput
): Promise<AdviceResponse> {
  return api.request<AdviceResponse>("/agronomists/advice", {
    requiresAuth: true,
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateAdvice(
  id: string,
  body: UpdateAdviceInput
): Promise<AdviceResponse> {
  return api.request<AdviceResponse>(`/agronomists/advice/${id}`, {
    requiresAuth: true,
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function deleteAdvice(id: string): Promise<{ success: boolean }> {
  return api.request<{ success: boolean }>(`/agronomists/advice/${id}`, {
    requiresAuth: true,
    method: "DELETE",
  })
}