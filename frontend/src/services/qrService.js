// src/services/qrService.js
// Generates and resolves QR tokens for customer table identification.
// Token is a deterministic base64url encoding of the tableId.
// Uses NEXT_PUBLIC_APP_URL env var so URLs work via ngrok on mobile.

const TABLE_STORAGE_KEY = "odoo_cafe_tables";

/**
 * Get the base URL for the application.
 * Priority: NEXT_PUBLIC_APP_URL env var → window.location.origin → localhost fallback
 */
export function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

/**
 * Generate a URL-safe base64 token for a given tableId.
 * The same tableId always produces the same token (deterministic).
 */
export function generateToken(tableId) {
  if (typeof window !== "undefined" && window.btoa) {
    return btoa("odoo_cafe_table:" + tableId)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  // Server-side fallback
  return Buffer.from("odoo_cafe_table:" + tableId).toString("base64url");
}

/**
 * Resolve a token back to the table object.
 * Returns null if the token is invalid, expired, or the table doesn't exist.
 */
export function resolveToken(token) {
  try {
    if (!token || typeof token !== "string") return null;

    // Re-pad base64url → standard base64
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4;
    const padded2 = pad ? padded + "=".repeat(4 - pad) : padded;
    const decoded = atob(padded2);

    if (!decoded.startsWith("odoo_cafe_table:")) return null;
    const tableId = decoded.slice("odoo_cafe_table:".length);

    const raw = localStorage.getItem(TABLE_STORAGE_KEY);
    if (!raw) return null;

    const tables = JSON.parse(raw);
    const table = tables.find((t) => t.id === tableId);

    // Security: reject disabled/deleted tables
    if (!table) return null;
    if (table.status === "Disabled" || table.status === "disabled") return null;

    return table;
  } catch {
    return null;
  }
}

/**
 * Generate the full short customer URL for a table.
 * Format: {APP_URL}/s/{token}
 * e.g. https://abc123.ngrok-free.app/s/b2Rvb19jYWZlX3RhYmxlOmcx
 */
export function getCustomerUrl(tableId) {
  const token = generateToken(tableId);
  const base = getAppBaseUrl();
  return `${base}/s/${token}`;
}

/**
 * Generate a QR code image URL for a given table URL.
 * Uses the api.qrserver.com free API — no key needed.
 */
export function getQrImageUrl(tableId, size = 200) {
  const url = getCustomerUrl(tableId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&ecc=M&data=${encodeURIComponent(url)}`;
}
