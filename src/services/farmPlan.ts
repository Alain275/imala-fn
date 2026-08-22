import api from './api';

export type FarmPlanStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type FarmPlanTaskStatus = 'pending' | 'completed' | 'missed';

export interface FarmPlanTask {
  id: string;
  farmPlanId: string;
  title: string;
  description?: string | null;
  category: string;
  dueDate: string;
  completedDate?: string | null;
  status: FarmPlanTaskStatus;
  priority: 'low' | 'medium' | 'high';
}

export interface FarmInputEstimate {
  id: string;
  farmPlanId: string;
  inputName: string;
  inputType: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  recommendedTiming?: string | null;
  notes?: string | null;
}

export interface FarmPlan {
  id: string;
  farmId?: string | null;
  cropName: string;
  season: string;
  locationName: string;
  farmSize: number;
  soilType?: string | null;
  plantingStartDate: string;
  plantingEndDate: string;
  expectedHarvestStartDate: string;
  expectedHarvestEndDate: string;
  estimatedCost: number;
  expectedYield: number;
  expectedRevenue: number;
  expectedProfit: number;
  status: FarmPlanStatus;
  notes?: string | null;
  tasks?: FarmPlanTask[];
  inputEstimates?: FarmInputEstimate[];
}

export interface CreateFarmPlanPayload {
  cropName: string;
  season: string;
  locationName: string;
  farmSize: number;
  soilType?: string;
  plantingStartDate: string;
  plantingEndDate?: string;
  notes?: string;
  inputEstimates?: EditableFarmInput[];
}


export type EditableFarmInput = Pick<
  FarmInputEstimate,
  'inputName' | 'inputType' | 'quantity' | 'unit' | 'unitCost' | 'recommendedTiming' | 'notes'
> & {
  totalCost?: number;
};

export interface FarmPlanInputEstimateResponse {
  inputEstimates: EditableFarmInput[];
  estimatedCost: number;
}

export interface FarmActivity {
  id: string;
  title: string;
  category: string;
  activityDate: string;
  notes?: string | null;
  cost: number;
  workerCount: number;
  workerDailyRate: number;
  areaWorked: number;
  seedQuantity: number;
  fertilizerQuantity: number;
  manureQuantity: number;
  materialCost: number;
  otherCost: number;
}

export interface FarmHarvest {
  id: string;
  harvestDate: string;
  quantityHarvested: number;
  quantitySold: number;
  quantityLost: number;
  quantityKept: number;
  unit: string;
  saleUnitPrice: number;
  revenue: number;
  buyer?: string | null;
  notes?: string | null;
}

export interface FarmExpense {
  id: string;
  category: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  expenseDate: string;
  supplier?: string | null;
  notes?: string | null;
}

export interface FarmManagement {
  activities: FarmActivity[];
  expenses: FarmExpense[];
  harvests: FarmHarvest[];
  summary: {
    plannedCost: number;
    actualExpenses: number;
    activityCosts: number;
    directExpenses: number;
    budgetRemaining: number;
    actualRevenue: number;
    actualProfit: number;
    totalHarvested: number;
    totalSold: number;
    totalAreaWorked: number;
    totalSeedUsed: number;
    totalFertilizerUsed: number;
    totalManureUsed: number;
  };
}

export interface CropRecommendation {
  key: string;
  cropName: string;
  suitability: 'high' | 'conditional' | 'low';
  reason: string;
}

export interface FarmPlanRecommendation {
  season: { id: 'A' | 'B' | 'C'; localName: string; months: string; planting: string; rainfall: string; harvest: string };
  recommendations: CropRecommendation[];
  plantingWindow: { plantingStartDate: string; plantingEndDate: string };
  preview: null | {
    plantingStartDate: string;
    plantingEndDate: string;
    expectedHarvestStartDate: string;
    expectedHarvestEndDate: string;
    inputEstimates: EditableFarmInput[];
    estimatedCost: number;
    expectedYield: number;
    expectedRevenue: number;
    expectedProfit: number;
  };
}

export interface RecommendationRequest {
  seasonId: 'A' | 'B' | 'C';
  seasonYear: number;
  cropName?: string;
  farmSize?: number;
  locationName?: string;
  soilType?: string;
  irrigationAvailable?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const farmPlanService = {
  async recommend(payload: RecommendationRequest): Promise<FarmPlanRecommendation> {
    const result = await api.request<ApiResponse<FarmPlanRecommendation>>('/farm-plans/recommend', {
      method: 'POST', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to generate farm recommendation');
    return result.data;
  },
  async estimateInputs(cropName: string, farmSize: number): Promise<FarmPlanInputEstimateResponse> {
    const result = await api.request<ApiResponse<FarmPlanInputEstimateResponse>>('/farm-plans/estimate', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ cropName, farmSize }),
    });
    if (!result.success) throw new Error(result.message || 'Failed to estimate farm inputs');
    return result.data;
  },

