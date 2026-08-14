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

export interface AnalyticsDailyBreakdownPoint {
  day: string;
  resolved: number;
  escalated: number;
}

export interface AnalyticsTicketsSummary {
  resolvedThisWeek: number;
  avgResolutionHours: number;
  fieldVisitsCompleted: number;
  fieldVisitsPlanned: number;
  escalationRatePct: number;
  dailyBreakdown: AnalyticsDailyBreakdownPoint[];
}

// byProvince is always empty in the captured sample (no qualifying data yet),
// so its per-item field names are entirely unconfirmed — rendered generically
// rather than assuming named fields. weeklyCurve is only PARTIALLY unconfirmed:
// `week` (a date string, e.g. "2026-06-22") is real and confirmed on every
// point — only the per-region percentage fields are unconfirmed, since none
// were present yet in the sample (no qualifying yield data). The `week` field
// is typed explicitly below, not folded into the generic fallback.
export type YieldByProvinceEntry = Record<string, unknown>;
export type YieldWeeklyCurvePoint = { week: string } & Record<string, unknown>;

export interface AnalyticsYieldSummary {
  byProvince: YieldByProvinceEntry[];
  weeklyCurve: YieldWeeklyCurvePoint[];
}

export const agronomistAnalyticsService = {
  async getTicketsAnalytics(): Promise<AnalyticsTicketsSummary> {
    const response = await fetch(`${API_URL}/analytics/tickets`, { headers: authHeaders() });
    return parseResponse<AnalyticsTicketsSummary>(response);
  },

  async getYieldAnalytics(): Promise<AnalyticsYieldSummary> {
    const response = await fetch(`${API_URL}/analytics/yield`, { headers: authHeaders() });
    return parseResponse<AnalyticsYieldSummary>(response);
  },
};
