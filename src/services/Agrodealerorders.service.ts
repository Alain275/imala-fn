import { buildApiUrl } from './api';

const API_URL = buildApiUrl('');

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  farmerId: string;
  agroDealerId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  deliveryAddress?: string;
  deliveryFee?: number;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  cancelledReason?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

const agroDealerOrdersService = {
  async list(params?: { status?: OrderStatus; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();

    const response = await fetch(`${API_URL}/dealers/orders${qs ? `?${qs}` : ''}`, {
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || 'Request failed');
    }
    return result as { data: Order[]; pagination: Pagination };
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/dealers/orders/${id}`, {
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || 'Request failed');
    }
    return result as { data: Order };
  },

  async updateStatus(id: string, status: OrderStatus, cancelledReason?: string) {
    const response = await fetch(`${API_URL}/dealers/orders/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status, cancelledReason }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || 'Request failed');
    }
    return result as { data: Order };
  },

  async downloadInvoice(id: string) {
    const response = await fetch(`${API_URL}/dealers/orders/${id}/invoice`, {
      method: 'POST',
      headers: authHeaders(''),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result?.message || 'Failed to generate invoice');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async exportOrders(params?: { status?: OrderStatus; from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const qs = query.toString();

    const response = await fetch(`${API_URL}/dealers/orders/export${qs ? `?${qs}` : ''}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result?.message || 'Failed to export orders');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default agroDealerOrdersService;