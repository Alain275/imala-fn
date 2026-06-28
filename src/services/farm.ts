const API_BASE_URL = 'https://imara-bn.onrender.com/api';

export interface Farm {
  id: string;
  userId: string;
  farmName: string;
  size: number;
  location: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  soilType?: string;
  irrigationType?: 'rain-fed' | 'drip' | 'sprinkler' | 'flood' | 'none';
  currentCrop?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  seedVariety?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'inactive' | 'fallow';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmData {
  farmName: string;
  size: number;
  district: string;
  sector: string;
  cell: string;
  village: string;
  location?: string;
  soilType?: string;
  irrigationType?: 'rain-fed' | 'drip' | 'sprinkler' | 'flood' | 'none';
  currentCrop?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  seedVariety?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export interface FarmStats {
  totalFarms: number;
  activeFarms: number;
  totalArea: number;
  farmsByDistrict: Array<{ district: string; count: number }>;
}

export const farmService = {
  async createFarm(data: CreateFarmData): Promise<{ success: boolean; message: string; data: Farm }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/farms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        response: {
          data: result,
          status: response.status,
        },
      };
    }

    return result;
  },

  async getFarms(params?: {
    status?: string;
    district?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      farms: Farm[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    };
  }> {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params as any);
    
    const response = await fetch(`${API_BASE_URL}/farms?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        response: {
          data: result,
          status: response.status,
        },
      };
    }

    return result;
  },

  async getFarmById(id: string): Promise<{ success: boolean; data: Farm }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        response: {
          data: result,
          status: response.status,
        },
      };
    }

    return result;
  },

  async updateFarm(id: string, data: Partial<CreateFarmData>): Promise<{ success: boolean; message: string; data: Farm }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        response: {
          data: result,
          status: response.status,
        },
      };
    }

    return result;
  },

  async deleteFarm(id: string): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        response: {
          data: result,
          status: response.status,
        },
      };
    }

    return result;
  },

  async getStats(): Promise<{ success: boolean; data: FarmStats }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/farms/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        response: {
          data: result,
          status: response.status,
        },
      };
    }

    return result;
  },
};
