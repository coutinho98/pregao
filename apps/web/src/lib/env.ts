export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** Absolute URL for a path served by the API (e.g. lot images). */
export const apiUrl = (path: string) => `${API_URL}${path}`;
