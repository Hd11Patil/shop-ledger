function normalizeApiBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

/**
 * Resolves the backend API base URL.
 * - Production (Vercel): set VITE_API_URL to your Render API, e.g. https://your-api.onrender.com/api
 * - Local dev: defaults to /api (proxied by Vite to localhost:8080)
 */
export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return normalizeApiBaseUrl(configured);

  if (import.meta.env.DEV) return "/api";

  console.error(
    "VITE_API_URL is not set. Configure it in Vercel project settings before building.",
  );
  return "/api";
}
