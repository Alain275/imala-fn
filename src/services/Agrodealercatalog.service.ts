import { buildApiUrl } from './api';

const API_URL = buildApiUrl('');

export type ProductCategory = 'manure' | 'fertilizer' | 'pesticide' | 'seed' | 'veterinary' | 'other';

export interface Product {
  id: string;
  agroDealerId: string;
  name: string;
  category: ProductCategory;
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
  updatedAt: string;
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

export const parseEnvelope = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || 'Request failed');
  }
  return result as ApiEnvelope<T>;
}

const agroDealerCatalogService = {
  async listMyProducts() {
    const response = await fetch(`${API_URL}/agro-dealer-marketplace/catalog/my-products`, {
      headers: authHeaders(),
    });
    
    return parseEnvelope<Product[]>(response);
  },

  async listLowStock(threshold = 10) {
    const response = await fetch(
      `${API_URL}/agro-dealer-marketplace/catalog/products/low-stock?threshold=${threshold}`,
      { headers: authHeaders() }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || 'Request failed');
    }
    return result as { success: boolean; data: Product[]; threshold: number };
  },

  async getById(productId: string) {
    const response = await fetch(`${API_URL}/agro-dealer-marketplace/catalog/products/${productId}`);
    return parseEnvelope<Product>(response);
  },

  async create(formData: FormData) {
    const response = await fetch(`${API_URL}/agro-dealer-marketplace/catalog/products`, {
      method: 'POST',
      headers: authHeaders(''),
      body: formData,
    });
    return parseEnvelope<Product>(response);
  },

  async update(productId: string, data: Partial<Product>) {
    const response = await fetch(`${API_URL}/agro-dealer-marketplace/catalog/products/${productId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseEnvelope<Product>(response);
  },

  async remove(productId: string) {
    const response = await fetch(`${API_URL}/agro-dealer-marketplace/catalog/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return parseEnvelope<null>(response);
  },

  async listCategories() {
    const response = await fetch(`${API_URL}/agro-dealer-marketplace/catalog/categories`);
    return parseEnvelope<{ value: ProductCategory; label: string }[]>(response);
  },
};

export default agroDealerCatalogService;