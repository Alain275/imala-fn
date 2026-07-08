import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  weatherService,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  FarmingAlert,
  RainfallHistory,
  WeatherQuery,
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

function queryKey(query: string | WeatherQuery): string {
  return typeof query === 'string'
    ? query
    : `${query.location ?? ''}:${query.lat ?? ''}:${query.lon ?? ''}`
}

export function useCurrentWeather(query: string | WeatherQuery) {
  return useWeatherFetch<CurrentWeather>(
    () => weatherService.getCurrentWeather(query),
    [queryKey(query)],
    'current weather'
  )
}

export function useHourlyForecast(query: string | WeatherQuery, hours = 12) {
  return useWeatherFetch<HourlyForecast[]>(
    () => weatherService.getHourlyForecast(query, hours),
    [queryKey(query), hours],
    'hourly forecast'
  )
}

export function useDailyForecast(query: string | WeatherQuery, days = 7) {
  return useWeatherFetch<DailyForecast[]>(
    () => weatherService.getDailyForecast(query, days),
    [queryKey(query), days],
    'daily forecast'
  )
}

export function useFarmingAlerts(query: string | WeatherQuery) {
  return useWeatherFetch<FarmingAlert[]>(
    () => weatherService.getFarmingAlerts(query),
    [queryKey(query)],
    'farming alerts'
  )
}

export function useRainfallHistory(query: string | WeatherQuery, months = 12) {
  return useWeatherFetch<RainfallHistory[]>(
    () => weatherService.getRainfallHistory(query, months),
    [queryKey(query), months],
    'rainfall history'
  )
}
