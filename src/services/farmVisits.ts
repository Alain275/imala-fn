import api from "./api"

// ── Types ─────────────────────────────────────────────────────────────────────

export type VisitStatus = "scheduled" | "completed" | "cancelled"

export interface FarmVisit {
  id: string
  farmerId: string
  farmId: string
  visitDate: string
  nextVisitDate?: string
  observations?: string
  recommendations?: string
  status: VisitStatus
  farmer?: {
    id: string
    name: string
    district?: string
    sector?: string
  }
}

export interface FarmVisitsResponse {
  success: boolean
  visits: FarmVisit[]
  total: number
  page?: number
  limit?: number
}

export interface FarmVisitResponse {
  success: boolean
  visit: FarmVisit
}

export interface CreateFarmVisitInput {
  farmerId: string
  farmId: string
  visitDate: string
  observations?: string
  recommendations?: string
  nextVisitDate?: string
}

export interface UpdateFarmVisitInput {
  visitDate?: string
  observations?: string
  recommendations?: string
  nextVisitDate?: string
  status?: VisitStatus
}

export interface FarmVisitFilters {
  status?: VisitStatus | ""
  farmerId?: string
  page?: number
  limit?: number
}

// ── Requests ──────────────────────────────────────────────────────────────────

export async function getFarmVisits(
  filters: FarmVisitFilters = {}
): Promise<FarmVisitsResponse> {
  const params = new URLSearchParams()
  if (filters.status) params.append("status", filters.status)
  if (filters.farmerId) params.append("farmerId", filters.farmerId)
  params.append("page", String(filters.page ?? 1))
  params.append("limit", String(filters.limit ?? 20))

  return api.request<FarmVisitsResponse>(
    `/agronomists/farm-visits?${params.toString()}`,
    { requiresAuth: true }
  )
}

export async function getFarmVisit(id: string): Promise<FarmVisitResponse> {
  return api.request<FarmVisitResponse>(
    `/agronomists/farm-visits/${id}`,
    { requiresAuth: true }
  )
}

export async function createFarmVisit(
  body: CreateFarmVisitInput
): Promise<FarmVisitResponse> {
  return api.request<FarmVisitResponse>("/agronomists/farm-visits", {
    requiresAuth: true,
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateFarmVisit(
  id: string,
  body: UpdateFarmVisitInput
): Promise<FarmVisitResponse> {
  return api.request<FarmVisitResponse>(`/agronomists/farm-visits/${id}`, {
    requiresAuth: true,
    method: "PATCH",
    body: JSON.stringify(body),
  })
}
