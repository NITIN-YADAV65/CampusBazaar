export const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

/**
 * Returns a valid, loadable avatar URL.
 * Automatically rejects null, undefined, empty strings, and dead 'blob:' or 'data:' memory URLs.
 */
export const getSafeAvatarUrl = (
  url?: string | null,
  fallback: string = DEFAULT_AVATAR_URL
): string => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return fallback;
  }
  return trimmed;
};
