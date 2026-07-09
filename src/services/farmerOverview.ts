import api from './api'

export interface FarmerOverviewStat {
  value: number
  change: string
  up: boolean
}

export interface FarmerOverviewWeatherDay {
  day: string
  temp: number
  rain: number
  rainMm?: number
  humidity?: number
  wind?: number
}

export interface FarmerOverviewCropSeries {
  key: string
  name: string
  color: string
}

export interface FarmerOverviewAlert {
  id: string
  severity: 'danger' | 'warning' | 'info' | 'success'
  message: string
  time: string
}

export interface FarmerOverview {
  farmer: {
    name: string
    location: string
  }
  stats: {
    activeFarms: FarmerOverviewStat
    cropsMonitored: FarmerOverviewStat
    diseaseAlerts: FarmerOverviewStat
    marketListings: FarmerOverviewStat
  }
  weatherForecast: FarmerOverviewWeatherDay[]
  cropArea: {
    data: Array<Record<string, string | number>>
    cropSeries: FarmerOverviewCropSeries[]
  }
  soilHealth: Array<{
    key: 'excellent' | 'good' | 'fair' | 'poor'
    value: number
  }>
  recentAlerts: FarmerOverviewAlert[]
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const farmerOverviewService = {
  async getOverview(): Promise<FarmerOverview> {
    const result = await api.request<ApiResponse<FarmerOverview>>('/dashboard/farmer-overview', {
      requiresAuth: true,
    })
    if (!result.success) throw new Error(result.message || 'Failed to load farmer overview')
    return result.data
  },
}
