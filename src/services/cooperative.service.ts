import api from './api'
import type {
  AiInsightItem,
  BulkSaleOrder,
  CooperativeFarm,
  CooperativeMember,
  CooperativeStats,
  FarmStatus,
  FarmStatusItem,
  NewMemberData,
  YieldDataPoint,
} from './cooperativeMock'

/**
 * Real backend client for the Cooperative Dashboard.
 *
 * Replaces the in-memory `cooperativeService` in cooperativeMock.ts for every
 * screen that now has a backend. The exported types are still imported from
 * that file so the page components do not have to change their type imports —
 * the mock's DATA is dead, its TYPE definitions are the shared contract.
 *
 * Every endpoint is scoped server-side to the caller's own cooperative,
 * resolved from the JWT. Nothing here sends a cooperativeId.
 */

const authed = { requiresAuth: true } as const

interface Envelope<T> {
  success: boolean
  data: T
}

// ─── Overview ────────────────────────────────────────────────────────────────

interface MetricsPayload {
  totalFarms: { value: number; pendingReview: number }
  activeMembers: { value: number }
  totalYield: { value: number }
  cropsPlanted: { value: number }
  aiAlerts: { value: number }
  seasonProgress: { value: number | null }
}

interface YieldTrendPayload {
  months: string[]
  series: { crop: string; color: string; values: number[] }[]
}

interface FarmStatusPayload {
  segments: { status: FarmStatus; count: number }[]
  unclassified: number
  total: number
}

interface AiInsightPayload {
  id: string
  type: 'alert' | 'market' | 'soil' | 'weather'
  textKey: string | null
  text: string
  timestamp: string
  actionUrl: string | null
}

/**
 * The Overview page's INSIGHT_META only maps alert/market/soil. The API can
 * also return 'weather', which would blow up the icon lookup, so weather
 * insights are filtered out here rather than crashing the panel. Remove this
 * once INSIGHT_META gains a weather entry.
 */
const RENDERABLE_INSIGHT_TYPES = new Set(['alert', 'market', 'soil'])

