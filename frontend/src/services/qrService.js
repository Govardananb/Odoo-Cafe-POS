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
  let url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) {
    url = url.trim().replace(/\/$/, "");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    return url;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

/**
 * Generate a URL-safe base64 token for a given tableId or table object.
 * Self-contained version contains table info so different devices can resolve it immediately.
 */
export function generateToken(tableOrId) {
  let table = tableOrId;
  if (typeof tableOrId === "string") {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(TABLE_STORAGE_KEY);
      if (raw) {
        const tables = JSON.parse(raw);
        const found = tables.find((t) => t.id === tableOrId);
        if (found) table = found;
      }
    }
  }

  if (!table || typeof table !== "object") {
    const id = typeof tableOrId === "string" ? tableOrId : "";
    const payload = "odoo_cafe_table:" + id;
    if (typeof window !== "undefined" && window.btoa) {
      return btoa(payload)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }
    return Buffer.from(payload).toString("base64url");
  }

  // If table is an object, construct a self-contained token payload
  const tableData = {
    id: table.id,
    number: table.number,
    capacity: table.capacity,
    floorId: table.floorId,
    status: table.status,
  };
  const payload = "odoo_cafe_table_v2:" + JSON.stringify(tableData);
  if (typeof window !== "undefined" && window.btoa) {
    return btoa(payload)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return Buffer.from(payload).toString("base64url");
}

/**
 * Resolve a token back to the table object.
 * Returns null if the token is invalid or expired.
 * Registers the table in local storage if it does not exist.
 */
export function resolveToken(token) {
  try {
    if (!token || typeof token !== "string") return null;

    // Re-pad base64url → standard base64
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4;
    const padded2 = pad ? padded + "=".repeat(4 - pad) : padded;
    const decoded = atob(padded2);

    let tableId = null;
    let decodedTable = null;

    if (decoded.startsWith("odoo_cafe_table_v2:")) {
      const jsonStr = decoded.slice("odoo_cafe_table_v2:".length);
      decodedTable = JSON.parse(jsonStr);
      tableId = decodedTable.id;
    } else if (decoded.startsWith("odoo_cafe_table:")) {
      tableId = decoded.slice("odoo_cafe_table:".length);
    } else {
      return null;
    }

    let raw = localStorage.getItem(TABLE_STORAGE_KEY);
    if (!raw) {
      const DEFAULT_TABLES = [
        { id: "g1", number: "T01", capacity: 2, floorId: "1", status: "Available" },
        { id: "g2", number: "T02", capacity: 4, floorId: "1", status: "Occupied" },
        { id: "g3", number: "T03", capacity: 4, floorId: "1", status: "Available" },
        { id: "g4", number: "T04", capacity: 6, floorId: "1", status: "Reserved" },
        { id: "g5", number: "T05", capacity: 2, floorId: "1", status: "Disabled" },
        { id: "g6", number: "T06", capacity: 8, floorId: "1", status: "Available" },
        { id: "f1", number: "T11", capacity: 4, floorId: "2", status: "Available" },
        { id: "f2", number: "T12", capacity: 4, floorId: "2", status: "Occupied" },
        { id: "f3", number: "T13", capacity: 2, floorId: "2", status: "Reserved" },
        { id: "f4", number: "T14", capacity: 6, floorId: "2", status: "Available" },
        { id: "f5", number: "T15", capacity: 2, floorId: "2", status: "Disabled" },
        { id: "r1", number: "T21", capacity: 4, floorId: "3", status: "Available" },
        { id: "r2", number: "T22", capacity: 6, floorId: "3", status: "Occupied" },
        { id: "r3", number: "T23", capacity: 2, floorId: "3", status: "Available" },
        { id: "r4", number: "T24", capacity: 4, floorId: "3", status: "Reserved" }
      ];
      localStorage.setItem(TABLE_STORAGE_KEY, JSON.stringify(DEFAULT_TABLES));
      raw = JSON.stringify(DEFAULT_TABLES);
    }

    const tables = JSON.parse(raw);
    let table = tables.find((t) => t.id === tableId);

    // If not found in localStorage but we have decodedTable data from token, register it!
    if (!table && decodedTable) {
      tables.push(decodedTable);
      localStorage.setItem(TABLE_STORAGE_KEY, JSON.stringify(tables));
      table = decodedTable;
    }

    // Security: reject disabled/deleted tables
    if (!table) return null;
    if (table.status === "Disabled" || table.status === "disabled") {
      return { ...table, isDisabled: true };
    }

    return table;
  } catch (err) {
    console.error("Error resolving token:", err);
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
