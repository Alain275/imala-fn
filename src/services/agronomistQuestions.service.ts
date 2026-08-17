import { buildApiUrl } from './api';
import { stripSensitiveFields } from '@/lib/sanitizeUser';
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

export type QuestionStatus = 'pending' | 'answered' | 'closed';

export interface QuestionFarmerSummary {
  id: string;
  name: string;
  email: string;
}

export interface QuestionAgronomistSummary {
  id: string;
  name: string;
}

// Confirmed against a real answered question (created + answered + re-fetched
// fresh, not just the PATCH echo): farmer/agronomist are nested objects,
// answeredByName is real and present in both the pending and answered states,
// and there is no answeredAt field — status/updatedAt cover that.
export interface Question {
  id: string;
  farmerId: string;
  question: string;
  status: QuestionStatus;
  category: string;
  answer: string | null;
  answeredBy: string | null;
  answeredByName: string | null;
  createdAt: string;
  updatedAt: string;
  farmer: QuestionFarmerSummary;
  agronomist: QuestionAgronomistSummary | null;
}

export interface QuestionsListResponse {
  questions: Question[];
  pagination: Pagination;
}

function sanitizeQuestion(item: Question): Question {
  return {
    ...item,
    farmer: item.farmer ? stripSensitiveFields(item.farmer) : item.farmer,
    agronomist: item.agronomist ? stripSensitiveFields(item.agronomist) : item.agronomist,
  };
}

export const agronomistQuestionsService = {
  async getQuestions(params: { page?: number; limit?: number; status?: QuestionStatus } = {}): Promise<QuestionsListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    const query = qs.toString();
    const response = await fetch(`${API_URL}/questions${query ? `?${query}` : ''}`, { headers: authHeaders() });
    const data = await parseResponse<QuestionsListResponse>(response);
    return { ...data, questions: (data.questions ?? []).map(sanitizeQuestion) };
  },

  async answerQuestion(id: string, answer: string): Promise<Question> {
    const response = await fetch(`${API_URL}/questions/${id}/answer`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ answer }),
    });
    return sanitizeQuestion(await parseResponse<Question>(response));
  },
};
