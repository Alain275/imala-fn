export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  location?: string;
  farmSize?: number;
  role?: 'farmer' | 'agro-dealer' | 'agronomist' | 'admin' | 'cooperative';
  /**
   * Preferred alias for `role` on the API. Both are accepted; when both are
   * sent the server takes `accountType`. Kept optional so existing callers
   * that only send `role` are unaffected.
   */
  accountType?: 'farmer' | 'agro-dealer' | 'agronomist' | 'cooperative';
  // Cooperative signups only.
  cooperativeName?: string;
  district?: string;
  registrationNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      location?: string;
      farmSize?: number;
      role: string;
    };
    token: string;
    refreshToken?: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
    /** Present only for cooperative signups. */
    status?: 'pending_approval';
    cooperative?: {
      id: string;
      name: string;
      district: string | null;
      status: 'pending' | 'active' | 'rejected' | 'suspended';
    };
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  farmSize?: number;
  role: string;
}

const API_BASE_URL = buildApiUrl('');

export const authService = {
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw { response: { data: result, status: response.status } };
    }
    return result;
  },

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    if (result.success && result.data.token) {
      localStorage.setItem('token', result.data.token);
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(result.data.user));
      window.dispatchEvent(new Event('user-updated'));
    }

    return result;
  },

  async getProfile(): Promise<UserProfile> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      // Only force-logout in production — dev uses demo tokens that legitimately 401.
      if (response.status === 401 && !import.meta.env.DEV) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/sign-in';
      }
      throw {
        response: {
          data: result,
          status: response.status,
        },
      };
    }

    if (result.success) {
      localStorage.setItem('user', JSON.stringify(result.data));
    }

    return result.data;
  },

  // Called after a profile update to keep localStorage.user (and sidebar/header) in sync.
  // Dispatches 'user-updated' so subscribed components re-render without a page reload.
  async refreshUser(): Promise<void> {
    try {
      await this.getProfile() // fetches /auth/me and updates localStorage.user
      window.dispatchEvent(new Event('user-updated'))
    } catch {
      // silent — background sync; don't interrupt the UI
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser(): UserProfile | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token') && !!localStorage.getItem('user');
  },
};
import { buildApiUrl } from './api';
