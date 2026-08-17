import { buildApiUrl } from './api';
import { stripSensitiveFields } from '@/lib/sanitizeUser';
import type { Farm } from './farm';

const API_URL = buildApiUrl('/agronomists');

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || 'Request failed');
  }
  return result.data as T;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface FarmerListEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string | null;
  farmSize?: number | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export type FarmerCropStatus = 'planned' | 'planted' | 'growing' | 'harvested' | 'failed';

export interface CropCatalogEntry {
  id: string;
  name: string;
  scientificName: string | null;
  category: string;
  description: string | null;
  growthPeriod: number | null;
  waterNeed: string | null;
  soilType: string | null;
  optimalTemp: string | null;
  season: string | null;
  createdAt: string;
  updatedAt: string;
}

// Confirmed via live data: created a real FarmerCrop row and inspected the
// agronomist-side response directly.
export interface FarmerCropRecord {
  id: string;
  userId: string;
  farmId: string | null;
  cropId: string;
  plantingDate: string;
  expectedHarvestDate: string | null;
  actualHarvestDate: string | null;
  areaPlanted: number;
  status: FarmerCropStatus;
  yield: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  crop: CropCatalogEntry;
}

export interface FarmerDetail extends FarmerListEntry {
  updatedAt?: string;
  farms: Farm[];
  farmerCrops: FarmerCropRecord[];
}

export interface FarmersListResponse {
  farmers: FarmerListEntry[];
  pagination: Pagination;
}

export const agronomistFarmersService = {
  async getFarmers(params: { page?: number; limit?: number; search?: string } = {}): Promise<FarmersListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    const query = qs.toString();
    const response = await fetch(`${API_URL}/farmers${query ? `?${query}` : ''}`, { headers: authHeaders() });
    const data = await parseResponse<FarmersListResponse>(response);
    return { ...data, farmers: data.farmers.map(stripSensitiveFields) };
  },

  async getFarmerDetail(farmerId: string): Promise<FarmerDetail> {
    const response = await fetch(`${API_URL}/farmers/${farmerId}`, { headers: authHeaders() });
    const data = await parseResponse<FarmerDetail>(response);
    return stripSensitiveFields(data);
  },
};
