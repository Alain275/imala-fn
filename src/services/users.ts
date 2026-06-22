import api from './api'

// Note: auth.ts has a slim UserProfile for auth state (name/email/role/etc).
// This is the full version from GET /users/profile, which adds verification and timestamp fields.
export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  location?: string
  farmSize?: number
  isEmailVerified: boolean
  isActive: boolean
  lastLogin: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  location?: string
  farmSize?: number
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface DeleteAccountInput {
  password: string
}

interface ApiResponse<T = undefined> {
  success: boolean
  data?: T
  message?: string
}

async function userRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const result = await api.request<ApiResponse<T>>(endpoint, {
    requiresAuth: true,
    ...options,
  })
  if (!result.success) throw new Error(result.message || `Users API error: ${endpoint}`)
  return result.data as T
}

export const userService = {
  getProfile(): Promise<UserProfile> {
    return userRequest<UserProfile>('/users/profile')
  },

  updateProfile(body: UpdateProfileInput): Promise<UserProfile> {
    return userRequest<UserProfile>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  changePassword(body: ChangePasswordInput): Promise<void> {
    return userRequest<void>('/users/password', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  deleteAccount(body: DeleteAccountInput): Promise<void> {
    return userRequest<void>('/users/account', {
      method: 'DELETE',
      body: JSON.stringify(body),
    })
  },
}
