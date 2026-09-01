// Centralized API configuration
// In development: uses localhost from .env or defaults to http://localhost:5069
// In production: uses the deployed backend URL from .env.production

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5069';

/**
 * Normalize an image URL returned by the backend.
 * - Full URLs (http/https) are returned as-is.
 * - Relative paths are prefixed with the backend base URL.
 * - Empty/null values return a fallback SVG.
 *
 * @param {string} url - The raw image URL from the API
 * @param {string} fallback - Fallback image path (default: '/fallback.svg')
 * @returns {string} The normalized, absolute image URL
 */
export function getImageUrl(url, fallback = '/fallback.svg') {
  if (!url || !url.trim()) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
}
