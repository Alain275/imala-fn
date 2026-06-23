// ─────────────────────────────────────────────────────────────────────────────
// Admin Mock Service
// TODO: replace with real /api/admin endpoints when backend is ready.
// Flip USE_MOCK_ADMIN to false and swap each function body for a real fetch call.
// ─────────────────────────────────────────────────────────────────────────────

export const USE_MOCK_ADMIN = true

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number
  farmerCount: number
  agronomistCount: number
  cooperativeCount: number
  adminCount: number
  activeToday: number
  newThisWeek: number
  growthRate: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'farmer' | 'agronomist' | 'admin' | 'cooperative'
  status: 'active' | 'inactive'
  joinedAt: string
  lastLogin: string
  location?: string
}

export interface Cooperative {
  id: string
  name: string
  location: string
  memberCount: number
  memberCapacity: number
  contactPerson: string
  contactPhone: string
  contactEmail: string
  status: 'active' | 'inactive'
  joinedAt: string
  notes?: string
}

export interface CooperativeInput {
  name: string
  location: string
  memberCapacity: number
  contactPerson: string
  contactPhone: string
  contactEmail: string
  status: 'active' | 'inactive'
  notes?: string
}

export type CropCategory = 'cereal' | 'legume' | 'vegetable' | 'tuber' | 'fruit' | 'cash crop'

