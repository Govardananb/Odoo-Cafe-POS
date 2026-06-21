// src/services/customerOrderService.js
// Customer-facing service: reads shared localStorage, writes orders to the shared store.
// Never touches admin-only state. Uses posEventBus for live updates.

import { posEventBus } from "@/utils/posEventBus";
import { DEFAULT_PRODUCTS } from "./productService";

const PRODUCTS_KEY = "odoo_cafe_products";
const COUPONS_KEY = "odoo_cafe_coupons";
const ORDERS_KEY = "odoo_cafe_pos_orders";

// Cross-tab real-time sync for customer screen updates when localStorage changes in another tab (KDS/POS)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === ORDERS_KEY) {
      try {
        const orders = e.newValue ? JSON.parse(e.newValue) : [];
        posEventBus.dispatchEvent(new CustomEvent("ordersUpdated", { detail: orders }));
      } catch (err) {
        console.error("Failed to parse synchronized orders", err);
      }
    }
  });
}

// ─── Products ────────────────────────────────────────────────────────────────

export function getProducts() {
  if (typeof window === "undefined") return [];
  let raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    raw = JSON.stringify(DEFAULT_PRODUCTS);
  }
  return JSON.parse(raw).filter((p) => p.status === "Active" || p.status === "active");
}

export function getProductById(id) {
  return getProducts().find((p) => p.id === id) || null;
}

export function getCategories() {
  const products = getProducts();
  const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
  return ["All", ...cats];
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export function validateCoupon(code) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(COUPONS_KEY);
  if (!raw) return null;
  const coupons = JSON.parse(raw);
  const found = coupons.find(
    (c) => c.code?.toLowerCase() === code.toLowerCase() && c.status === "Active"
  );
  return found || null;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

function getOrders() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ORDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  posEventBus.dispatchEvent(new CustomEvent("ordersUpdated", { detail: orders }));
}

/**
 * Get the active order for a given tableId.
 * Active = not completed and not cancelled.
 */
export function getActiveOrder(tableId) {
  const orders = getOrders();
  const order = orders.find(
    (o) =>
      o.tableId === tableId &&
      o.status !== "completed" &&
      o.status !== "cancelled" &&
      o.status !== "served"
  );
  if (!order) return null;

  // Sync status dynamically from KDS ticket if it exists
  if (typeof window !== "undefined") {
    const kdsRaw = localStorage.getItem("odoo_cafe_kds_orders");
    if (kdsRaw) {
      const tickets = JSON.parse(kdsRaw);
      const ticket = tickets.find((t) => t.orderId === order.id);
      if (ticket) {
        const kdsToPosStatus = {
          Pending: "to_cook",
          Preparing: "preparing",
          Ready: "ready",
          Completed: "served",
          Dispatched: "served",
        };
        order.status = kdsToPosStatus[ticket.status] || order.status;
      }
    }
  }

  return order;
}

/**
 * Place a customer order. Creates it directly as "to_cook" so it
 * appears immediately in the kitchen display.
 */
export function placeOrder({ tableId, tableNumber, floorName, items, coupon, subtotal, tax, discount, total, customer }) {
  const orders = getOrders();
  const newOrder = {
    id: "order_" + Date.now(),
    tableId,
    tableNumber,
    floorName,
    source: "customer_qr",
    items: items.map((item) => ({
      id: item.product.id + "_" + Date.now(),
      product: item.product,
      quantity: item.quantity,
    })),
    coupon: coupon || null,
    subtotal,
    tax,
    discount,
    total,
    customer: customer || null, // Stores customer name & optional phone
    paymentStatus: "unpaid",
    status: "to_cook",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to POS Orders
  orders.unshift(newOrder);
  saveOrders(orders);

  // 2. Also inject directly into KDS tickets so it shows up in Kitchen Display
  if (typeof window !== "undefined") {
    const kdsRaw = localStorage.getItem("odoo_cafe_kds_orders") || "[]";
    const kdsOrders = JSON.parse(kdsRaw);
    const newKdsOrder = {
      id: "KDS-" + Math.floor(1000 + Math.random() * 9000),
      orderId: newOrder.id, // link to POS order
      tableNumber,
      floorName,
      items: items.map((item) => ({ name: item.product.name, quantity: item.quantity })),
      status: "Pending", // KDS status: Pending, Preparing, Ready
      createdAt: new Date().toISOString(),
    };
    kdsOrders.push(newKdsOrder);
    localStorage.setItem("odoo_cafe_kds_orders", JSON.stringify(kdsOrders));
    
    // Broadcast updates
    window.dispatchEvent(new Event("storage"));
  }

  return newOrder;
}

/**
 * Subscribe to order updates for a specific table.
 * Returns an unsubscribe function.
 */
export function subscribeToOrder(tableId, callback) {
  const handler = () => {
    const order = getActiveOrder(tableId);
    callback(order);
  };
  posEventBus.addEventListener("ordersUpdated", handler);
  return () => posEventBus.removeEventListener("ordersUpdated", handler);
}
