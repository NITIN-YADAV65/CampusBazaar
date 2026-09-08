/**
 * Resolves the authentication redirect URL for email verification and auth callbacks.
 * - In production: Points to the production domain (https://campusbazaar-gilt.vercel.app/login)
 * - In local dev: Points to local origin (e.g. http://localhost:5173/login)
 * - Supports VITE_APP_URL / VITE_SITE_URL environment variable override if provided.
 */
export const getAuthRedirectUrl = (path: string = '/login'): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Environment variable override if set
  const envUrl = (import.meta as any).env?.VITE_APP_URL || (import.meta as any).env?.VITE_SITE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return `${envUrl.trim().replace(/\/+$/, '')}${cleanPath}`;
  }

  // 2. In browser environment: detect deployed domain or local dev
  if (typeof window !== 'undefined' && window.location) {
    const { origin, hostname } = window.location;
    // Local development (localhost / 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${origin}${cleanPath}`;
    }
    // Deployed environment (e.g. https://campusbazaar-gilt.vercel.app)
    return `${origin}${cleanPath}`;
  }

  // 3. Fallback for production
  return `https://campusbazaar-gilt.vercel.app${cleanPath}`;
};
