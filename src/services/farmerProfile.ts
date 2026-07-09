import api from './api'

export type FarmerGender = 'female' | 'male' | 'other' | 'prefer-not-to-say'

export interface FarmerProfileData {
  personal: {
    fullName: string
    phone: string
    nationalId?: string
    gender: FarmerGender
    age: number
    district: string
    sector: string
    cell: string
    village: string
  }
  farming: {
    farmingTypes: string[]
    landSize: number
    yearsFarming: number
    usesIrrigation: boolean
  }
  farms: Array<{
    farmName: string
    farmSize: number
    farmLocation: string
    cropType: string
    plantingDate: string
    seedType: string
  }>
  completedAt: string
}

interface FarmerProfileApiResponse {
  completed: boolean
  profile: {
    nationalId?: string
    gender: FarmerGender
    age: number
    district: string
    sector: string
    cell: string
    village: string
    farmingTypes: string[]
    landSize: number
    yearsFarming: number
    usesIrrigation: boolean
    completedAt?: string
  } | null
  farms: Array<{
    farmName: string
    size: number
    location: string
    currentCrop?: string
    plantingDate?: string
    seedVariety?: string
  }>
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const completionKey = (userId: string) => `imara_farmer_profile_complete_${userId}`

function mapFromApi(data: FarmerProfileApiResponse, fallback?: { name?: string; phone?: string }): FarmerProfileData | null {
  if (!data.profile) return null
  const firstFarm = data.farms[0]
  return {
    personal: {
      fullName: fallback?.name ?? '',
      phone: fallback?.phone ?? '',
      nationalId: data.profile.nationalId ?? '',
      gender: data.profile.gender,
      age: Number(data.profile.age),
      district: data.profile.district,
      sector: data.profile.sector,
      cell: data.profile.cell,
      village: data.profile.village,
    },
    farming: {
      farmingTypes: data.profile.farmingTypes,
      landSize: Number(data.profile.landSize),
      yearsFarming: Number(data.profile.yearsFarming),
      usesIrrigation: data.profile.usesIrrigation,
    },
    farms: firstFarm
      ? [{
          farmName: firstFarm.farmName,
          farmSize: Number(firstFarm.size),
          farmLocation: firstFarm.location,
          cropType: firstFarm.currentCrop ?? '',
          plantingDate: firstFarm.plantingDate ? firstFarm.plantingDate.slice(0, 10) : '',
          seedType: firstFarm.seedVariety ?? '',
        }]
      : [],
    completedAt: data.profile.completedAt ?? '',
  }
}

export const farmerProfileService = {
  getCachedCompletion(userId?: string | null): boolean | null {
    if (!userId) return null
    const value = localStorage.getItem(completionKey(userId))
    return value === null ? null : value === 'true'
  },

  setCachedCompletion(userId: string, completed: boolean) {
    localStorage.setItem(completionKey(userId), String(completed))
  },

  async get(fallback?: { name?: string; phone?: string }): Promise<{ completed: boolean; profile: FarmerProfileData | null }> {
    const result = await api.request<ApiResponse<FarmerProfileApiResponse>>('/farmer-profile', {
      requiresAuth: true,
    })
    return {
      completed: result.data.completed,
      profile: mapFromApi(result.data, fallback),
    }
  },

  async save(userId: string, data: Omit<FarmerProfileData, 'completedAt'>): Promise<FarmerProfileData> {
    const result = await api.request<ApiResponse<FarmerProfileApiResponse>>('/farmer-profile', {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    })
    this.setCachedCompletion(userId, result.data.completed)
    window.dispatchEvent(new Event('farmer-profile-updated'))
    return mapFromApi(result.data, {
      name: data.personal.fullName,
      phone: data.personal.phone,
    }) as FarmerProfileData
  },
}
