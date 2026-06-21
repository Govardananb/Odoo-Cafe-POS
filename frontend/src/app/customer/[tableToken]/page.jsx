"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resolveToken } from "@/services/qrService";
import { getActiveOrder } from "@/services/customerOrderService";
import { UtensilsCrossed, MapPin, Clock, ChevronRight, AlertCircle } from "lucide-react";

const STATUS_LABELS = {
  to_cook: "In Queue",
  preparing: "Preparing",
  ready: "Ready to Serve",
  served: "Served",
  draft: "Order Open",
};

export default function QRLandingPage() {
  const { tableToken } = useParams();
  const router = useRouter();
  const [table, setTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [error, setError] = useState(null); // null | "invalid" | "disabled"

  useEffect(() => {
    if (!tableToken) return;

    const resolved = resolveToken(tableToken);
    if (!resolved) {
      setError("invalid");
      return;
    }

    if (resolved.isDisabled) {
      setTable({
        tableNumber: resolved.number || resolved.tableNumber || "Unknown"
      });
      setError("disabled");
      return;
    }

    // Read floor name from floors store
    const floorsRaw = localStorage.getItem("odoo_cafe_floors");
    let floorName = "Dining Area";
    if (floorsRaw) {
      const floors = JSON.parse(floorsRaw);
      const floor = floors.find((f) => f.id === resolved.floorId);
      if (floor) floorName = floor.name;
    }

    const tableInfo = {
      tableId: resolved.id,
      tableNumber: resolved.number,
      capacity: resolved.capacity,
      floorName,
    };

    // Persist table info for layout and other pages
    sessionStorage.setItem("customer_table", JSON.stringify(tableInfo));
    router.replace("/customer/menu");
  }, [tableToken, router]);

  if (error === "disabled") {
    return (
      <div style={styles.centered}>
        <AlertCircle size={40} color="#EF4444" />
        <h2 style={styles.errorTitle}>Table Unavailable</h2>
        <p style={styles.errorMsg}>
          Table {table?.tableNumber || ""} is currently disabled by our staff.
          Please contact a team member for assistance or scan a different table QR code.
        </p>
      </div>
    );
  }

  if (error === "invalid") {
    return (
      <div style={styles.centered}>
        <AlertCircle size={40} color="#EF4444" />
        <h2 style={styles.errorTitle}>Invalid QR Code</h2>
        <p style={styles.errorMsg}>This QR code is not recognized. Please ask staff for assistance.</p>
      </div>
    );
  }

  if (!table) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: "#555", marginTop: 16, fontSize: 14 }}>Identifying your table…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.logoWrap}>
          <UtensilsCrossed size={32} color="#FF6B1A" />
        </div>
        <h1 style={styles.cafeName}>Odoo Cafe</h1>
        <p style={styles.tagline}>Fresh • Fast • Flavourful</p>
      </div>

      {/* Table Card */}
      <div style={styles.tableCard}>
        <div style={styles.tableRow}>
          <MapPin size={15} color="#FF6B1A" />
          <div>
            <div style={styles.tableNumber}>{table.tableNumber}</div>
            <div style={styles.floorLabel}>{table.floorName} · {table.capacity} seats</div>
          </div>
        </div>
      </div>

      {/* Active Order Banner */}
      {activeOrder && (
        <div style={styles.orderBanner}>
          <Clock size={15} color="#FBBF24" />
          <div style={{ flex: 1 }}>
            <div style={styles.orderBannerTitle}>Active Order</div>
            <div style={styles.orderBannerStatus}>
              {STATUS_LABELS[activeOrder.status] || activeOrder.status}
            </div>
          </div>
          <button
            onClick={() => router.push("/customer/tracking")}
            style={styles.trackBtn}
          >
            Track <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* CTA */}
      <div style={styles.ctaSection}>
        <button
          onClick={() => router.push("/customer/menu")}
          style={styles.menuBtn}
        >
          View Menu
        </button>

        {activeOrder && (
          <button
            onClick={() => router.push("/customer/cart")}
            style={styles.cartBtn}
          >
            View Cart
          </button>
        )}
      </div>

      {/* Footer */}
      <p style={styles.footer}>Scan the QR code on your table to order again</p>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: "calc(100dvh - 130px)",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 12,
    padding: 24,
  },
  hero: {
    textAlign: "center",
    paddingBottom: 8,
    paddingTop: 12,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: "#1A1A1A",
    border: "1px solid #2A2A2A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  cafeName: {
    fontSize: 26,
    fontWeight: 800,
    color: "#F4F4F4",
    letterSpacing: "-0.5px",
    margin: 0,
  },
  tagline: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  tableCard: {
    background: "#141414",
    border: "1px solid #222",
    borderRadius: 16,
    padding: "16px 18px",
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  tableNumber: {
    fontSize: 17,
    fontWeight: 700,
    color: "#F4F4F4",
  },
  floorLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  orderBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#1A1500",
    border: "1px solid #3A2C00",
    borderRadius: 14,
    padding: "13px 16px",
  },
  orderBannerTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  orderBannerStatus: {
    fontSize: 13,
    fontWeight: 700,
    color: "#FBBF24",
    marginTop: 2,
  },
  trackBtn: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    background: "#FBBF24",
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  ctaSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 8,
  },
  menuBtn: {
    width: "100%",
    padding: "16px",
    background: "#FF6B1A",
    color: "#000",
    border: "none",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: "-0.3px",
  },
  cartBtn: {
    width: "100%",
    padding: "14px",
    background: "transparent",
    color: "#FF6B1A",
    border: "1px solid #FF6B1A30",
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#333",
    marginTop: "auto",
    paddingTop: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #222",
    borderTop: "3px solid #FF6B1A",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#F4F4F4",
    margin: 0,
  },
  errorMsg: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    margin: 0,
  },
};
