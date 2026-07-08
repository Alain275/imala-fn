import api from './api'

export interface CurrentWeather {
  location: string
  latitude?: number
  longitude?: number
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

export interface WeatherQuery {
  location?: string
  lat?: number
  lon?: number
}

function normalizeWeatherQuery(query: string | WeatherQuery): WeatherQuery {
  if (typeof query === 'string') return { location: query }
  return query
}

function weatherParams(query: string | WeatherQuery): Record<string, string | number | undefined> {
  const normalized = normalizeWeatherQuery(query)
  return {
    location: normalized.location,
    lat: normalized.lat,
    lon: normalized.lon,
  }
}

async function weatherRequest<T>(endpoint: string, params: Record<string, string | number | undefined>): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)])
  ).toString()
  const result = await api.request<ApiResponse<T>>(`/weather${endpoint}?${qs}`, {
    requiresAuth: false,
  })
  if (!result.success) throw new Error(`Weather API error: ${endpoint}`)
  return result.data
}

export const weatherService = {
  getCurrentWeather(query: string | WeatherQuery): Promise<CurrentWeather> {
    return weatherRequest<CurrentWeather>('/current', weatherParams(query))
  },

  getHourlyForecast(query: string | WeatherQuery, hours = 12): Promise<HourlyForecast[]> {
    return weatherRequest<HourlyForecast[]>('/hourly', { ...normalizeWeatherQuery(query), hours })
  },

  getDailyForecast(query: string | WeatherQuery, days = 7): Promise<DailyForecast[]> {
    return weatherRequest<DailyForecast[]>('/daily', { ...normalizeWeatherQuery(query), days })
  },

  getFarmingAlerts(query: string | WeatherQuery): Promise<FarmingAlert[]> {
    return weatherRequest<FarmingAlert[]>('/alerts', weatherParams(query))
  },

  getRainfallHistory(query: string | WeatherQuery, months = 12): Promise<RainfallHistory[]> {
    return weatherRequest<RainfallHistory[]>('/rainfall', { ...normalizeWeatherQuery(query), months })
  },
}
