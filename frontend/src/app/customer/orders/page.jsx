"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveOrder } from "@/services/customerOrderService";
import { Clock, ChefHat, CheckCircle2, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [tableInfo, setTableInfo] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("customer_table");
    if (stored) {
      const info = JSON.parse(stored);
      setTableInfo(info);

      // Load active order
      const active = getActiveOrder(info.tableId);
      setActiveOrder(active);

      // Load all orders from localStorage and filter past orders for this table
      const allOrdersRaw = localStorage.getItem("odoo_cafe_pos_orders");
      if (allOrdersRaw) {
        const allOrders = JSON.parse(allOrdersRaw);
        const customerName = sessionStorage.getItem("customer_name") || "";
        
        // Find past orders (served/completed/paid/cancelled) for this table and customer
        const filteredPast = allOrders.filter(
          (o) =>
            o.tableId === info.tableId &&
            (o.status === "completed" || o.status === "cancelled" || o.status === "served" || o.status === "Paid") &&
            (o.customer?.name === customerName || !customerName)
        );
        setPastOrders(filteredPast);
      }
    }
  }, []);

  if (!tableInfo) {
    return (
      <div style={styles.centered}>
        <ShoppingBag size={40} color="#555" />
        <h2 style={styles.errorTitle}>Scan QR Code</h2>
        <p style={styles.errorMsg}>Please scan a table QR code to view your orders.</p>
      </div>
    );
  }

  const STATUS_LABELS = {
    to_cook: "In Queue",
    preparing: "Preparing",
    ready: "Ready to Serve",
    served: "Served",
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "to_cook": return <Clock size={16} color="#FBBF24" />;
      case "preparing": return <ChefHat size={16} color="#3B82F6" />;
      case "ready": return <CheckCircle2 size={16} color="#22C55E" />;
      default: return <CheckCircle2 size={16} color="#888" />;
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Your Orders</h2>

      {/* ACTIVE ORDER CARD */}
      {activeOrder ? (
        <div style={styles.activeCard}>
          <div style={styles.activeHeader}>
            <div style={styles.pulseContainer}>
              <span style={styles.pulseDot} />
              <span style={styles.activeLabel}>Active Order</span>
            </div>
            <span style={styles.orderId}>#{activeOrder.id.slice(-6).toUpperCase()}</span>
          </div>

          <div style={styles.activeStatusRow}>
            {getStatusIcon(activeOrder.status)}
            <span style={styles.activeStatusText}>
              {STATUS_LABELS[activeOrder.status] || activeOrder.status}
            </span>
          </div>

          <p style={styles.activeDesc}>
            {activeOrder.status === "to_cook" && "Your order is queued and waiting to be accepted by the kitchen."}
            {activeOrder.status === "preparing" && "Chef has started cooking! Freshly preparing your hot dishes."}
            {activeOrder.status === "ready" && "Your order is ready to serve! Sit back, a waiter is bringing it to you."}
          </p>

          <div style={styles.divider} />

          <div style={styles.activeFooter}>
            <span style={styles.totalLabel}>₹{activeOrder.total?.toFixed(2)}</span>
            <button 
              onClick={() => router.push("/customer/tracking")} 
              style={styles.trackBtn}
            >
              Track Order <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.noActiveCard}>
          <p style={{ color: "#555", fontSize: 13, margin: 0 }}>No active orders yet.</p>
          <button 
            onClick={() => router.push("/customer/menu")} 
            style={styles.browseBtn}
          >
            Order Now
          </button>
        </div>
      )}

      {/* PAST ORDERS LIST */}
      <h3 style={styles.sectionTitle}>Order History</h3>
      {pastOrders.length === 0 ? (
        <div style={styles.emptyHistory}>
          <ShoppingBag size={24} color="#333" />
          <p style={{ color: "#444", fontSize: 13, margin: 0, marginTop: 8 }}>You have no past orders.</p>
        </div>
      ) : (
        <div style={styles.historyList}>
          {pastOrders.map((order) => (
            <div key={order.id} style={styles.historyCard}>
              <div style={styles.historyHeader}>
                <span style={styles.historyDate}>
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
                <span style={styles.historyStatus}>
                  {order.status === "Paid" ? "Paid" : "Served"}
                </span>
              </div>

              <div style={styles.historyItems}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.product?.name || item.name}</span>
                    <span style={styles.itemQty}>×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={styles.historyFooter}>
                <span style={styles.historyTotal}>₹{order.total?.toFixed(2)}</span>
                <span style={styles.historyId}>#{order.id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "20px 16px 100px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#F4F4F4",
    margin: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: 8,
    marginHorizontal: 0,
  },
  activeCard: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  activeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pulseContainer: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#FF6B1A",
    boxShadow: "0 0 8px #FF6B1A",
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#FF6B1A",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  orderId: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#555",
  },
  activeStatusRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  activeStatusText: {
    fontSize: 14,
    fontWeight: 700,
    color: "#F4F4F4",
  },
  activeDesc: {
    fontSize: 12,
    color: "#666",
    margin: 0,
    lineHeight: 1.4,
  },
  divider: {
    height: 1,
    background: "#1E1E1E",
  },
  activeFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 800,
    color: "#FF6B1A",
  },
  trackBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#FF6B1A",
    border: "none",
    borderRadius: 10,
    color: "#000",
    fontSize: 12,
    fontWeight: 750,
    padding: "8px 14px",
    cursor: "pointer",
  },
  noActiveCard: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  browseBtn: {
    background: "transparent",
    border: "1px solid #FF6B1A30",
    color: "#FF6B1A",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 16px",
    cursor: "pointer",
  },
  emptyHistory: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 16,
    padding: 32,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  historyCard: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    fontSize: 12,
    fontWeight: 600,
    color: "#888",
  },
  historyStatus: {
    fontSize: 10,
    fontWeight: 700,
    color: "#22C55E",
    background: "#0A1F0A",
    padding: "2px 8px",
    borderRadius: 6,
    textTransform: "uppercase",
  },
  historyItems: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
  },
  itemName: {
    color: "#F4F4F4",
    fontWeight: 500,
  },
  itemQty: {
    color: "#666",
    fontFamily: "monospace",
  },
  historyFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #1E1E1E",
    paddingTop: 8,
    marginTop: 2,
  },
  historyTotal: {
    fontSize: 14,
    fontWeight: 800,
    color: "#FF6B1A",
  },
  historyId: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#444",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    textAlign: "center",
    minHeight: "60vh",
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#F4F4F4",
    margin: 0,
  },
  errorMsg: {
    fontSize: 13,
    color: "#666",
    margin: 0,
    maxWidth: 240,
    lineHeight: 1.4,
  },
};
