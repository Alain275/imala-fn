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

export interface DashboardWeeklyActivityPoint {
  day: string;
  visits: number;
  tickets: number;
  resolved: number;
}

export interface DashboardRecentActivityItem {
  type: string;
  text: string;
  timestamp?: string;
}

export interface DashboardPreviousWeek {
  ticketsResolved: number;
  fieldVisits: number;
  messagesSent: number;
  avgConfidence: number;
}

export interface AgronomistDashboardSummary {
  ticketsResolved: number;
  fieldVisits: number;
  messagesSent: number;
  avgConfidence: number;
  yieldImprovementPct: number;
  weeklyActivity: DashboardWeeklyActivityPoint[];
  // No yieldImprovementPct equivalent here — that stays platform-wide/non-comparable.
  previousWeek: DashboardPreviousWeek;
  recentActivity: DashboardRecentActivityItem[];
}

export const agronomistDashboardService = {
  async getSummary(): Promise<AgronomistDashboardSummary> {
    const response = await fetch(`${API_URL}/dashboard-summary`, { headers: authHeaders() });
    return parseResponse<AgronomistDashboardSummary>(response);
  },
};
