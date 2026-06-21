import api from './api'

export interface SoilTest {
  id: string
  userId: string
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
  organicMatter: number
  texture: string
  location: string
  notes: string
  testDate: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface SoilTestList {
  tests: SoilTest[]
  pagination: Pagination
}

export interface CreateSoilTestInput {
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
  organicMatter: number
  texture: string
  location: string
  notes: string
}

export type UpdateSoilTestInput = Partial<CreateSoilTestInput>

export interface NutrientScore {
  score: number | null
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface NutrientScoreWithValue extends NutrientScore {
  value: number
}

export interface NutrientProfile {
  ph: NutrientScore
  nitrogen: NutrientScore
  phosphorus: NutrientScore
  potassium: NutrientScore
  organicMatter: NutrientScoreWithValue
}

export interface Recommendation {
  type: 'info' | 'action'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  nutrient: string
}

export interface CropSuitability {
  crop: string
  suitability: number | null
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface SoilAnalysis {
  test: SoilTest
  healthScore: number | null
  recommendations: Recommendation[]
  cropSuitability: CropSuitability[]
  nutrientProfile: NutrientProfile
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

async function soilRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const result = await api.request<ApiResponse<T>>(endpoint, {
    requiresAuth: true,
    ...options,
  })
  if (!result.success) throw new Error(`Soil API error: ${endpoint}`)
  return result.data
}

export const soilService = {
  getSoilTests(location: string, page = 1, limit = 10): Promise<SoilTestList> {
    const qs = new URLSearchParams({ location, page: String(page), limit: String(limit) })
    return soilRequest<SoilTestList>(`/soil?${qs}`)
  },

  createSoilTest(body: CreateSoilTestInput): Promise<SoilTest> {
    return soilRequest<SoilTest>('/soil', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  getLatestSoilTest(): Promise<SoilTest> {
    return soilRequest<SoilTest>('/soil/latest')
  },

  getSoilAnalysis(): Promise<SoilAnalysis> {
    return soilRequest<SoilAnalysis>('/soil/analysis')
  },

  getSoilTestById(id: string): Promise<SoilTest> {
    return soilRequest<SoilTest>(`/soil/${id}`)
  },

  updateSoilTest(id: string, body: UpdateSoilTestInput): Promise<SoilTest> {
    return soilRequest<SoilTest>(`/soil/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  deleteSoilTest(id: string): Promise<void> {
    return soilRequest<void>(`/soil/${id}`, { method: 'DELETE' })
  },
}