export interface Crop {
  id: string
  name: string
  scientificName?: string
  category: CropCategory
  growingSeason: string
  growthDurationDays: number
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface CropInput {
  name: string
  scientificName?: string
  category: CropCategory
  growingSeason: string
  growthDurationDays: number
  description?: string
  status: 'active' | 'inactive'
}

export interface UserGrowthPoint {
  month: string
  farmers: number
  agronomists: number
  cooperatives: number
}

export interface UsersParams {
  page?: number
  pageSize?: number
  search?: string
  role?: AdminUser['role'] | 'all'
  status?: 'active' | 'inactive' | 'all'
}

export interface AdminActivityItem {
  id: string
  action: string
  detail: string
  createdAt: string
}

export interface CropsParams {
  page?: number
  pageSize?: number
  search?: string
  category?: CropCategory | 'all'
  status?: 'active' | 'inactive' | 'all'
}

// ── In-memory stores ───────────────────────────────────────────────────────────

let _users: AdminUser[] = [
  { id: 'u1', name: 'Jean Habimana', email: 'jean.h@imara.rw', role: 'farmer', status: 'active', joinedAt: '2025-01-12', lastLogin: '2026-06-22', location: 'Kigali' },
  { id: 'u2', name: 'Amina Uwase', email: 'amina.u@imara.rw', role: 'farmer', status: 'active', joinedAt: '2025-02-05', lastLogin: '2026-06-21', location: 'Bugesera' },
  { id: 'u3', name: 'Patrick Nkurunziza', email: 'p.nkurunziza@imara.rw', role: 'agronomist', status: 'active', joinedAt: '2025-01-20', lastLogin: '2026-06-23', location: 'Musanze' },
  { id: 'u4', name: 'Claire Mutesi', email: 'c.mutesi@imara.rw', role: 'agronomist', status: 'active', joinedAt: '2025-03-10', lastLogin: '2026-06-20', location: 'Huye' },
  { id: 'u5', name: 'COOPAC Rwamagana', email: 'admin@coopac.rw', role: 'cooperative', status: 'active', joinedAt: '2025-04-01', lastLogin: '2026-06-18', location: 'Rwamagana' },
  { id: 'u6', name: 'Emmanuel Bizimana', email: 'e.bizimana@imara.rw', role: 'farmer', status: 'inactive', joinedAt: '2025-05-14', lastLogin: '2026-04-10', location: 'Gatsibo' },
  { id: 'u7', name: 'Grace Ingabire', email: 'g.ingabire@imara.rw', role: 'farmer', status: 'active', joinedAt: '2025-06-01', lastLogin: '2026-06-22', location: 'Nyagatare' },
  { id: 'u8', name: 'Felix Irakoze', email: 'f.irakoze@imara.rw', role: 'agronomist', status: 'active', joinedAt: '2025-07-08', lastLogin: '2026-06-23', location: 'Kigali' },
  { id: 'u9', name: 'KOABURA Cooperative', email: 'info@koabura.rw', role: 'cooperative', status: 'inactive', joinedAt: '2025-08-12', lastLogin: '2026-05-01', location: 'Kayonza' },
  { id: 'u10', name: 'Alice Uwimana', email: 'a.uwimana@imara.rw', role: 'farmer', status: 'active', joinedAt: '2025-09-03', lastLogin: '2026-06-21', location: 'Rubavu' },
  { id: 'u11', name: 'David Nzeyimana', email: 'd.nzeyimana@imara.rw', role: 'farmer', status: 'active', joinedAt: '2025-10-17', lastLogin: '2026-06-19', location: 'Gicumbi' },
  { id: 'u12', name: 'Sandrine Mukandekezi', email: 's.mukandekezi@imara.rw', role: 'agronomist', status: 'active', joinedAt: '2025-11-22', lastLogin: '2026-06-23', location: 'Bugesera' },
  { id: 'u13', name: 'Admin User', email: 'admin@imara.rw', role: 'admin', status: 'active', joinedAt: '2025-01-01', lastLogin: '2026-06-23', location: 'Kigali' },
]

let _cooperatives: Cooperative[] = [
  { id: 'c1', name: 'COOPAC Rwamagana', location: 'Rwamagana, Eastern Province', memberCount: 284, memberCapacity: 400, contactPerson: 'Théoneste Habimana', contactPhone: '+250 788 123 456', contactEmail: 'admin@coopac.rw', status: 'active', joinedAt: '2025-04-01' },
  { id: 'c2', name: 'KOABURA Cooperative', location: 'Kayonza, Eastern Province', memberCount: 156, memberCapacity: 250, contactPerson: 'Jeanne Mukamana', contactPhone: '+250 722 654 321', contactEmail: 'info@koabura.rw', status: 'inactive', joinedAt: '2025-08-12', notes: 'Pending reactivation review.' },
  { id: 'c3', name: 'ABIRUHA Farmers Group', location: 'Musanze, Northern Province', memberCount: 312, memberCapacity: 500, contactPerson: 'Patrick Nsenga', contactPhone: '+250 788 987 654', contactEmail: 'abiruha@imara.rw', status: 'active', joinedAt: '2025-02-15' },
  { id: 'c4', name: 'INGABO Cooperative', location: 'Huye, Southern Province', memberCount: 97, memberCapacity: 200, contactPerson: 'Solange Uwimana', contactPhone: '+250 722 111 222', contactEmail: 'ingabo@imara.rw', status: 'active', joinedAt: '2025-06-20' },
]

let _crops: Crop[] = [
  { id: 'cr1', name: 'Maize', scientificName: 'Zea mays', category: 'cereal', growingSeason: 'Mar–Jun, Sep–Dec', growthDurationDays: 90, description: 'Primary staple grain crop grown across all provinces.', status: 'active', createdAt: '2025-01-10' },
  { id: 'cr2', name: 'Beans', scientificName: 'Phaseolus vulgaris', category: 'legume', growingSeason: 'Mar–Jun, Sep–Dec', growthDurationDays: 75, description: 'Most widely cultivated legume; key protein source.', status: 'active', createdAt: '2025-01-10' },
  { id: 'cr3', name: 'Cassava', scientificName: 'Manihot esculenta', category: 'tuber', growingSeason: 'Year-round', growthDurationDays: 270, description: 'Drought-tolerant root crop with strong food security role.', status: 'active', createdAt: '2025-01-15' },
  { id: 'cr4', name: 'Irish Potato', scientificName: 'Solanum tuberosum', category: 'tuber', growingSeason: 'Mar–Jun, Sep–Dec', growthDurationDays: 110, status: 'active', createdAt: '2025-02-01' },
  { id: 'cr5', name: 'Tomato', scientificName: 'Solanum lycopersicum', category: 'vegetable', growingSeason: 'Sep–Dec', growthDurationDays: 60, status: 'active', createdAt: '2025-02-10' },
  { id: 'cr6', name: 'Sorghum', scientificName: 'Sorghum bicolor', category: 'cereal', growingSeason: 'Feb–May', growthDurationDays: 120, description: 'Drought-resistant grain suitable for semi-arid zones.', status: 'active', createdAt: '2025-03-01' },
  { id: 'cr7', name: 'Coffee', scientificName: 'Coffea arabica', category: 'cash crop', growingSeason: 'Year-round (harvest Oct–Feb)', growthDurationDays: 365, description: 'Rwanda\'s primary export cash crop.', status: 'active', createdAt: '2025-03-15' },
  { id: 'cr8', name: 'Banana', scientificName: 'Musa spp.', category: 'fruit', growingSeason: 'Year-round', growthDurationDays: 300, status: 'active', createdAt: '2025-04-01' },
  { id: 'cr9', name: 'Rice', scientificName: 'Oryza sativa', category: 'cereal', growingSeason: 'Mar–Jul, Sep–Jan', growthDurationDays: 130, description: 'Cultivated in marshland and irrigated valleys.', status: 'active', createdAt: '2025-04-15' },
  { id: 'cr10', name: 'Peas', scientificName: 'Pisum sativum', category: 'legume', growingSeason: 'Mar–Jun', growthDurationDays: 60, status: 'inactive', createdAt: '2025-05-01' },
]

// ── Service ───────────────────────────────────────────────────────────────────

export const adminService = {
  // TODO: replace with GET /api/admin/stats
  async getStats(): Promise<AdminStats> {
    await delay()
    return {
      totalUsers: _users.length,
      farmerCount: _users.filter(u => u.role === 'farmer').length,
      agronomistCount: _users.filter(u => u.role === 'agronomist').length,
      cooperativeCount: _users.filter(u => u.role === 'cooperative').length,
      adminCount: _users.filter(u => u.role === 'admin').length,
      activeToday: 8,
      newThisWeek: 3,
      growthRate: 12.4,
    }
  },

  // TODO: replace with GET /api/admin/users
  async getUsers(params: UsersParams = {}): Promise<{ data: AdminUser[]; total: number }> {
    await delay()
    const { page = 1, pageSize = 10, search = '', role = 'all', status = 'all' } = params
    let filtered = [..._users]
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (role !== 'all') filtered = filtered.filter(u => u.role === role)
    if (status !== 'all') filtered = filtered.filter(u => u.status === status)
    const total = filtered.length
    const data = filtered.slice((page - 1) * pageSize, page * pageSize)
    return { data, total }
  },

  // TODO: replace with PATCH /api/admin/users/:id/role
  async updateUserRole(id: string, role: AdminUser['role']): Promise<AdminUser> {
    await delay(400)
    const idx = _users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('User not found')
    _users[idx] = { ..._users[idx], role }
    return _users[idx]
  },

  // TODO: replace with PATCH /api/admin/users/:id/status
  async setUserActive(id: string, active: boolean): Promise<AdminUser> {
    await delay(400)
    const idx = _users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('User not found')
    _users[idx] = { ..._users[idx], status: active ? 'active' : 'inactive' }
    return _users[idx]
  },

  // TODO: replace with DELETE /api/admin/users/:id
  async deleteUser(id: string): Promise<void> {
    await delay(500)
    _users = _users.filter(u => u.id !== id)
  },

  // TODO: replace with GET /api/admin/cooperatives
  async getCooperatives(): Promise<Cooperative[]> {
    await delay()
    return [..._cooperatives]
  },

  // TODO: replace with POST /api/admin/cooperatives
  async createCooperative(input: CooperativeInput): Promise<Cooperative> {
    await delay(600)
    const newCoop: Cooperative = {
      id: `c${Date.now()}`,
      ...input,
      memberCount: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    }
    _cooperatives = [newCoop, ..._cooperatives]
    return newCoop
  },

  // TODO: replace with PATCH /api/admin/cooperatives/:id
  async updateCooperative(id: string, input: Partial<CooperativeInput>): Promise<Cooperative> {
    await delay(500)
    const idx = _cooperatives.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Cooperative not found')
    _cooperatives[idx] = { ..._cooperatives[idx], ...input }
    return _cooperatives[idx]
  },

  // TODO: replace with DELETE /api/admin/cooperatives/:id
  async deleteCooperative(id: string): Promise<void> {
    await delay(500)
    _cooperatives = _cooperatives.filter(c => c.id !== id)
  },

  // TODO: replace with GET /api/admin/crops
  async getCrops(params: CropsParams = {}): Promise<{ data: Crop[]; total: number }> {
    await delay()
    const { page = 1, pageSize = 10, search = '', category = 'all', status = 'all' } = params
    let filtered = [..._crops]
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || (c.scientificName ?? '').toLowerCase().includes(q))
    }
    if (category !== 'all') filtered = filtered.filter(c => c.category === category)
    if (status !== 'all') filtered = filtered.filter(c => c.status === status)
    const total = filtered.length
    const data = filtered.slice((page - 1) * pageSize, page * pageSize)
    return { data, total }
  },

  // TODO: replace with POST /api/admin/crops
  async createCrop(input: CropInput): Promise<Crop> {
    await delay(600)
    const newCrop: Crop = {
      id: `cr${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString().split('T')[0],
    }
    _crops = [newCrop, ..._crops]
    return newCrop
  },

  // TODO: replace with PATCH /api/admin/crops/:id
  async updateCrop(id: string, input: Partial<CropInput>): Promise<Crop> {
    await delay(500)
    const idx = _crops.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Crop not found')
    _crops[idx] = { ..._crops[idx], ...input }
    return _crops[idx]
  },

  // TODO: replace with DELETE /api/admin/crops/:id
  async deleteCrop(id: string): Promise<void> {
    await delay(500)
    _crops = _crops.filter(c => c.id !== id)
  },

  // TODO: replace with GET /api/admin/activity
  async getAdminActivity(): Promise<AdminActivityItem[]> {
    await delay(400)
    return [
      { id: 'act1', action: 'Model Deployed', detail: 'EfficientNet-B2 v3.0.0 deployed to production', createdAt: '2026-05-18T09:14:00Z' },
      { id: 'act2', action: 'User Deactivated', detail: 'Emmanuel Bizimana (e.bizimana@imara.rw) — inactive account', createdAt: '2026-06-10T14:32:00Z' },
      { id: 'act3', action: 'Cooperative Registered', detail: 'INGABO Cooperative — Huye, Southern Province', createdAt: '2026-06-20T11:05:00Z' },
      { id: 'act4', action: 'Training Job Started', detail: 'Run #4 — EfficientNet-B2, dataset v2.4.0', createdAt: '2026-05-15T08:00:00Z' },
      { id: 'act5', action: 'Platform Settings Updated', detail: 'AI Review Policy: manual review enabled', createdAt: '2026-06-15T16:22:00Z' },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/user-growth
  async getUserGrowth(): Promise<UserGrowthPoint[]> {
    await delay()
    return [
      { month: 'Jan', farmers: 120, agronomists: 8, cooperatives: 1 },
      { month: 'Feb', farmers: 185, agronomists: 10, cooperatives: 2 },
      { month: 'Mar', farmers: 260, agronomists: 12, cooperatives: 2 },
      { month: 'Apr', farmers: 340, agronomists: 14, cooperatives: 3 },
      { month: 'May', farmers: 430, agronomists: 15, cooperatives: 4 },
      { month: 'Jun', farmers: 510, agronomists: 17, cooperatives: 4 },
    ]
  },

  // TODO: replace with GET /api/admin/analytics/activity
  async getPlatformActivity(): Promise<{ day: string; logins: number; scans: number; advisories: number }[]> {
    await delay()
    return [
      { day: 'Mon', logins: 42, scans: 18, advisories: 25 },
      { day: 'Tue', logins: 65, scans: 24, advisories: 38 },
      { day: 'Wed', logins: 55, scans: 20, advisories: 31 },
      { day: 'Thu', logins: 78, scans: 31, advisories: 44 },
      { day: 'Fri', logins: 60, scans: 27, advisories: 35 },
      { day: 'Sat', logins: 28, scans: 12, advisories: 15 },
      { day: 'Sun', logins: 18, scans: 8, advisories: 9 },
    ]
  },
}
