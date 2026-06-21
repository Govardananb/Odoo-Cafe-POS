"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Phone, MapPin, Calendar, Clock } from "lucide-react";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [tableInfo, setTableInfo] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    const name = sessionStorage.getItem("customer_name") || "";
    const phone = sessionStorage.getItem("customer_phone") || "";
    setCustomerName(name);
    setCustomerPhone(phone);

    const stored = sessionStorage.getItem("customer_table");
    if (stored) {
      setTableInfo(JSON.parse(stored));
    }
  }, []);

  const handleClearSession = () => {
    if (confirm("Are you sure you want to end your dining session? This will clear your name and active cart.")) {
      sessionStorage.removeItem("customer_name");
      sessionStorage.removeItem("customer_phone");
      if (tableInfo) {
        sessionStorage.removeItem("customer_cart_" + tableInfo.tableId);
      }
      // Keep table context so they don't have to rescan QR, but can change name
      router.push("/customer/menu");
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Your Session</h2>

      {/* Customer Info Card */}
      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          <User size={32} color="#000" />
        </div>
        <h3 style={styles.name}>{customerName || "Cafe Guest"}</h3>
        {customerPhone && (
          <div style={styles.phoneRow}>
            <Phone size={13} color="#666" />
            <span style={styles.phoneText}>{customerPhone}</span>
          </div>
        )}
      </div>

      {/* Session/Table Context */}
      <h3 style={styles.sectionTitle}>Dining Location</h3>
      {tableInfo ? (
        <div style={styles.tableInfoCard}>
          <div style={styles.infoRow}>
            <MapPin size={16} color="#FF6B1A" />
            <div style={styles.infoContent}>
              <div style={styles.infoLabel}>Table Number</div>
              <div style={styles.infoVal}>{tableInfo.tableNumber}</div>
            </div>
          </div>
          <div style={styles.infoRow}>
            <Calendar size={16} color="#FF6B1A" />
            <div style={styles.infoContent}>
              <div style={styles.infoLabel}>Floor Location</div>
              <div style={styles.infoVal}>{tableInfo.floorName}</div>
            </div>
          </div>
          <div style={styles.infoRow}>
            <Clock size={16} color="#FF6B1A" />
            <div style={styles.infoContent}>
              <div style={styles.infoLabel}>Capacity</div>
              <div style={styles.infoVal}>{tableInfo.capacity} seats available</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.noTableCard}>
          <p style={{ color: "#555", fontSize: 13, margin: 0 }}>No active table context. Please scan a table QR code.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: "auto", paddingTop: 32 }}>
        <button onClick={handleClearSession} style={styles.logoutBtn}>
          <LogOut size={16} />
          End Session / Log Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "20px 16px 100px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: "calc(100dvh - 140px)",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#F4F4F4",
    margin: 0,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: 8,
    marginHorizontal: 0,
  },
  profileCard: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 20,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#FF6B1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: 800,
    color: "#F4F4F4",
    margin: 0,
  },
  phoneRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  phoneText: {
    fontSize: 13,
    color: "#888",
  },
  tableInfoCard: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 20,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  infoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: "#555",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoVal: {
    fontSize: 14,
    color: "#F4F4F4",
    fontWeight: 700,
  },
  noTableCard: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 20,
    padding: 20,
    textAlign: "center",
  },
  logoutBtn: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    border: "1px solid #EF444430",
    background: "transparent",
    color: "#EF4444",
    fontWeight: 720,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "background 0.2s",
  },
};
