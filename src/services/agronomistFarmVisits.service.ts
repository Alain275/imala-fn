import { buildApiUrl } from './api';
import { stripSensitiveFields } from '@/lib/sanitizeUser';
import type { Farm } from './farm';
import type { Pagination } from './agronomistFarmers.service';

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
    const err = new Error(result?.message || 'Request failed') as Error & { data?: unknown };
    err.data = result?.data;
    throw err;
  }
  return result.data as T;
}

export type FarmVisitStatus = 'scheduled' | 'completed' | 'cancelled';
export type FarmVisitType = 'office' | 'farm' | 'meeting' | 'break';
export type FarmVisitSeverity = 'low' | 'medium' | 'high';

export interface FarmVisitFarmerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string | null;
}

export interface FarmVisit {
  id: string;
  agronomistId: string;
  farmerId: string;
  farmId: string | null;
  visitDate: string;
  observations: string;
  recommendations: string;
  nextVisitDate?: string | null;
  status: FarmVisitStatus;
  severity: FarmVisitSeverity | null;
  coordinates?: { latitude: number; longitude: number } | null;
  type: FarmVisitType;
  duration?: number | null;
  createdAt: string;
  updatedAt: string;
  farmer: FarmVisitFarmerSummary;
  farm: Farm | null;
}

export interface FarmVisitsListResponse {
  visits: FarmVisit[];
  pagination: Pagination;
}

export interface CreateFarmVisitPayload {
  farmerId: string;
  farmId?: string;
  visitDate: string;
  observations: string;
  recommendations: string;
  nextVisitDate?: string;
  severity?: FarmVisitSeverity;
  coordinates?: { latitude: number; longitude: number };
  type?: FarmVisitType;
  duration?: number;
}

export type UpdateFarmVisitPayload = Partial<CreateFarmVisitPayload> & { status?: FarmVisitStatus };

function sanitizeVisit(visit: FarmVisit): FarmVisit {
  return { ...visit, farmer: stripSensitiveFields(visit.farmer) };
}

export const agronomistFarmVisitsService = {
  async getFarmVisits(params: { page?: number; limit?: number; status?: FarmVisitStatus } = {}): Promise<FarmVisitsListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    const query = qs.toString();
    const response = await fetch(`${API_URL}/farm-visits${query ? `?${query}` : ''}`, { headers: authHeaders() });
    const data = await parseResponse<FarmVisitsListResponse>(response);
    return { ...data, visits: data.visits.map(sanitizeVisit) };
  },

  async getFarmVisit(id: string): Promise<FarmVisit> {
    const response = await fetch(`${API_URL}/farm-visits/${id}`, { headers: authHeaders() });
    return sanitizeVisit(await parseResponse<FarmVisit>(response));
  },

  async createFarmVisit(payload: CreateFarmVisitPayload): Promise<FarmVisit> {
    const response = await fetch(`${API_URL}/farm-visits`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return sanitizeVisit(await parseResponse<FarmVisit>(response));
  },

  async updateFarmVisit(id: string, payload: UpdateFarmVisitPayload): Promise<FarmVisit> {
    const response = await fetch(`${API_URL}/farm-visits/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return sanitizeVisit(await parseResponse<FarmVisit>(response));
  },
};
