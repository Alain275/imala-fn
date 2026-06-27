const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized — only force-logout in production builds.
  // In dev mode a fake/demo token would also 401, causing a redirect loop.
  if (response.status === 401) {
    if (!import.meta.env.DEV) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-in';
    }
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw {
      response: {
        data,
        status: response.status,
      },
    };
  }

  return data;
}

export default { request };
