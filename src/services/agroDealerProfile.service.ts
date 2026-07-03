import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const agroDealerProfileService = {
  // Get profile
  async getProfile() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/agro-dealers/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update profile
  async updateProfile(data: Partial<AgroDealerProfileData>) {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/agro-dealers/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Upload business logo
  async uploadLogo(file: File) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axios.post(
      `${API_URL}/agro-dealers/profile/logo`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Upload business images
  async uploadImages(files: File[]) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await axios.post(
      `${API_URL}/agro-dealers/profile/images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Upload verification documents
  async uploadDocuments(files: File[]) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    const response = await axios.post(
      `${API_URL}/agro-dealers/profile/documents`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default agroDealerProfileService;
