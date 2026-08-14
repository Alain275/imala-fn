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

export type AdviceStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface AdviceFarmerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string | null;
}

export interface Advice {
  id: string;
  agronomistId: string;
  farmerId: string;
  farmId: string | null;
  title: string;
  problem: string;
  recommendation: string;
  status: AdviceStatus;
  createdAt: string;
  updatedAt: string;
  farmer: AdviceFarmerSummary;
  farm: Farm | null;
}

export interface AdviceListResponse {
  advice: Advice[];
  pagination: Pagination;
}

export interface CreateAdvicePayload {
  farmerId: string;
  farmId?: string;
  title: string;
  problem: string;
  recommendation: string;
}

export type UpdateAdvicePayload = Partial<CreateAdvicePayload> & { status?: AdviceStatus };

function sanitizeAdvice(item: Advice): Advice {
  return { ...item, farmer: stripSensitiveFields(item.farmer) };
}

// Confirmed via live response: { success, data: { advice: [...], pagination } }.
// Fallback branches kept as harmless defense in depth, not because of remaining uncertainty.
function normalizeAdviceList(raw: unknown): Advice[] {
  if (Array.isArray(raw)) return raw as Advice[];
  const obj = raw as { advice?: Advice[]; items?: Advice[] };
  return obj.advice ?? obj.items ?? [];
}

export const agronomistAdviceService = {
  async getAdviceList(params: { page?: number; limit?: number; status?: AdviceStatus } = {}): Promise<AdviceListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    const query = qs.toString();
    const response = await fetch(`${API_URL}/advice${query ? `?${query}` : ''}`, { headers: authHeaders() });
    const raw = await parseResponse<{ advice?: Advice[]; items?: Advice[]; pagination: Pagination } | Advice[]>(response);
    const pagination = Array.isArray(raw) ? { total: raw.length, page: 1, limit: raw.length, pages: 1 } : raw.pagination;
    return { advice: normalizeAdviceList(raw).map(sanitizeAdvice), pagination };
  },

  async getAdvice(id: string): Promise<Advice> {
    const response = await fetch(`${API_URL}/advice/${id}`, { headers: authHeaders() });
    return sanitizeAdvice(await parseResponse<Advice>(response));
  },

  async createAdvice(payload: CreateAdvicePayload): Promise<Advice> {
    const response = await fetch(`${API_URL}/advice`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return sanitizeAdvice(await parseResponse<Advice>(response));
  },

  async updateAdvice(id: string, payload: UpdateAdvicePayload): Promise<Advice> {
    const response = await fetch(`${API_URL}/advice/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return sanitizeAdvice(await parseResponse<Advice>(response));
  },

  async deleteAdvice(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/advice/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result?.message || 'Failed to delete advice');
    }
  },
};
