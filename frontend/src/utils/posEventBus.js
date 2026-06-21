// src/utils/posEventBus.js

/**
 * A lightweight EventTarget used for intra‑application pub/sub.
 * Components (e.g., KDS, POS screens) can listen to events such as
 * "ordersChanged" to receive real‑time updates without polling.
 */

export const posEventBus = new EventTarget();

// Helper functions (optional) for convenience
export const emitOrdersChanged = (orders) => {
  posEventBus.dispatchEvent(new CustomEvent("ordersChanged", { detail: orders }));
};

export const onOrdersChanged = (handler) => {
  posEventBus.addEventListener("ordersChanged", handler);
  return () => posEventBus.removeEventListener("ordersChanged", handler);
};
