import { buildApiUrl } from './api';

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

export interface AgronomistDirectoryEntry {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  agronomistProfile?: {
    district: string;
    sector: string;
    specialization: string;
    yearsOfExperience: number;
    bio?: string;
    isVerified: boolean;
  };
}

export interface AgronomistProfilePayload {
  district: string;
  sector: string;
  specialization: string;
  yearsOfExperience: number;
  bio?: string;
}

export const agronomistService = {
  async getDirectory(district?: string): Promise<AgronomistDirectoryEntry[]> {
    const params = new URLSearchParams();
    if (district) params.set('district', district);
    const query = params.toString();
    const response = await fetch(`${API_URL}/directory${query ? `?${query}` : ''}`, { headers: authHeaders() });
    return parseResponse<AgronomistDirectoryEntry[]>(response);
  },

  async getMyProfile() {
    const response = await fetch(`${API_URL}/profile`, { headers: authHeaders() });
    return parseResponse<any>(response);
  },

  async updateMyProfile(payload: AgronomistProfilePayload) {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<any>(response);
  },
};
