"use client";

import React from "react";
import { POSProvider } from "@/context/POSContext";
import POSNavbar from "../pos/POSNavbar";

function POSLayoutContent({ children }) {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F4F1EA] font-sans flex flex-col overflow-hidden select-none">
      {/* Fixed Reusable POS Topbar Navbar */}
      <POSNavbar />

      {/* POS Terminals main viewport */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>
    </div>
  );
}

export default function POSLayout({ children }) {
  return (
    <POSProvider>
      <POSLayoutContent>{children}</POSLayoutContent>
    </POSProvider>
  );
}
