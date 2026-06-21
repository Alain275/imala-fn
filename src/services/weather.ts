import api from './api'

export interface CurrentWeather {
  location: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: string
  uvIndex: number
  visibility: number
  pressure: number
  condition: string
  conditionCode: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy'
  sunrise: string
  sunset: string
  rainChance: number
  lastUpdated: string
}

export interface HourlyForecast {
  time: string
  temperature: number
  condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy'
  rainChance: number
  windSpeed: number
  humidity: number
}

export interface DailyForecast {
  date: string
  day: string
  tempHigh: number
  tempLow: number
  condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy'
  rainChance: number
  humidity: number
  windSpeed: number
}

export interface FarmingAlert {
  id: string
  type: 'warning' | 'info'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  validFrom: string
  validTo: string
  recommendations: string[]
}

export interface RainfallHistory {
  month: string
  rainfall: number
  average: number
  days: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

async function weatherRequest<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()
  const result = await api.request<ApiResponse<T>>(`/weather${endpoint}?${qs}`, {
    requiresAuth: true,
  })
  if (!result.success) throw new Error(`Weather API error: ${endpoint}`)
  return result.data
}

export const weatherService = {
  getCurrentWeather(location: string): Promise<CurrentWeather> {
    return weatherRequest<CurrentWeather>('/current', { location })
  },

  getHourlyForecast(location: string, hours = 12): Promise<HourlyForecast[]> {
    return weatherRequest<HourlyForecast[]>('/hourly', { location, hours })
  },

  getDailyForecast(location: string, days = 7): Promise<DailyForecast[]> {
    return weatherRequest<DailyForecast[]>('/daily', { location, days })
  },

  getFarmingAlerts(location: string): Promise<FarmingAlert[]> {
    return weatherRequest<FarmingAlert[]>('/alerts', { location })
  },

  getRainfallHistory(location: string, months = 12): Promise<RainfallHistory[]> {
    return weatherRequest<RainfallHistory[]>('/rainfall', { location, months })
  },
}
