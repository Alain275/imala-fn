import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  weatherService,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  FarmingAlert,
  RainfallHistory,
} from '@/services/weather'

interface WeatherState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function useWeatherFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  errorLabel: string
): WeatherState<T> {
  const [state, setState] = useState<WeatherState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : `Failed to load ${errorLabel}`
        setState({ data: null, loading: false, error: message })
        toast.error(`Weather error: ${message}`)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

export function useCurrentWeather(location: string) {
  return useWeatherFetch<CurrentWeather>(
    () => weatherService.getCurrentWeather(location),
    [location],
    'current weather'
  )
}

export function useHourlyForecast(location: string, hours = 12) {
  return useWeatherFetch<HourlyForecast[]>(
    () => weatherService.getHourlyForecast(location, hours),
    [location, hours],
    'hourly forecast'
  )
}

export function useDailyForecast(location: string, days = 7) {
  return useWeatherFetch<DailyForecast[]>(
    () => weatherService.getDailyForecast(location, days),
    [location, days],
    'daily forecast'
  )
}

export function useFarmingAlerts(location: string) {
  return useWeatherFetch<FarmingAlert[]>(
    () => weatherService.getFarmingAlerts(location),
    [location],
    'farming alerts'
  )
}

export function useRainfallHistory(location: string, months = 12) {
  return useWeatherFetch<RainfallHistory[]>(
    () => weatherService.getRainfallHistory(location, months),
    [location, months],
    'rainfall history'
  )
}
