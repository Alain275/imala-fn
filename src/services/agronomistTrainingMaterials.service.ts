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
    // PATCH/DELETE on a material owned by another agronomist returns a generic
    // 404 by design (existence is hidden, not just access) — surface the
    // backend's message as-is rather than reframing it as a permission error.
    throw new Error(result?.message || 'Request failed');
  }
  return result.data as T;
}

export interface TrainingMaterialCreator {
  id: string;
  name: string;
}

export interface TrainingMaterial {
  id: string;
  createdBy: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  category: string;
  language: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  creator: TrainingMaterialCreator;
}

export interface TrainingMaterialsListResponse {
  materials: TrainingMaterial[];
  pagination: Pagination;
}

export interface CreateTrainingMaterialPayload {
  title: string;
  description: string;
  content: string;
  category: string;
  language?: string;
  videoUrl?: string;
  pdfUrl?: string;
}

export type UpdateTrainingMaterialPayload = Partial<CreateTrainingMaterialPayload> & { isPublished?: boolean };

export const agronomistTrainingMaterialsService = {
  async getMaterials(params: { page?: number; limit?: number; category?: string } = {}): Promise<TrainingMaterialsListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.category) qs.set('category', params.category);
    const query = qs.toString();
    const response = await fetch(`${API_URL}/training-materials${query ? `?${query}` : ''}`, { headers: authHeaders() });
    return parseResponse<TrainingMaterialsListResponse>(response);
  },

  // Real side effect: increments viewCount server-side on every call, including
  // the creator's own. Only call this on an explicit, user-initiated navigation
  // to the detail page — never on hover, list-mount, or background refresh.
  async getMaterial(id: string): Promise<TrainingMaterial> {
    const response = await fetch(`${API_URL}/training-materials/${id}`, { headers: authHeaders() });
    return parseResponse<TrainingMaterial>(response);
  },

  async createMaterial(payload: CreateTrainingMaterialPayload): Promise<TrainingMaterial> {
    const response = await fetch(`${API_URL}/training-materials`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<TrainingMaterial>(response);
  },

  async updateMaterial(id: string, payload: UpdateTrainingMaterialPayload): Promise<TrainingMaterial> {
    const response = await fetch(`${API_URL}/training-materials/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<TrainingMaterial>(response);
  },

  async deleteMaterial(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/training-materials/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result?.message || 'Failed to delete training material');
    }
  },
};
