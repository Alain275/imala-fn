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

export interface GisDistrict {
  id: string;
  name: string;
  sector: string;
  fieldCount: number;
  totalAreaSqm: number;
  lastScoutedAt: string | null;
}

export const agronomistGisService = {
  async getDistricts(): Promise<GisDistrict[]> {
    const response = await fetch(`${API_URL}/gis/districts`, { headers: authHeaders() });
    return parseResponse<GisDistrict[]>(response);
  },
};
