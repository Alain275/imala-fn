import api from './api'

/**
 * Real backend client for the Admin Dashboard's cooperative approval queue.
 *
 * Replaces the cooperative half of `adminMock.ts`, whose `_cooperatives` array
 * was an in-memory fixture — a cooperative created there vanished on refresh
 * and a real one registered through signup could never appear. The rest of
 * adminMock (users, crops, AI pages) still has no backend and is untouched.
 *
 * Every endpoint here is admin-only, enforced server-side by
 * protectRoute + restrictTo(ADMIN) on the /api/admin router.
 */

const authed = { requiresAuth: true } as const

interface Envelope<T> {
  success: boolean
  data: T
}

export type CooperativeStatus = 'pending' | 'active' | 'rejected' | 'suspended'

export interface AdminCooperative {
  id: string
  name: string
  district: string | null
  location: string | null
  registrationNumber: string | null
  status: CooperativeStatus
  rejectionReason: string | null
  contactEmail: string | null
  contactPhone: string | null
  description: string | null
  memberCount: number
  leader: { id: string; name: string; email: string; phone: string | null } | null
  approvedAt: string | null
  approvedBy: string | null
  registeredAt: string
}

export interface AdminCooperativeDetail extends AdminCooperative {
  farmsOwnedByMembers: number
  farmsLinkedToCooperative: number
}

export interface AdminCooperativeList {
  cooperatives: AdminCooperative[]
  summary: { pending: number; active: number; rejected: number }
  pagination: { total: number; page: number; limit: number; pages: number }
}

export const adminCooperativesApi = {
  /** Defaults to the pending review queue; pass 'all' for the full table. */
  async list(status: CooperativeStatus | 'all' = 'pending'): Promise<AdminCooperativeList> {
    const res = await api.request<Envelope<AdminCooperativeList>>(
      `/admin/cooperatives?status=${status}`,
      authed,
    )
    return res.data
  },

  async get(cooperativeId: string): Promise<AdminCooperativeDetail> {
    const res = await api.request<Envelope<{ cooperative: AdminCooperativeDetail }>>(
      `/admin/cooperatives/${cooperativeId}`,
      authed,
    )
    return res.data.cooperative
  },

  async approve(cooperativeId: string): Promise<AdminCooperative> {
    const res = await api.request<Envelope<{ cooperative: AdminCooperative }>>(
      `/admin/cooperatives/${cooperativeId}/approve`,
      { ...authed, method: 'PATCH' },
    )
    return res.data.cooperative
  },

  /** `reason` is mandatory server-side — the leader is told why. */
  async reject(cooperativeId: string, reason: string): Promise<AdminCooperative> {
    const res = await api.request<Envelope<{ cooperative: AdminCooperative }>>(
      `/admin/cooperatives/${cooperativeId}/reject`,
      { ...authed, method: 'PATCH', body: JSON.stringify({ reason }) },
    )
    return res.data.cooperative
  },
}