/** Turns an ISO timestamp into the relative-time i18n key the panel expects. */
function relativeTimeKey(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return '1h'
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export const cooperativeApi = {
  async getStats(season?: string): Promise<CooperativeStats> {
    const query = season ? `?season=${encodeURIComponent(season)}` : ''
    const res = await api.request<Envelope<MetricsPayload>>(`/cooperative/metrics${query}`, authed)
    const d = res.data
    return {
      totalFarms: d.totalFarms.value,
      pendingReview: d.totalFarms.pendingReview,
      activeMembers: d.activeMembers.value,
      totalYield: d.totalYield.value,
      cropsPlanted: d.cropsPlanted.value,
      aiAlerts: d.aiAlerts.value,
      seasonProgress: d.seasonProgress.value ?? 0,
    }
  },

  /**
   * The API is column-oriented ({ months, series }); the AreaChart binds to
   * rows. The chart's three hardcoded dataKeys are maize/beans/potato, so the
   * pivot targets those names and falls back to 0 for a cooperative that grows
   * something else — the series list is whatever this cooperative actually
   * harvested, not a fixed triple.
   */
  async getYieldTrend(season?: string): Promise<YieldDataPoint[]> {
    const query = season ? `?season=${encodeURIComponent(season)}` : ''
    const res = await api.request<Envelope<YieldTrendPayload>>(
      `/cooperative/yield-trend${query}`,
      authed,
    )
    const find = (name: string) =>
      res.data.series.find(s => s.crop.toLowerCase().includes(name))?.values ?? []
    const maize = find('maize')
    const beans = find('bean')
    const potato = find('potato')
    return res.data.months.map((month, i) => ({
      month,
      maize: maize[i] ?? 0,
      beans: beans[i] ?? 0,
      potato: potato[i] ?? 0,
    }))
  },

  async getFarmStatus(): Promise<FarmStatusItem[]> {
    const res = await api.request<Envelope<FarmStatusPayload>>('/cooperative/farm-status', authed)
    return res.data.segments.map(s => ({ key: s.status, value: s.count }))
  },

  async getAiInsights(limit = 3): Promise<AiInsightItem[]> {
    const res = await api.request<Envelope<{ insights: AiInsightPayload[] }>>(
      `/cooperative/ai-insights?limit=${limit}`,
      authed,
    )
    return res.data.insights
      .filter(i => RENDERABLE_INSIGHT_TYPES.has(i.type))
      .map(i => ({
        id: i.id,
        type: i.type as AiInsightItem['type'],
        textKey: i.textKey ?? i.text,
        time: relativeTimeKey(i.timestamp),
      }))
  },

  async dismissInsight(id: string): Promise<void> {
    await api.request(`/cooperative/ai-insights/${id}/dismiss`, {
      ...authed,
      method: 'PATCH',
    })
  },

  // ─── Members ───────────────────────────────────────────────────────────────

  async getMembers(): Promise<CooperativeMember[]> {
    const res = await api.request<
      Envelope<{
        members: {
          id: string
          name: string
          phone: string | null
          email: string
          location: string | null
          role: CooperativeMember['role']
          status: CooperativeMember['status']
          farmsCount: number
          joinedDate: string
        }[]
      }>
    >('/cooperative/members?limit=200', authed)
    return res.data.members.map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone ?? '',
      email: m.email,
      location: m.location ?? '',
      role: m.role,
      farmsCount: m.farmsCount,
      status: m.status,
      joinedDate: m.joinedDate?.slice(0, 10) ?? '',
    }))
  },

  async addMember(data: NewMemberData): Promise<CooperativeMember> {
    const res = await api.request<
      Envelope<{
        member: {
          id: string
          name: string
          phone: string | null
          email: string
          location: string | null
          role: CooperativeMember['role']
          status: CooperativeMember['status']
          farmsCount: number
          joinedDate: string
        }
        userCreated: boolean
      }>
    >('/cooperative/members', {
      ...authed,
      method: 'POST',
      body: JSON.stringify(data),
    })
    const m = res.data.member
    return {
      id: m.id,
      name: m.name,
      phone: m.phone ?? '',
      email: m.email,
      location: m.location ?? '',
      role: m.role,
      farmsCount: m.farmsCount,
      status: m.status,
      joinedDate: m.joinedDate?.slice(0, 10) ?? '',
    }
  },

  async removeMember(id: string): Promise<void> {
    await api.request(`/cooperative/members/${id}`, { ...authed, method: 'DELETE' })
  },

  // ─── Farms ─────────────────────────────────────────────────────────────────

  async getFarms(): Promise<CooperativeFarm[]> {
    const res = await api.request<
      Envelope<{
        farms: {
          id: string
          name: string
          farmerName: string | null
          phone: string | null
          location: string
          sector: string
          sizeHa: number
          currentCrop: string | null
          lastYieldTons: number
          status: FarmStatus | null
          pendingReview: boolean
          joinedDate: string
        }[]
      }>
    >('/cooperative/farms?limit=200', authed)
    return res.data.farms.map(f => ({
      id: f.id,
      name: f.name,
      farmerName: f.farmerName ?? '',
      location: f.location,
      sector: f.sector,
      sizeHa: f.sizeHa,
      crops: f.currentCrop ? [f.currentCrop] : [],
      lastYieldTons: f.lastYieldTons,
      // No season-over-season delta is computed per farm server-side yet, so
      // this is reported as 0 rather than invented.
      yieldChange: 0,
      status: f.status ?? 'inactive',
      pendingReview: f.pendingReview,
      phone: f.phone ?? '',
      joinedDate: f.joinedDate?.slice(0, 10) ?? '',
      lastActivity: f.joinedDate?.slice(0, 10) ?? '',
    }))
  },

  async updateFarmStatus(id: string, status: FarmStatus): Promise<void> {
    await api.request(`/cooperative/farms/${id}/status`, {
      ...authed,
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  // ─── Bulk orders ───────────────────────────────────────────────────────────

  async getBulkOrders(): Promise<BulkSaleOrder[]> {
    const res = await api.request<
      Envelope<{
        orders: {
          id: string
          crop: string
          quantityTons: number
          targetPricePerKg: number
          buyer: string
          status: BulkSaleOrder['status']
          createdDate: string
        }[]
      }>
    >('/cooperative/bulk-orders?limit=200', authed)
    return res.data.orders.map(o => ({
      id: o.id,
      crop: o.crop,
      quantityTons: o.quantityTons,
      targetPricePerKg: o.targetPricePerKg,
      status: o.status,
      buyer: o.buyer,
      createdDate: o.createdDate?.slice(0, 10) ?? '',
    }))
  },

  async createBulkOrder(
    data: Omit<BulkSaleOrder, 'id' | 'status' | 'createdDate'>,
  ): Promise<BulkSaleOrder> {
    const res = await api.request<
      Envelope<{
        id: string
        crop: string
        quantityTons: number
        targetPricePerKg: number
        buyer: string
        status: BulkSaleOrder['status']
        createdDate: string
      }>
    >('/cooperative/bulk-orders', {
      ...authed,
      method: 'POST',
      body: JSON.stringify(data),
    })
    const o = res.data
    return {
      id: o.id,
      crop: o.crop,
      quantityTons: o.quantityTons,
      targetPricePerKg: o.targetPricePerKg,
      status: o.status,
      buyer: o.buyer,
      createdDate: o.createdDate?.slice(0, 10) ?? '',
    }
  },

  // ─── Approval status ───────────────────────────────────────────────────────

  /**
   * Works BEFORE approval — it is the one cooperative endpoint mounted ahead
   * of the server's resolveCooperative guard. Everything else 403s with
   * COOPERATIVE_NOT_APPROVED until an admin approves.
   */
  async getApprovalStatus(): Promise<CooperativeApprovalStatus> {
    const res = await api.request<Envelope<CooperativeApprovalStatus>>(
      '/cooperative/status',
      authed,
    )
    return res.data
  },

  // ─── Membership workflow ───────────────────────────────────────────────────

  async searchFarmers(query: string): Promise<FarmerSearchResult[]> {
    const res = await api.request<Envelope<{ farmers: FarmerSearchResult[] }>>(
      `/cooperative/members/search?query=${encodeURIComponent(query)}`,
      authed,
    )
    return res.data.farmers
  },

  /** Enrols an EXISTING farmer account. Never creates a user. */
  async addMemberByFarmerId(farmerId: string): Promise<CooperativeMember> {
    const res = await api.request<Envelope<{ member: CooperativeMember }>>(
      '/cooperative/members',
      { ...authed, method: 'POST', body: JSON.stringify({ farmerId }) },
    )
    return res.data.member
  },

  /** Every farm this member already registered, flagged with link state. */
  async getAvailableFarms(memberId: string): Promise<AvailableFarm[]> {
    const res = await api.request<Envelope<{ farms: AvailableFarm[] }>>(
      `/cooperative/members/${memberId}/available-farms`,
      authed,
    )
    return res.data.farms
  },

  /** Registers a chosen subset of the member's farms under the cooperative. */
  async linkFarms(memberId: string, farmIds: string[]): Promise<AvailableFarm[]> {
    const res = await api.request<Envelope<{ farms: AvailableFarm[] }>>(
      `/cooperative/members/${memberId}/farms`,
      { ...authed, method: 'POST', body: JSON.stringify({ farmIds }) },
    )
    return res.data.farms
  },

  /** Removes the link only — the farm and its owner are untouched. */
  async unlinkFarm(memberId: string, farmId: string): Promise<void> {
    await api.request<Envelope<unknown>>(
      `/cooperative/members/${memberId}/farms/${farmId}`,
      { ...authed, method: 'DELETE' },
    )
  },

  async getMemberDetail(memberId: string): Promise<MemberDetail> {
    const res = await api.request<Envelope<MemberDetail>>(
      `/cooperative/members/${memberId}`,
      authed,
    )
    return res.data
  },

  // ─── Profile / Plan / Marketplace / Agronomists ────────────────────────────

  async getProfile(): Promise<CooperativeProfile> {
    const res = await api.request<Envelope<{ profile: CooperativeProfile }>>(
      '/cooperative/profile',
      authed,
    )
    return res.data.profile
  },

  async updateProfile(patch: CooperativeProfilePatch): Promise<CooperativeProfile> {
    const res = await api.request<Envelope<{ profile: CooperativeProfile }>>(
      '/cooperative/profile',
      { ...authed, method: 'PATCH', body: JSON.stringify(patch) },
    )
    return res.data.profile
  },

  async getPlan(season?: string): Promise<CooperativePlan> {
    const query = season ? `?season=${encodeURIComponent(season)}` : ''
    const res = await api.request<Envelope<CooperativePlan>>(`/cooperative/plan${query}`, authed)
    return res.data
  },

  async getMarketplace(all = false): Promise<CooperativeMarketplace> {
    const res = await api.request<Envelope<CooperativeMarketplace>>(
      `/cooperative/marketplace${all ? '?all=true' : ''}`,
      authed,
    )
    return res.data
  },

  async getAgronomists(all = false): Promise<CooperativeAgronomists> {
    const res = await api.request<Envelope<CooperativeAgronomists>>(
      `/cooperative/agronomists${all ? '?all=true' : ''}`,
      authed,
    )
    return res.data
  },
}

// ─── Types for the endpoints added above ─────────────────────────────────────
// These mirror the server response shapes one-for-one. They live here rather
// than in cooperativeMock.ts because they never had a mock counterpart.

export interface CooperativeApprovalStatus {
  cooperative: {
    id: string
    name: string
    district: string | null
    status: 'pending' | 'active' | 'rejected' | 'suspended'
    rejectionReason: string | null
    registeredAt: string
    approvedAt: string | null
  }
  memberRole: string
  canAccessDashboard: boolean
}

export interface FarmerSearchResult {
  id: string
  name: string
  email: string
  phone: string | null
  location: string | null
  membership: {
    isMemberOfYourCooperative: boolean
    isMemberOfAnotherCooperative: boolean
  } | null
}

export interface AvailableFarm {
  id: string
  name: string
  sizeSqm: number
  sizeHa: number
  crop: string | null
  location: string
  district: string
  sector: string
  status: string
  alreadyLinked: boolean
}

export interface MemberDetail {
  member: CooperativeMember
  farms: AvailableFarm[]
  summary: {
    farmsOwned: number
    farmsLinked: number
    linkedAreaSqm: number
    totalYieldKg: number
  }
  yieldContributions: Array<{
    farmId: string
    farmName: string | null
    season: string | null
    yieldKg: number
  }>
}

export interface CooperativeProfile {
  id: string
  name: string
  district: string | null
  location: string | null
  registrationNumber: string | null
  description: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: string
  registeredAt: string
  approvedAt: string | null
  leader: { id: string; name: string; email: string; phone: string | null } | null
  memberCount: number
  activeMemberCount: number
  registeredFarmCount: number
}

export interface CooperativeProfilePatch {
  contactEmail?: string
  contactPhone?: string
  description?: string
  location?: string
}

export interface CooperativePlan {
  season: string | null
  summary: { plans: number; farms: number; activePlans: number; tasksDue: number }
  byCrop: Array<{
    crop: string
    plans: number
    areaSqm: number
    expectedYieldKg: number
    harvestedKg: number
  }>
  plans: Array<{
    id: string
    farmId: string
    farmName: string
    member: string
    crop: string
    season: string
    status: string
    areaSqm: number
    expectedYieldKg: number
    harvestedKg: number
    tasksTotal: number
    tasksDone: number
    plantingStartDate: string
    expectedHarvestEndDate: string
  }>
}

export interface CooperativeMarketplace {
  matchedCrops: string[]
  filteredByCrops: boolean
  products: Array<{
    id: string
    name: string
    category: string
    price: number
    currency: string
    isAvailable: boolean
    dealer: { id: string; name: string; location: string | null; phone: string | null }
  }>
}

export interface CooperativeAgronomists {
  district: string | null
  scopedToDistrict: boolean
  agronomists: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    location: string | null
    specialization: string | null
    district: string | null
    sector: string | null
    yearsOfExperience: number | null
    bio: string | null
  }>
}