  async list(): Promise<FarmPlan[]> {
    const result = await api.request<ApiResponse<FarmPlan[]>>('/farm-plans', {
      requiresAuth: true,
    });
    if (!result.success) throw new Error(result.message || 'Failed to load farm plans');
    return result.data;
  },

  async create(payload: CreateFarmPlanPayload): Promise<FarmPlan> {
    const result = await api.request<ApiResponse<FarmPlan>>('/farm-plans', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to create farm plan');
    return result.data;
  },

  async update(id: string, payload: CreateFarmPlanPayload): Promise<FarmPlan> {
    const result = await api.request<ApiResponse<FarmPlan>>(`/farm-plans/${id}`, {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to update farm plan');
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const result = await api.request<ApiResponse<never>>(`/farm-plans/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
    if (!result.success) throw new Error(result.message || 'Failed to delete farm plan');
  },

  async updateStatus(id: string, status: FarmPlanStatus): Promise<FarmPlan> {
    const result = await api.request<ApiResponse<FarmPlan>>(`/farm-plans/${id}/status`, {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify({ status }),
    });
    if (!result.success) throw new Error(result.message || 'Failed to update farm plan');
    return result.data;
  },

  async updateTask(planId: string, taskId: string, status: FarmPlanTaskStatus): Promise<FarmPlanTask> {
    const result = await api.request<ApiResponse<FarmPlanTask>>(`/farm-plans/${planId}/tasks/${taskId}`, {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify({ status }),
    });
    if (!result.success) throw new Error(result.message || 'Failed to update task');
    return result.data;
  },

  async getManagement(planId: string): Promise<FarmManagement> {
    const result = await api.request<ApiResponse<FarmManagement>>(`/farm-plans/${planId}/manage`, { requiresAuth: true });
    if (!result.success) throw new Error(result.message || 'Failed to load farm records');
    return result.data;
  },

  async addActivity(planId: string, payload: Omit<FarmActivity, 'id' | 'cost'>): Promise<FarmActivity> {
    const result = await api.request<ApiResponse<FarmActivity>>(`/farm-plans/${planId}/activities`, {
      method: 'POST', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to record activity');
    return result.data;
  },

  async updateActivity(planId: string, activityId: string, payload: Omit<FarmActivity, 'id' | 'cost'>): Promise<FarmActivity> {
    const result = await api.request<ApiResponse<FarmActivity>>(`/farm-plans/${planId}/activities/${activityId}`, {
      method: 'PATCH', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to update farm activity');
    return result.data;
  },

  async deleteActivity(planId: string, activityId: string): Promise<void> {
    const result = await api.request<ApiResponse<never>>(`/farm-plans/${planId}/activities/${activityId}`, {
      method: 'DELETE', requiresAuth: true,
    });
    if (!result.success) throw new Error(result.message || 'Failed to delete farm activity');
  },

  async addHarvest(planId: string, payload: Omit<FarmHarvest, 'id' | 'revenue'>): Promise<FarmHarvest> {
    const result = await api.request<ApiResponse<FarmHarvest>>(`/farm-plans/${planId}/harvests`, {
      method: 'POST', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to record harvest');
    return result.data;
  },

  async updateHarvest(planId: string, harvestId: string, payload: Omit<FarmHarvest, 'id' | 'revenue'>): Promise<FarmHarvest> {
    const result = await api.request<ApiResponse<FarmHarvest>>(`/farm-plans/${planId}/harvests/${harvestId}`, {
      method: 'PATCH', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to update harvest');
    return result.data;
  },

  async deleteHarvest(planId: string, harvestId: string): Promise<void> {
    const result = await api.request<ApiResponse<never>>(`/farm-plans/${planId}/harvests/${harvestId}`, {
      method: 'DELETE', requiresAuth: true,
    });
    if (!result.success) throw new Error(result.message || 'Failed to delete harvest');
  },

  async addExpense(planId: string, payload: Omit<FarmExpense, 'id' | 'totalCost'>): Promise<FarmExpense> {
    const result = await api.request<ApiResponse<FarmExpense>>(`/farm-plans/${planId}/expenses`, {
      method: 'POST', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to record expense');
    return result.data;
  },

  async updateExpense(planId: string, expenseId: string, payload: Omit<FarmExpense, 'id' | 'totalCost'>): Promise<FarmExpense> {
    const result = await api.request<ApiResponse<FarmExpense>>(`/farm-plans/${planId}/expenses/${expenseId}`, {
      method: 'PATCH', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to update expense');
    return result.data;
  },

  async deleteExpense(planId: string, expenseId: string): Promise<void> {
    const result = await api.request<ApiResponse<never>>(`/farm-plans/${planId}/expenses/${expenseId}`, {
      method: 'DELETE', requiresAuth: true,
    });
    if (!result.success) throw new Error(result.message || 'Failed to delete expense');
  },
};
