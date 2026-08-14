import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { agronomistFarmersService, type FarmerListEntry } from '@/services/agronomistFarmers.service'
import type { Farm } from '@/services/farm'

/**
 * Shared farmer/farm-picker logic for any create/edit form that needs a
 * farmerId + optional farmId (farm-visits, advice — same server-side
 * auto-resolve behavior: omit farmId with exactly one farm, required picker
 * with 2+, and a 400-with-real-choices fallback if the server disagrees).
 */
export function useAgronomistFarmerFarmPicker() {
  const [farmers, setFarmers] = useState<FarmerListEntry[]>([])
  const [selectedFarmerFarms, setSelectedFarmerFarms] = useState<Farm[]>([])
  const [farmsLoading, setFarmsLoading] = useState(false)

  const ensureFarmers = useCallback(() => {
    setFarmers(current => {
      if (current.length === 0) {
        agronomistFarmersService.getFarmers({ limit: 200 })
          .then(({ farmers }) => setFarmers(farmers))
          .catch(() => toast.error("Failed to load farmers list"))
      }
      return current
    })
  }, [])

  const loadFarmsForFarmer = useCallback((farmerId: string) => {
    if (!farmerId) { setSelectedFarmerFarms([]); return }
    setFarmsLoading(true)
    agronomistFarmersService.getFarmerDetail(farmerId)
      .then(detail => setSelectedFarmerFarms(detail.farms))
      .catch(() => toast.error("Failed to load this farmer's farms"))
      .finally(() => setFarmsLoading(false))
  }, [])

  const extractFarmChoicesFromError = useCallback((err: unknown): Farm[] | null => {
    const data = (err as { data?: { farms?: Farm[] } })?.data
    return data?.farms?.length ? data.farms : null
  }, [])

  return {
    farmers,
    ensureFarmers,
    selectedFarmerFarms,
    setSelectedFarmerFarms,
    farmsLoading,
    loadFarmsForFarmer,
    extractFarmChoicesFromError,
  }
}
