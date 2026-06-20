"use client";

import React from "react";
import { POSProvider, usePOS } from "@/context/POSContext";
import POSNavbar from "../pos/POSNavbar";
import OpenSessionView from "../pos/OpenSessionView";
import CloseSessionModal from "../pos/CloseSessionModal";

function POSLayoutContent({ children }) {
  const { activePOSSession } = usePOS();

  if (!activePOSSession) {
    return <OpenSessionView />;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F4F1EA] font-sans flex flex-col overflow-hidden select-none">
      {/* Fixed Reusable POS Topbar Navbar */}
      <POSNavbar />

      {/* POS Terminals main viewport */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>

      {/* Close Shift session tally dialog */}
      <CloseSessionModal />
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
