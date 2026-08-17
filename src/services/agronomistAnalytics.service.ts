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

// Confirmed via live data: created a real FarmerProfile+FarmPlan+FarmHarvest
// chain and inspected the response directly.
export interface YieldByProvinceEntry {
  province: string;
  pctImprovement: number;
}

// weeklyCurve's per-region fields are still unconfirmed — province names are
// dynamic object keys here (one per region with qualifying data that week),
// which is inherently generic by design, unlike byProvince's fixed shape.
// `week` (a date string, e.g. "2026-06-22") is the one confirmed, named field.
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
