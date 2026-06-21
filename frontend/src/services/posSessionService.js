// src/services/posSessionService.js

/**
 * Service to manage POS sessions stored in localStorage.
 * Key: "odoo_cafe_pos_session"
 */

const STORAGE_KEY = "odoo_cafe_pos_session";

/** Generate a simple unique id */
function generateId() {
  return "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
}

export const posSessionService = {
  /** Get the current session (if any) */
  getCurrent() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /** Create a new session */
  create({ employeeId, openingCash = 0 }) {
    const newSession = {
      id: generateId(),
      employeeId,
      openedAt: new Date().toISOString(),
      closedAt: null,
      openingCash,
      closingCash: null,
      status: "open",
      revenue: 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    return newSession;
  },

  /** Close an existing session */
  close({ closingCash = 0 }) {
    const session = this.getCurrent();
    if (!session || session.status !== "open") return null;
    const updated = {
      ...session,
      closedAt: new Date().toISOString(),
      closingCash,
      status: "closed",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /** Add revenue to the open session */
  addRevenue(amount) {
    const session = this.getCurrent();
    if (!session || session.status !== "open") return null;
    const updated = {
      ...session,
      revenue: (session.revenue || 0) + amount,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /** Clear session (used on logout) */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
