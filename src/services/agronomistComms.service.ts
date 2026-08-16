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

export interface MessagingAudienceFilters {
  district?: string;
  sector?: string;
  cropType?: string;
}

export interface MessagingFilterOptions {
  districts: string[];
  sectors: string[];
  cropTypes: string[];
}

export interface BulkMessageResult {
  id: string;
  matchedCount: number;
  recipientCount: number;
  failedCount: number;
  status: string;
}

export type TicketChannel = 'USSD' | 'SMS' | 'Voice' | 'in-app';
export type TicketPriority = 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportTicket {
  id: string;
  farmerId: string;
  farmerName: string;
  agronomistId?: string | null;
  channel: TicketChannel;
  district: string;
  crop: string;
  issue: string;
  time: string;
  priority: TicketPriority;
  status: TicketStatus;
  lastReply: string | null;
  lastRepliedAt: string | null;
  resolvedAt: string | null;
}

export interface CreateSupportTicketPayload {
  farmerId: string;
  channel: TicketChannel;
  district: string;
  crop: string;
  issue: string;
  priority?: TicketPriority;
}

export interface SupportTicketsListResponse {
  tickets: SupportTicket[];
  pagination: Pagination;
}

// Confirmed via live response: { success, data: { tickets: [...], pagination } }.
// Fallback branches kept as harmless defense in depth, not because of remaining uncertainty.
function normalizeTicketsList(raw: unknown): SupportTicket[] {
  if (Array.isArray(raw)) return raw as SupportTicket[];
  const obj = raw as { tickets?: SupportTicket[]; items?: SupportTicket[] };
  return obj.tickets ?? obj.items ?? [];
}

export const agronomistCommsService = {
  async getAudienceCount(filters: MessagingAudienceFilters = {}): Promise<number> {
    const qs = new URLSearchParams();
    if (filters.district) qs.set('district', filters.district);
    if (filters.sector) qs.set('sector', filters.sector);
    if (filters.cropType) qs.set('cropType', filters.cropType);
    const query = qs.toString();
    const response = await fetch(`${API_URL}/messaging/audience-count${query ? `?${query}` : ''}`, { headers: authHeaders() });
    const data = await parseResponse<{ count: number }>(response);
    return data.count;
  },

  async getFilterOptions(): Promise<MessagingFilterOptions> {
    const response = await fetch(`${API_URL}/messaging/filter-options`, { headers: authHeaders() });
    return parseResponse<MessagingFilterOptions>(response);
  },

  // farmerId bypasses filters entirely and targets exactly that farmer — mutually
  // exclusive with filters (backend gives farmerId priority if both are sent, but
  // the caller should only ever pass one).
  async sendBulkMessage(message: string, target: MessagingAudienceFilters | { farmerId: string }): Promise<BulkMessageResult> {
    const body = 'farmerId' in target
      ? { message, farmerId: target.farmerId }
      : { message, filters: target };
    const response = await fetch(`${API_URL}/messaging/bulk`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return parseResponse<BulkMessageResult>(response);
  },

  async getSupportTickets(params: { page?: number; limit?: number; status?: TicketStatus; agronomistId?: string } = {}): Promise<SupportTicketsListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    if (params.agronomistId) qs.set('agronomistId', params.agronomistId);
    const query = qs.toString();
    const response = await fetch(`${API_URL}/support-tickets${query ? `?${query}` : ''}`, { headers: authHeaders() });
    const raw = await parseResponse<{ tickets?: SupportTicket[]; items?: SupportTicket[]; pagination: Pagination } | SupportTicket[]>(response);
    const pagination = Array.isArray(raw) ? { total: raw.length, page: 1, limit: raw.length, pages: 1 } : raw.pagination;
    return { tickets: normalizeTicketsList(raw), pagination };
  },

  async createSupportTicket(payload: CreateSupportTicketPayload): Promise<SupportTicket> {
    const response = await fetch(`${API_URL}/support-tickets`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<SupportTicket>(response);
  },

  async replyToTicket(id: string, reply: string): Promise<SupportTicket> {
    const response = await fetch(`${API_URL}/support-tickets/${id}/reply`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ reply }),
    });
    return parseResponse<SupportTicket>(response);
  },

  async resolveTicket(id: string): Promise<SupportTicket> {
    const response = await fetch(`${API_URL}/support-tickets/${id}/resolve`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return parseResponse<SupportTicket>(response);
  },
};
