import api from './api'

export interface Detection {
  id: string
  userId: string
  farmId: string | null
  cropId: string | null
  imageUrl: string | null
  aiDisease: string
  aiCrop: string
  aiConfidence: number
  aiModel: string
  aiMode: string
  demoMode: boolean
  symptoms: string
  treatment: string
  prevention: string
  status: string
  verifiedDisease: string | null
  verifiedTreatment: string | null
  agronomistComment: string | null
  verifiedBy: string | null
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
  crop: unknown | null
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface DetectionList {
  detections: Detection[]
  pagination: Pagination
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`

async function detectDisease(file: File): Promise<Detection> {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}/disease/detect`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/sign-in'
    throw new Error('Unauthorized')
  }

  const json: ApiResponse<Detection> = await response.json()
  if (!response.ok || !json.success) throw new Error(json.message || 'Detection failed')
  return json.data
}

async function getMyDetections(params?: { page?: number; limit?: number }): Promise<DetectionList> {
  const qs = params
    ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : ''
  const result = await api.request<ApiResponse<DetectionList>>(
    `/disease/my-detections${qs ? `?${qs}` : ''}`,
    { requiresAuth: true }
  )
  if (!result.success) throw new Error('Failed to load detections')
  return result.data
}

async function getDetectionById(id: string): Promise<Detection> {
  const result = await api.request<ApiResponse<Detection>>(`/disease/${id}`, {
    requiresAuth: true,
  })
  if (!result.success) throw new Error('Failed to load detection')
  return result.data
}

async function updateDetection(id: string, body: Partial<Omit<Detection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Detection> {
  const result = await api.request<ApiResponse<Detection>>(`/disease/${id}`, {
    method: 'PATCH',
    requiresAuth: true,
    body: JSON.stringify(body),
  })
  if (!result.success) throw new Error('Failed to update detection')
  return result.data
}

async function deleteDetection(id: string): Promise<void> {
  await api.request<ApiResponse<unknown>>(`/disease/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  })
}

export const diseaseService = {
  detectDisease,
  getMyDetections,
  getDetectionById,
  updateDetection,
  deleteDetection,
}
