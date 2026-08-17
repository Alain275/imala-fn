import { buildApiUrl } from './api';
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
    throw new Error(result?.message || 'Request failed');
  }
  return result.data as T;
}

export type AiValidationStatus = 'pending' | 'approved' | 'rejected' | 'modified';
export type AiValidationErrorCode =
  | '' | 'mismatched_soil' | 'outdated_window' | 'sensor_error'
  | 'region_mismatch' | 'crop_stage_error' | 'weather_conflict';

export interface AiValidationItem {
  id: number | string;
  farmerId: string;
  farmerName: string;
  district: string;
  cropType: string;
  recommendation: string;
  confidence: number;
  soilPH: number;
  nitrogenPPM: number;
  phosphorusPPM: number;
  potassiumPPM: number;
  // Always null for rules-based recommendations generated from a SoilTest —
  // that model has no moisture field. Confirmed live: the key is present with
  // value null, not omitted and not a fabricated 0.
  moisturePct: number | null;
  soilType: string;
  telemetryAge: string;
  status: AiValidationStatus;
  errorCode: AiValidationErrorCode;
  notes: string;
}

export interface AiValidationQueueResponse {
  items: AiValidationItem[];
  pagination: Pagination;
}

export const agronomistAiValidationService = {
  async getQueue(params: { minConfidence?: number; sortBy?: 'confidence' | 'farmer'; status?: AiValidationStatus; page?: number; limit?: number } = {}): Promise<AiValidationQueueResponse> {
    const qs = new URLSearchParams();
    if (params.minConfidence !== undefined) qs.set('minConfidence', String(params.minConfidence));
    if (params.sortBy) qs.set('sortBy', params.sortBy);
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    const response = await fetch(`${API_URL}/ai-validation-queue${query ? `?${query}` : ''}`, { headers: authHeaders() });
    return parseResponse<AiValidationQueueResponse>(response);
  },

  async reviewItem(id: number | string, action: 'approve' | 'reject' | 'modify', errorCode?: AiValidationErrorCode, notes?: string): Promise<AiValidationItem> {
    const response = await fetch(`${API_URL}/ai-validation-queue/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ action, ...(errorCode ? { errorCode } : {}), ...(notes ? { notes } : {}) }),
    });
    return parseResponse<AiValidationItem>(response);
  },
};
