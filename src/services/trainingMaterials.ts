import api from "./api"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrainingMaterial {
  id: string
  title: string
  description: string
  content: string
  videoUrl?: string
  pdfUrl?: string
  category: string
  language: string
  isPublished: boolean
  createdAt: string
  updatedAt?: string
}

export interface TrainingMaterialListResponse {
  success: boolean
  materials: TrainingMaterial[]
  total: number
  page?: number
  limit?: number
}

export interface TrainingMaterialResponse {
  success: boolean
  material: TrainingMaterial
}

export interface CreateTrainingMaterialInput {
  title: string
  description: string
  content: string
  videoUrl?: string
  pdfUrl?: string
  category: string
  language: string
  isPublished?: boolean
}

export interface UpdateTrainingMaterialInput {
  title?: string
  description?: string
  content?: string
  videoUrl?: string
  pdfUrl?: string
  category?: string
  language?: string
  isPublished?: boolean
}

export interface TrainingMaterialFilters {
  category?: string
  language?: string
  isPublished?: boolean
  page?: number
  limit?: number
}

// ── Requests ──────────────────────────────────────────────────────────────────

export async function getTrainingMaterialsList(
  filters: TrainingMaterialFilters = {}
): Promise<TrainingMaterialListResponse> {
  const params = new URLSearchParams()
  if (filters.category) params.append("category", filters.category)
  if (filters.language) params.append("language", filters.language)
  if (filters.isPublished !== undefined) params.append("isPublished", String(filters.isPublished))
  params.append("page", String(filters.page ?? 1))
  params.append("limit", String(filters.limit ?? 20))

  return api.request<TrainingMaterialListResponse>(
    `/agronomists/training-materials?${params.toString()}`,
    { requiresAuth: true }
  )
}

export async function getTrainingMaterial(id: string): Promise<TrainingMaterialResponse> {
  return api.request<TrainingMaterialResponse>(
    `/agronomists/training-materials/${id}`,
    { requiresAuth: true }
  )
}

export async function createTrainingMaterial(
  body: CreateTrainingMaterialInput
): Promise<TrainingMaterialResponse> {
  return api.request<TrainingMaterialResponse>("/agronomists/training-materials", {
    requiresAuth: true,
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateTrainingMaterial(
  id: string,
  body: UpdateTrainingMaterialInput
): Promise<TrainingMaterialResponse> {
  return api.request<TrainingMaterialResponse>(`/agronomists/training-materials/${id}`, {
    requiresAuth: true,
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function deleteTrainingMaterial(id: string): Promise<{ success: boolean }> {
  return api.request<{ success: boolean }>(`/agronomists/training-materials/${id}`, {
    requiresAuth: true,
    method: "DELETE",
  })
}