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

// district/sector/yearsOfExperience/bio are the only fields PATCH /profile accepts.
// specialization and certificationNumber are set at registration and are read-only here.
export interface AgronomistProfileUpdatePayload {
  district?: string;
  sector?: string;
  yearsOfExperience?: number;
  bio?: string;
}

export interface AgronomistProfileDetails {
  id: string;
  userId: string;
  district: string;
  sector: string;
  specialization: string;
  yearsOfExperience: number;
  certificationNumber: string;
  bio?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgronomistFullProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location?: string | null;
  farmSize?: number | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  agronomistProfile: AgronomistProfileDetails | null;
}

export const agronomistService = {
  async getDirectory(district?: string): Promise<AgronomistDirectoryEntry[]> {
    const params = new URLSearchParams();
    if (district) params.set('district', district);
    const query = params.toString();
    const response = await fetch(`${API_URL}/directory${query ? `?${query}` : ''}`, { headers: authHeaders() });
    return parseResponse<AgronomistDirectoryEntry[]>(response);
  },

  async getMyProfile(): Promise<AgronomistFullProfile> {
    const response = await fetch(`${API_URL}/profile`, { headers: authHeaders() });
    return parseResponse<AgronomistFullProfile>(response);
  },

  async updateMyProfile(payload: AgronomistProfileUpdatePayload): Promise<AgronomistProfileDetails> {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<AgronomistProfileDetails>(response);
  },
};
