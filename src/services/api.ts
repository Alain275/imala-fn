// The production API endpoint is deliberately fixed here. Do not move this
// value to a VITE_ environment variable: Vite embeds those values into the
// public frontend bundle and this application always uses this API host.
export const API_ROOT = 'https://2-56-212-171.sslip.io';
export const API_URL = `${API_ROOT}/api`;

export function buildApiUrl(path: string): string {
  if (!path) {
    return API_URL;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

export function buildAssetUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ROOT}${normalizedPath}`;
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  redirectOnUnauthorized?: boolean;
}

const PUBLIC_ROUTES = new Set([
  '/',
  '/sign-in',
  '/register',
  '/dashboard',
  '/dashboard/crops',
  '/dashboard/ai',
  '/dashboard/disease',
  '/dashboard/weather',
]);

function shouldRedirectOnUnauthorized(option: boolean): boolean {
  if (!option) return false;
  if (PUBLIC_ROUTES.has(window.location.pathname)) return false;
  return true;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = false, redirectOnUnauthorized = true, ...fetchOptions } = options;

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

  const response = await fetch(buildApiUrl(endpoint), {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized — only force-logout in production builds.
  // In dev mode a fake/demo token would also 401, causing a redirect loop.
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-updated'));
    if (!import.meta.env.DEV && shouldRedirectOnUnauthorized(redirectOnUnauthorized)) {
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
