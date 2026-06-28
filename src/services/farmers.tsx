import api from "./api"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Farmer {
  id: string
  name: string
  photoUrl?: string
  nationalId?: string
  phone?: string
  district?: string
  sector?: string
  farmSize?: number
  crops?: string[]
  status?: "active" | "inactive" | "new"
  lastActivity?: string
  joinedAt?: string
  notes?: string
}

export interface AssignedFarmersResponse {
  success: boolean
  farmers: Farmer[]
  total: number
  page?: number
  limit?: number
}

export interface FarmerDetailResponse {
  success: boolean
  farmer: Farmer
}

// ── Requests ──────────────────────────────────────────────────────────────────

export async function getAssignedFarmers(
  page = 1,
  limit = 50
): Promise<AssignedFarmersResponse> {
  return api.request<AssignedFarmersResponse>(
    `/agronomists/farmers?page=${page}&limit=${limit}`,
    { requiresAuth: true }
  )
}

export async function getFarmerDetail(id: string): Promise<FarmerDetailResponse> {
  return api.request<FarmerDetailResponse>(
    `/agronomists/farmers/${id}`,
    { requiresAuth: true }
  )
}
