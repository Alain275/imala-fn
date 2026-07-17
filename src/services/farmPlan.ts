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
>;

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
  summary: { plannedCost: number; actualExpenses: number; budgetRemaining: number };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const farmPlanService = {
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

  async addActivity(planId: string, payload: Omit<FarmActivity, 'id'>): Promise<FarmActivity> {
    const result = await api.request<ApiResponse<FarmActivity>>(`/farm-plans/${planId}/activities`, {
      method: 'POST', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to record activity');
    return result.data;
  },

  async addExpense(planId: string, payload: Omit<FarmExpense, 'id' | 'totalCost'>): Promise<FarmExpense> {
    const result = await api.request<ApiResponse<FarmExpense>>(`/farm-plans/${planId}/expenses`, {
      method: 'POST', requiresAuth: true, body: JSON.stringify(payload),
    });
    if (!result.success) throw new Error(result.message || 'Failed to record expense');
    return result.data;
  },
};
