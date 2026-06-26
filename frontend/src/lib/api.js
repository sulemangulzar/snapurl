/**
 * Centralised API client for SnapURL.
 * - Reads base URL from VITE_API_URL env variable.
 * - Automatically attaches the Authorization header.
 * - On 401, attempts a token refresh using the stored refresh_token.
 * - If refresh also fails, clears storage and redirects to login.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("snapurl_token");
}

function getRefreshToken() {
  return localStorage.getItem("snapurl_refresh_token");
}

function clearAuth() {
  localStorage.removeItem("snapurl_token");
  localStorage.removeItem("snapurl_refresh_token");
  // Dispatch a custom event so the app can react (e.g. redirect to login)
  window.dispatchEvent(new CustomEvent("snapurl:logout"));
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    if (!res.ok) {
      clearAuth();
      return false;
    }

    const data = await res.json();
    localStorage.setItem("snapurl_token", data.access_token);
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

/**
 * Fetch wrapper that handles auth headers and auto-refresh on 401.
 */
async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    } else {
      clearAuth();
      throw new Error("Session expired. Please log in again.");
    }
  }

  return res;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiSignup({ name, email, password }) {
  return fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiLogin({ email, password }) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  return fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
}

export function storeTokens({ access_token, refresh_token }) {
  localStorage.setItem("snapurl_token", access_token);
  if (refresh_token) localStorage.setItem("snapurl_refresh_token", refresh_token);
}

export async function apiGetMe() {
  return apiFetch("/auth/me");
}

export async function apiUpdateMe({ name, email }) {
  return apiFetch("/auth/me", {
    method: "PUT",
    body: JSON.stringify({ name, email }),
  });
}

// ── URLs ──────────────────────────────────────────────────────────────────────

export async function apiGetUrls({ limit = 50, offset = 0, query = "", sortBy = "created_at", sortOrder = "desc" } = {}) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    query,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
  return apiFetch(`/api/url/urls?${params.toString()}`);
}

export async function apiCreateUrl(originalUrl) {
  return apiFetch("/api/url/create", {
    method: "POST",
    body: JSON.stringify({ original_url: originalUrl }),
  });
}

export async function apiDeleteUrl(shortCode) {
  return apiFetch(`/api/url/${shortCode}`, { method: "DELETE" });
}

export async function apiUpdateUrl(shortCode, newUrl) {
  return apiFetch(`/api/url/${shortCode}`, {
    method: "PUT",
    body: JSON.stringify({ original_url: newUrl }),
  });
}

export async function apiGetAnalytics(shortCode) {
  return apiFetch(`/api/url/${shortCode}/analytics`);
}

export async function apiGetQrCodeUrl(shortCode) {
  // Fetch as blob to include Authorization headers
  const res = await apiFetch(`/urls/${shortCode}/qr`);
  if (!res.ok) throw new Error("Failed to load QR code");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function shortLink(shortCode) {
  const base = import.meta.env.VITE_BASE_URL ?? "http://127.0.0.1:8000";
  return `${base}/${shortCode}`;
}

export { clearAuth };
