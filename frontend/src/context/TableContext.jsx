// src/context/TableContext.jsx

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { posEventBus } from "@/utils/posEventBus";

/**
 * TableContext provides the selected table (including floor) and the active order (cart).
 * It also exposes actions to manipulate the cart and status, and emits events via posEventBus.
 */

const TableContext = createContext();

export function TableProvider({ children }) {
  // Selected table information
  const [selectedTable, setSelectedTable] = useState(null); // { tableId, floorId, status, number, floorName }

  // Active order (cart) tied to the selected table
  const [order, setOrder] = useState({
    id: null,
    items: [], // { id, product, quantity }
    customer: null,
    discount: 0,
    appliedCoupon: null,
    status: "Pending"
  });

  // Load persisted state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("odoo_cafe_pos_orders");
    if (saved) {
      const orders = JSON.parse(saved);
      // If a table is already selected, restore its order
      if (selectedTable) {
        const existing = orders.find(o => o.tableId === selectedTable.tableId);
        if (existing) setOrder(existing);
      }
    }
  }, []);

  // Helper to persist all orders back to localStorage
  const persistOrders = (updatedOrders) => {
    localStorage.setItem("odoo_cafe_pos_orders", JSON.stringify(updatedOrders));
    // Emit a storage-like event for same‑tab listeners
    window.dispatchEvent(new Event("storage"));
    // Emit custom event for other listeners via EventTarget
    posEventBus.dispatchEvent(new CustomEvent("ordersUpdated", { detail: updatedOrders }));
  };

  /** Set the current table and optionally initialize an empty order */
  const setTable = (table) => {
    setSelectedTable(table);
    // Initialize order if not present
    setOrder(prev => ({
      ...prev,
      id: prev.id || "order_" + Date.now(),
      tableId: table.tableId,
      tableNumber: table.number,
      floorId: table.floorId,
      floorName: table.floorName,
      status: prev.status || "Pending"
    }));
  };

  const addItem = (product) => {
    if (!selectedTable) {
      // Table not selected – UI should handle this
      return;
    }
    setOrder(prev => {
      const existingIdx = prev.items.findIndex(i => i.product.id === product.id);
      let newItems;
      if (existingIdx !== -1) {
        newItems = prev.items.map((i, idx) => idx === existingIdx ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newItems = [...prev.items, { id: Date.now().toString(), product, quantity: 1 }];
      }
      const updated = { ...prev, items: newItems };
      // Persist
      updateStoredOrder(updated);
      return updated;
    });
  };

  const removeItem = (productId) => {
    setOrder(prev => {
      const newItems = prev.items
        .map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0);
      const updated = { ...prev, items: newItems };
      updateStoredOrder(updated);
      return updated;
    });
  };

  const updateQuantity = (productId, qty) => {
    setOrder(prev => {
      let newItems;
      if (qty <= 0) {
        newItems = prev.items.filter(i => i.product.id !== productId);
      } else {
        newItems = prev.items.map(i => i.product.id === productId ? { ...i, quantity: qty } : i);
      }
      const updated = { ...prev, items: newItems };
      updateStoredOrder(updated);
      return updated;
    });
  };

  const setCustomer = (customer) => {
    setOrder(prev => {
      const updated = { ...prev, customer };
      updateStoredOrder(updated);
      return updated;
    });
  };

  const applyDiscount = (pct) => {
    setOrder(prev => {
      const updated = { ...prev, discount: pct };
      updateStoredOrder(updated);
      return updated;
    });
  };

  const applyCoupon = (coupon) => {
    setOrder(prev => {
      const updated = { ...prev, appliedCoupon: coupon };
      updateStoredOrder(updated);
      return updated;
    });
  };

  const updateStatus = (newStatus) => {
    setOrder(prev => {
      const updated = { ...prev, status: newStatus };
      updateStoredOrder(updated);
      return updated;
    });
  };

  // Persist the current order into the global orders array
  const updateStoredOrder = (orderObj) => {
    const allRaw = localStorage.getItem("odoo_cafe_pos_orders") || "[]";
    const allOrders = JSON.parse(allRaw);
    const idx = allOrders.findIndex(o => o.id === orderObj.id);
    if (idx >= 0) {
      allOrders[idx] = orderObj;
    } else {
      allOrders.push(orderObj);
    }
    persistOrders(allOrders);
  };

  const value = {
    selectedTable,
    setTable,
    order,
    addItem,
    removeItem,
    updateQuantity,
    setCustomer,
    applyDiscount,
    applyCoupon,
    updateStatus,
    // expose the event bus for consumers
    posEventBus
  };

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}
