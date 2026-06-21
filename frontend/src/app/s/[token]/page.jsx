"use client";

// /s/[token] — Short URL entry point for QR codes.
// Renders the same customer landing experience as /customer/[tableToken].
// Keeping it at a short path makes QR codes more compact and reliable.

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resolveToken } from "@/services/qrService";
import { UtensilsCrossed, MapPin, Clock, ChevronRight, AlertCircle, ShieldX } from "lucide-react";
import { getActiveOrder } from "@/services/customerOrderService";

const STATUS_LABELS = {
  to_cook: "In Queue",
  preparing: "Preparing",
  ready: "Ready to Serve",
  served: "Served",
  draft: "Order Open",
};

export default function ShortQRPage() {
  const { token } = useParams();
  const router = useRouter();
  const [table, setTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | invalid | disabled

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const resolved = resolveToken(token);

    if (!resolved) {
      setStatus("invalid");
      return;
    }

    // Read floor name
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

    // Persist to sessionStorage for all child pages
    sessionStorage.setItem("customer_table", JSON.stringify(tableInfo));
    router.replace("/customer/menu");
  }, [token, router]);

  // ─── States ────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div style={styles.fullCenter}>
        <div style={styles.spinner} />
        <p style={styles.muted}>Verifying your table…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div style={styles.fullCenter}>
        <ShieldX size={44} color="#EF4444" />
        <h2 style={styles.errorTitle}>Invalid QR Code</h2>
        <p style={styles.errorMsg}>
          This QR code is not recognized or the table has been removed.
          Please ask a staff member for assistance.
        </p>
      </div>
    );
  }

  // ─── Success ───────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.logoWrap}>
          <UtensilsCrossed size={32} color="#FF6B1A" />
        </div>
        <h1 style={styles.cafeName}>Odoo Cafe</h1>
        <p style={styles.tagline}>Fresh · Fast · Flavourful</p>
      </div>

      {/* Table Badge */}
      <div style={styles.tableCard}>
        <MapPin size={15} color="#FF6B1A" />
        <div>
          <div style={styles.tableNumber}>{table.tableNumber}</div>
          <div style={styles.floorLabel}>
            {table.floorName} · {table.capacity} seats
          </div>
        </div>
      </div>

      {/* Active Order Banner */}
      {activeOrder && (
        <div style={styles.orderBanner}>
          <Clock size={14} color="#FBBF24" />
          <div style={{ flex: 1 }}>
            <div style={styles.bannerLabel}>Active Order</div>
            <div style={styles.bannerStatus}>
              {STATUS_LABELS[activeOrder.status] || activeOrder.status}
            </div>
          </div>
          <button
            onClick={() => router.push("/customer/tracking")}
            style={styles.trackBtn}
          >
            Track <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* CTAs */}
      <div style={styles.ctas}>
        <button
          onClick={() => router.push("/customer/menu")}
          style={styles.primaryBtn}
        >
          View Menu
        </button>
        {activeOrder && (
          <button
            onClick={() => router.push("/customer/cart")}
            style={styles.secondaryBtn}
          >
            View Cart
          </button>
        )}
      </div>

      <p style={styles.footer}>Scan the QR on your table at any time to return here</p>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px 20px 100px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: "calc(100dvh - 130px)",
  },
  fullCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100dvh",
    gap: 14,
    padding: 32,
    textAlign: "center",
    background: "#0B0B0B",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #1E1E1E",
    borderTop: "3px solid #FF6B1A",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  muted: { color: "#444", fontSize: 14, margin: 0 },
  errorTitle: { fontSize: 20, fontWeight: 800, color: "#F4F4F4", margin: 0 },
  errorMsg: { fontSize: 14, color: "#666", maxWidth: 280 },
  hero: { textAlign: "center", paddingTop: 12, paddingBottom: 8 },
  logoWrap: {
    width: 64, height: 64,
    borderRadius: 20,
    background: "#1A1A1A",
    border: "1px solid #222",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 12px",
  },
  cafeName: {
    fontSize: 26, fontWeight: 800, color: "#F4F4F4",
    letterSpacing: "-0.5px", margin: 0,
  },
  tagline: { fontSize: 13, color: "#555", marginTop: 4 },
  tableCard: {
    background: "#141414", border: "1px solid #1E1E1E",
    borderRadius: 16, padding: "14px 16px",
    display: "flex", alignItems: "center", gap: 12,
  },
  tableNumber: { fontSize: 16, fontWeight: 700, color: "#F4F4F4" },
  floorLabel: { fontSize: 12, color: "#555", marginTop: 2 },
  orderBanner: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#1A1400", border: "1px solid #3A2C00",
    borderRadius: 14, padding: "12px 14px",
  },
  bannerLabel: {
    fontSize: 11, fontWeight: 600, color: "#777",
    textTransform: "uppercase", letterSpacing: "0.4px",
  },
  bannerStatus: { fontSize: 13, fontWeight: 700, color: "#FBBF24", marginTop: 2 },
  trackBtn: {
    display: "flex", alignItems: "center", gap: 2,
    background: "#FBBF24", color: "#000",
    border: "none", borderRadius: 8,
    padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  ctas: { display: "flex", flexDirection: "column", gap: 10, marginTop: 8 },
  primaryBtn: {
    width: "100%", padding: "16px",
    background: "#FF6B1A", color: "#000",
    border: "none", borderRadius: 14,
    fontSize: 15, fontWeight: 800, cursor: "pointer",
    letterSpacing: "-0.3px",
  },
  secondaryBtn: {
    width: "100%", padding: "13px",
    background: "transparent", color: "#FF6B1A",
    border: "1px solid #FF6B1A30", borderRadius: 14,
    fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
  footer: {
    textAlign: "center", fontSize: 12, color: "#2A2A2A",
    marginTop: "auto", paddingTop: 16,
  },
};
