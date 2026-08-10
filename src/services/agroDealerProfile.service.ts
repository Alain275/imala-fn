import { buildApiUrl } from './api';

const API_URL = buildApiUrl('');

export interface AgroDealerProfileData {
  // Basic Information
  businessLogo?: string;
  businessName?: string;
  ownerFullName?: string;
  description?: string;
  
  // Contact Information
  phone?: string;
  alternativePhone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  
  // Business Location
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  physicalAddress?: string;
  latitude?: number;
  longitude?: number;
  
  // Business Categories
  categories?: string[];
  
  // Business Information
  businessType?: string;
  yearsInBusiness?: number;
  licenseNumber?: string;
  tin?: string;
  
  // Delivery Information
  deliveryAvailable?: boolean;
  deliveryRadius?: number;
  deliveryFee?: number;
  estimatedDeliveryTime?: string;
  
  // Business Hours
  businessHours?: Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
  
  // Payment Methods
  paymentMethods?: string[];
  
  // Languages
  languages?: string[];
  
  // Social Media
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  
  // Business Images
  businessImages?: string[];
  
  // Verification Documents
  verificationDocuments?: string[];
  
  // AI Preferences
  aiPreferences?: {
    showInRecommendations?: boolean;
    allowAIRecommendation?: boolean;
    receiveDemandForecasts?: boolean;
    receiveStockRecommendations?: boolean;
    receiveSeasonalAlerts?: boolean;
  };
  
  // Notification Preferences
  notificationPreferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    orderNotifications?: boolean;
  };
}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function authHeaders(contentType = 'application/json'): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    ...(contentType ? { 'Content-Type': contentType } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || 'Request failed');
  }
  return result as ApiEnvelope<T>;
}

const agroDealerProfileService = {
  async getProfile() {
    const response = await fetch(`${API_URL}/agro-dealers/profile`, {
      headers: authHeaders(),
    });
    return parseEnvelope<AgroDealerProfileData>(response);
  },

  async updateProfile(data: Partial<AgroDealerProfileData>) {
    const response = await fetch(`${API_URL}/agro-dealers/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseEnvelope<AgroDealerProfileData>(response);
  },

  async uploadLogo(file: File) { 
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${API_URL}/agro-dealers/profile/logo`, {
      method: 'POST',
      headers: authHeaders(''),
      body: formData,
    });
    return parseEnvelope<{ logoUrl: string }>(response);
  },

  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await fetch(`${API_URL}/agro-dealers/profile/images`, {
      method: 'POST',
      headers: authHeaders(''),
      body: formData,
    });
    return parseEnvelope<{ imageUrls: string[] }>(response);
  },

  async uploadDocuments(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));

    const response = await fetch(`${API_URL}/agro-dealers/profile/documents`, {
      method: 'POST',
      headers: authHeaders(''),
      body: formData,
    });
    return parseEnvelope<{ documentUrls: string[] }>(response);
  },
};

export default agroDealerProfileService;
