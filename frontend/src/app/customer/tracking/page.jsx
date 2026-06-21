"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getActiveOrder, subscribeToOrder } from "@/services/customerOrderService";
import { CheckCircle2, Clock, ChefHat, UtensilsCrossed, ArrowLeft, AlertCircle } from "lucide-react";

const STEPS = [
  {
    key: "to_cook",
    label: "Order Received",
    sub: "Your order is in the kitchen queue",
    icon: Clock,
    color: "#FBBF24",
  },
  {
    key: "preparing",
    label: "Preparing",
    sub: "Our chefs are preparing your food",
    icon: ChefHat,
    color: "#3B82F6",
  },
  {
    key: "ready",
    label: "Ready to Serve",
    sub: "Ready! A waiter is bringing it to your table",
    icon: UtensilsCrossed,
    color: "#22C55E",
  },
  {
    key: "served",
    label: "Served",
    sub: "Enjoy your meal!",
    icon: CheckCircle2,
    color: "#FF6B1A",
  },
];

function getStepIndex(status) {
  const map = { to_cook: 0, preparing: 1, ready: 2, served: 3 };
  return map[status] ?? -1;
}

function getElapsed(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diff < 1) return "Just now";
  return `${diff} min ago`;
}

export default function CustomerTrackingPage() {
  const router = useRouter();
  const [tableInfo, setTableInfo] = useState(null);
  const [order, setOrder] = useState(null);
  const [now, setNow] = useState(Date.now());
  const unsubRef = useRef(null);

  // Dynamic Prep Time Calculation
  const getEstimatedPrepTime = (items) => {
    if (!items || items.length === 0) return "5 mins";
    let maxMins = 5;
    items.forEach((item) => {
      const timeStr = item.product?.prepTime || "5 mins";
      const mins = parseInt(timeStr) || 5;
      if (mins > maxMins) maxMins = mins;
    });
    return `${maxMins} mins`;
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("customer_table");
    if (!stored) return;
    const info = JSON.parse(stored);
    setTableInfo(info);

    // Initial load
    const active = getActiveOrder(info.tableId);
    setOrder(active);

    // Subscribe to cross-tab storage event updates (realtime sync with KDS)
    unsubRef.current = subscribeToOrder(info.tableId, (updated) => {
      setOrder(updated);
    });

    // Elapsed timer
    const interval = setInterval(() => setNow(Date.now()), 15000);

    return () => {
      if (unsubRef.current) unsubRef.current();
      clearInterval(interval);
    };
  }, []);

  if (!tableInfo) {
    return (
      <div style={styles.centered}>
        <AlertCircle size={40} color="#EF4444" />
        <h2 style={styles.noOrderTitle}>Table Not Found</h2>
        <p style={{ color: "#555", fontSize: 13, textAlign: "center" }}>
          Please scan a table QR code to start tracking.
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.centered}>
        <div style={{ fontSize: 44 }}>🍽️</div>
        <h2 style={styles.noOrderTitle}>No Active Order</h2>
        <p style={{ color: "#555", fontSize: 13, textAlign: "center", maxWidth: 280 }}>
          You don't have any active orders cooking for {tableInfo.tableNumber} right now.
        </p>
        <button onClick={() => router.push("/customer/menu")} style={styles.menuBtn}>
          Order Something Delicious
        </button>
      </div>
    );
  }

  const stepIndex = getStepIndex(order.status);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Order Tracking</h2>
          <p style={styles.tableSubtitle}>Table {tableInfo.tableNumber} · {tableInfo.floorName}</p>
        </div>
        <span style={styles.orderIdChip}>#{order.id.slice(-6).toUpperCase()}</span>
      </div>

      {/* EST. PREPARATION TIME */}
      {stepIndex < 2 && (
        <div style={styles.prepTimeCard}>
          <Clock size={20} color="#FF6B1A" />
          <div style={styles.prepTimeContent}>
            <span style={styles.prepTimeLabel}>Estimated Delivery</span>
            <span style={styles.prepTimeVal}>{getEstimatedPrepTime(order.items)}</span>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div style={styles.timeline}>
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < stepIndex;
          const isActive = idx === stepIndex;

          return (
            <div key={step.key} style={styles.stepWrap}>
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    ...styles.connector,
                    background: isDone || isActive ? step.color : "#1E1E1E",
                  }}
                />
              )}

              <div style={styles.stepRow}>
                {/* Icon circle */}
                <div
                  style={{
                    ...styles.iconCircle,
                    background: isActive
                      ? step.color + "22"
                      : isDone
                      ? "#1E1E1E"
                      : "#111",
                    border: `2px solid ${
                      isActive ? step.color : isDone ? "#2A2A2A" : "#1A1A1A"
                    }`,
                    ...(isActive ? { boxShadow: `0 0 12px ${step.color}55` } : {}),
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={16} color="#22C55E" />
                  ) : (
                    <Icon
                      size={16}
                      color={isActive ? step.color : "#333"}
                      style={
                        isActive
                          ? { animation: "pulse 1.5s ease-in-out infinite" }
                          : {}
                      }
                    />
                  )}
                </div>

                {/* Text */}
                <div style={styles.stepText}>
                  <div
                    style={{
                      ...styles.stepLabel,
                      color: isActive ? "#F4F4F4" : isDone ? "#666" : "#333",
                    }}
                  >
                    {step.label}
                  </div>
                  {isActive && (
                    <div style={{ ...styles.stepSub, color: step.color }}>
                      {step.sub}
                    </div>
                  )}
                </div>

                {/* Active badge */}
                {isActive && (
                  <span
                    style={{
                      ...styles.activeBadge,
                      background: step.color + "22",
                      color: step.color,
                      border: `1px solid ${step.color}44`,
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryHeader}>
          <span style={styles.summaryTitle}>Ordered Items</span>
          <span style={styles.elapsed}>{getElapsed(order.createdAt)}</span>
        </div>
        <div style={styles.itemsList}>
          {order.items.map((item, i) => (
            <div key={i} style={styles.itemRow}>
              <span style={styles.itemName}>{item.product?.name || item.name}</span>
              <span style={styles.itemQty}>×{item.quantity}</span>
            </div>
          ))}
        </div>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total Paid / Due</span>
          <span style={styles.totalValue}>₹{order.total?.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <button onClick={() => router.push("/customer/menu")} style={styles.backToMenuBtn}>
        <ArrowLeft size={15} />
        Order More Items (Add to Table)
      </button>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
      `}</style>
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
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 12,
    padding: 24,
    textAlign: "center",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#F4F4F4",
    margin: 0,
  },
  tableSubtitle: {
    fontSize: 12,
    color: "#666",
    margin: 0,
    marginTop: 2,
    fontWeight: 500,
  },
  orderIdChip: {
    fontSize: 11,
    fontWeight: 700,
    color: "#888",
    background: "#141414",
    border: "1px solid #222",
    borderRadius: 8,
    padding: "4px 10px",
    fontFamily: "monospace",
  },
  prepTimeCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#FF6B1A10",
    border: "1px solid #FF6B1A20",
    borderRadius: 16,
    padding: "12px 16px",
  },
  prepTimeContent: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  prepTimeLabel: {
    fontSize: 10,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 650,
  },
  prepTimeVal: {
    fontSize: 15,
    fontWeight: 800,
    color: "#FF6B1A",
  },
  timeline: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 16,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    position: "relative",
  },
  stepWrap: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  connector: {
    position: "absolute",
    left: 19,
    top: 40,
    width: 2,
    height: 32,
    borderRadius: 2,
    zIndex: 0,
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    position: "relative",
    zIndex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.3s",
  },
  stepText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: 700,
    transition: "color 0.3s",
  },
  stepSub: {
    fontSize: 12,
    fontWeight: 500,
  },
  activeBadge: {
    fontSize: 10,
    fontWeight: 800,
    borderRadius: 6,
    padding: "3px 8px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  summaryCard: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 16,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  elapsed: {
    fontSize: 12,
    color: "#444",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: { fontSize: 13, color: "#F4F4F4", fontWeight: 600 },
  itemQty: { fontSize: 13, color: "#666", fontWeight: 600 },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #1E1E1E",
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: { fontSize: 13, fontWeight: 700, color: "#888" },
  totalValue: { fontSize: 16, fontWeight: 800, color: "#FF6B1A" },
  backToMenuBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: "transparent",
    border: "1px solid #222",
    borderRadius: 12,
    color: "#888",
    fontSize: 13,
    fontWeight: 650,
    padding: "14px",
    cursor: "pointer",
  },
  noOrderTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#F4F4F4",
    margin: 0,
  },
  menuBtn: {
    background: "#FF6B1A",
    border: "none",
    borderRadius: 12,
    color: "#000",
    fontSize: 14,
    fontWeight: 700,
    padding: "12px 24px",
    cursor: "pointer",
    marginTop: 8,
  },
};
