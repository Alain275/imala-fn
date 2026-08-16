import { buildApiUrl } from './api';
import type { Pagination } from './agronomistFarmers.service';

const API_URL = buildApiUrl('/agronomists');
const DISEASE_API_URL = buildApiUrl('/disease');

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

export type TreatmentType = 'organic' | 'chemical';
export type TreatmentStock = 'in_stock' | 'low' | 'out';

export interface Treatment {
  id: string;
  product: string;
  type: TreatmentType;
  activeIngredient: string;
  dosage: string;
  targetDisease: string;
  rwandaCompliant: boolean;
  organic: boolean;
  withdrawalDays: number;
  stock: TreatmentStock;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentsListResponse {
  treatments: Treatment[];
  pagination: Pagination;
}

// Confirmed request shape.
export interface CreatePrescriptionPayload {
  farmerId: string;
  cropType: string;
  district?: string;
  diagnosisName: string;
  pathogenName?: string;
  diseaseDetectionId?: string;
  treatmentId: string;
  dosageOverride?: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  smsText: string;
  sentAt: string;
  recipientFarmerId: string;
  deliveryStatus: string;
  deliveredVia: 'notification-only' | 'realtime' | string;
}

// Confirmed via live GET /api/disease/pending: the AI model returns exactly ONE
// prediction per detection (aiDisease/aiConfidence), not a ranked list of matches.
export type DiseaseDetectionStatus = 'pending_review' | 'verified' | 'rejected';

export interface DiseaseDetection {
  id: string;
  userId: string;
  farmId: string | null;
  cropId: string | null;
  imageUrl: string | null;
  aiDisease: string;
  aiCrop: string;
  aiConfidence: number;
  aiConfidenceReliable: boolean;
  aiConfidenceReason: string | null;
  symptoms: string;
  treatment: string;
  prevention: string;
  status: DiseaseDetectionStatus;
  verifiedDisease: string | null;
  verifiedTreatment: string | null;
  agronomistComment: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PendingDetectionsResponse {
  detections: DiseaseDetection[];
  pagination: Pagination;
}

export type VerifyDiseaseStatus = 'verified' | 'rejected';

export interface VerifyDetectionPayload {
  status: VerifyDiseaseStatus;
  verifiedDisease?: string;
  verifiedTreatment?: string;
  agronomistComment?: string;
}

export const agronomistPathologyService = {
  async getTreatments(params: { search?: string; organicOnly?: boolean; rwandaCompliantOnly?: boolean; targetDisease?: string; page?: number; limit?: number } = {}): Promise<TreatmentsListResponse> {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.organicOnly) qs.set('organicOnly', 'true');
    if (params.rwandaCompliantOnly) qs.set('rwandaCompliantOnly', 'true');
    if (params.targetDisease) qs.set('targetDisease', params.targetDisease);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    const response = await fetch(`${API_URL}/treatments${query ? `?${query}` : ''}`, { headers: authHeaders() });
    return parseResponse<TreatmentsListResponse>(response);
  },

  async createPrescription(payload: CreatePrescriptionPayload): Promise<Prescription> {
    const response = await fetch(`${API_URL}/prescriptions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<Prescription>(response);
  },

  async getPendingDetections(params: { page?: number; limit?: number } = {}): Promise<PendingDetectionsResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    const response = await fetch(`${DISEASE_API_URL}/pending${query ? `?${query}` : ''}`, { headers: authHeaders() });
    return parseResponse<PendingDetectionsResponse>(response);
  },

  async verifyDetection(id: string, payload: VerifyDetectionPayload): Promise<DiseaseDetection> {
    const response = await fetch(`${DISEASE_API_URL}/${id}/verify`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<DiseaseDetection>(response);
  },
};
