"use client";

// Customer module layout — completely standalone, no admin chrome
// Mobile-first shell with top bar and bottom nav

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, ShoppingBag, Clock, User } from "lucide-react";

export default function CustomerLayout({ children }) {
  const pathname = usePathname();
  const [tableInfo, setTableInfo] = useState(null);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    // Read initial values
    const stored = sessionStorage.getItem("customer_table");
    if (stored) {
      setTableInfo(JSON.parse(stored));
    }
    setCustomerName(sessionStorage.getItem("customer_name") || "");

    // Poll values lightly (since sessionStorage doesn't trigger storage event on same tab)
    const interval = setInterval(() => {
      const t = sessionStorage.getItem("customer_table");
      if (t) {
        setTableInfo(JSON.parse(t));
      } else {
        setTableInfo(null);
      }
      setCustomerName(sessionStorage.getItem("customer_name") || "");
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: "/customer/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/customer/orders", label: "Orders", icon: ShoppingBag },
    { href: "/customer/tracking", label: "Track", icon: Clock },
    { href: "/customer/profile", label: "Profile", icon: User },
  ];

  return (
    <div
      style={{
        background: "#0B0B0B",
        minHeight: "100dvh",
        maxWidth: "480px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid #1E1E1E",
          background: "#0D0D0D",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "#FF6B1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UtensilsCrossed size={16} color="#000" />
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#F4F4F4",
              letterSpacing: "-0.3px",
            }}
          >
            Odoo Cafe
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {customerName && (
            <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>
              {customerName}
            </span>
          )}
          {tableInfo && (
            <div
              style={{
                background: "#FF6B1A15",
                border: "1px solid #FF6B1A30",
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: "#FF6B1A",
              }}
            >
              {tableInfo.tableNumber}
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "#0D0D0D",
          borderTop: "1px solid #1E1E1E",
          display: "flex",
          zIndex: 50,
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 0",
                gap: 4,
                color: isActive ? "#FF6B1A" : "#555",
                textDecoration: "none",
                transition: "color 0.2s",
                position: "relative",
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.5px" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
