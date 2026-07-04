const API_ROOT =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_BASE_API_URL ??
  '';
const API_BASE_URL = `${API_ROOT}/api/agro-dealer-marketplace`;

function getAuthHeaders(includeContentType = true): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || 'Request failed');
  }
  return result.data as T;
}

export interface MarketplaceDealer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  agroDealerProfile?: {
    businessName?: string;
    ownerFullName?: string;
    description?: string;
    district?: string;
    physicalAddress?: string;
    businessLogo?: string;
    categories?: string[];
  };
}

export interface AgroDealerProduct {
  id: string;
  agroDealerId: string;
  name: string;
  category: 'manure' | 'fertilizer' | 'pesticide' | 'seed' | 'veterinary' | 'other';
  description?: string;
  price: number;
  currency: string;
  quantity?: number;
  unit?: string;
  location?: string;
  district?: string;
  imageUrls?: string[];
  isAvailable: boolean;
  createdAt: string;
  agroDealer?: MarketplaceDealer;
}

export interface DealerConversation {
  id: string;
  farmerId: string;
  agroDealerId: string;
  productId?: string;
  status: 'open' | 'closed';
  lastMessage?: string;
  lastMessageAt?: string;
  farmer?: MarketplaceDealer;
  agroDealer?: MarketplaceDealer;
  product?: AgroDealerProduct;
}

export interface DealerMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface CreateProductInput {
  name: string;
  category: AgroDealerProduct['category'];
  description?: string;
  price: string;
  quantity?: string;
  unit?: string;
  location?: string;
  district?: string;
  isAvailable?: boolean;
  principalImage?: File | null;
  images?: File[];
}

export const agroDealerMarketplaceService = {
  getImageUrl(path?: string) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_ROOT}${path}`;
  },

  async getMarketplaceProducts(): Promise<AgroDealerProduct[]> {
    const response = await fetch(`${API_BASE_URL}/catalog/products`);
    return parseResponse<AgroDealerProduct[]>(response);
  },

  async getMyProducts(): Promise<AgroDealerProduct[]> {
    const response = await fetch(`${API_BASE_URL}/catalog/my-products`, {
      headers: getAuthHeaders(),
    });
    return parseResponse<AgroDealerProduct[]>(response);
  },

  async createProduct(input: CreateProductInput): Promise<AgroDealerProduct> {
    const formData = new FormData();
    formData.append('name', input.name);
    formData.append('category', input.category);
    formData.append('price', input.price);
    if (input.description) formData.append('description', input.description);
    if (input.quantity) formData.append('quantity', input.quantity);
    if (input.unit) formData.append('unit', input.unit);
    if (input.location) formData.append('location', input.location);
    if (input.district) formData.append('district', input.district);
    formData.append('isAvailable', String(input.isAvailable ?? true));
    if (input.principalImage) formData.append('principalImage', input.principalImage);
    input.images?.forEach((image) => formData.append('images', image));

    const response = await fetch(`${API_BASE_URL}/catalog/products`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: formData,
    });
    return parseResponse<AgroDealerProduct>(response);
  },

  async updateProduct(productId: string, payload: Partial<Pick<AgroDealerProduct, 'isAvailable' | 'price' | 'quantity' | 'location'>>) {
    const response = await fetch(`${API_BASE_URL}/catalog/products/${productId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<AgroDealerProduct>(response);
  },

  async getConversations(): Promise<DealerConversation[]> {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      headers: getAuthHeaders(),
    });
    return parseResponse<DealerConversation[]>(response);
  },

  async startConversation(payload: {
    agroDealerId?: string;
    farmerId?: string;
    productId?: string;
    initialMessage?: string;
  }): Promise<DealerConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<DealerConversation>(response);
  },

  async getMessages(conversationId: string): Promise<DealerMessage[]> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders(),
    });
    return parseResponse<DealerMessage[]>(response);
  },

  async sendMessage(conversationId: string, content: string): Promise<DealerMessage> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return parseResponse<DealerMessage>(response);
  },
};
