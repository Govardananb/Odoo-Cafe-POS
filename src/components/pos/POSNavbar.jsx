"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePOS } from "@/context/POSContext";
import SearchBar from "../shared/SearchBar";
import { 
  ShoppingBag, 
  Users, 
  Grid, 
  Coffee, 
  LogOut, 
  User, 
  LayoutDashboard 
} from "lucide-react";

export default function POSNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentEmployee,
    currentFloor,
    currentTable,
    searchQuery,
    setSearchQuery,
    setIsFloorPopupOpen,
    activePOSSession,
    setIsCloseSessionModalOpen
  } = usePOS();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  };

  const getInitials = (name) => {
    if (!name) return "OC";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "";
  };

  const isTerminal = pathname === "/pos";

  return (
    <header className="h-16 border-b border-[#252525] bg-[#141414] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 shrink-0 select-none">
      
      {/* 1. Logo and Active Table Status */}
      <div className="flex items-center gap-4">
        <Link href="/pos" className="flex items-center gap-2">
          <span className="text-xs tracking-[0.2em] font-extrabold text-[#F4F1EA] shrink-0">
            OC <span className="text-[#FF6B1A]">POS</span>
          </span>
        </Link>
        
        {/* Divider */}
        <span className="h-5 w-[1px] bg-[#252525] hidden sm:inline-block" />

        {/* Dynamic Table Selector Pill */}
        <button
          onClick={() => setIsFloorPopupOpen(true)}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all text-[10px] font-semibold cursor-pointer ${
            currentTable
              ? "bg-[#FF6B1A]/8 border-[#FF6B1A]/20 text-[#FF6B1A]"
              : "bg-yellow-500/5 border-yellow-500/20 text-yellow-500 animate-pulse"
          }`}
        >
          <Grid size={11} />
          <span>
            {currentTable 
              ? `Table ${currentTable.number} • ${currentFloor?.name || "Floor"}` 
              : "Select Dining Table"
            }
          </span>
        </button>
      </div>

      {/* 2. Interactive Search Box (Only on main terminal page) */}
      <div className="flex-1 max-w-sm hidden md:block">
        {isTerminal ? (
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search menu items..."
          />
        ) : (
          <div className="h-10" /> // empty spacer
        )}
      </div>

      {/* 3. Action Tabs & User Panel */}
      <div className="flex items-center gap-3">
        {/* Go back to Terminal if on sub-page */}
        {!isTerminal && (
          <Link
            href="/pos"
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-[#252525] hover:border-[#FF6B1A]/40 bg-[#FF6B1A]/10 text-xs text-[#FF6B1A] font-semibold transition-all"
          >
            <Coffee size={13} />
            <span>Terminal</span>
          </Link>
        )}

        {/* Quick Navigations */}
        <Link
          href="/pos/orders"
          className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border transition-all text-xs font-semibold ${
            pathname === "/pos/orders"
              ? "border-[#FF6B1A]/40 text-[#FF6B1A] bg-[#FF6B1A]/5"
              : "border-[#252525] hover:border-[#FF6B1A]/40 bg-[#252525]/30 text-[#A3A3A3] hover:text-[#F4F1EA]"
          }`}
          title="POS Orders Registry"
        >
          <ShoppingBag size={13} />
          <span className="hidden lg:inline">POS Orders</span>
        </Link>

        <Link
          href="/pos/customers"
          className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border transition-all text-xs font-semibold ${
            pathname === "/pos/customers"
              ? "border-[#FF6B1A]/40 text-[#FF6B1A] bg-[#FF6B1A]/5"
              : "border-[#252525] hover:border-[#FF6B1A]/40 bg-[#252525]/30 text-[#A3A3A3] hover:text-[#F4F1EA]"
          }`}
          title="Checkout Customer Directory"
        >
          <Users size={13} />
          <span className="hidden lg:inline">Customers</span>
        </Link>

        <Link
          href="/pos/tables"
          className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border transition-all text-xs font-semibold ${
            pathname === "/pos/tables"
              ? "border-[#FF6B1A]/40 text-[#FF6B1A] bg-[#FF6B1A]/5"
              : "border-[#252525] hover:border-[#FF6B1A]/40 bg-[#252525]/30 text-[#A3A3A3] hover:text-[#F4F1EA]"
          }`}
          title="Floor Layout visualizer"
        >
          <Grid size={13} />
          <span className="hidden lg:inline">Table View</span>
        </Link>

        {/* Admin Dashboard Return */}
        {currentEmployee && currentEmployee.role === "admin" && (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-[#252525] hover:border-[#FF6B1A]/40 bg-[#252525]/30 text-xs text-[#A3A3A3] hover:text-[#F4F1EA] font-semibold transition-all"
            title="Return to Backoffice Admin"
          >
            <LayoutDashboard size={13} />
            <span className="hidden lg:inline">Admin</span>
          </Link>
        )}

        {/* Active shift details & Close Shift action */}
        {activePOSSession && (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 bg-green-500/5 border border-green-500/20 text-green-400 text-[10px] font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Float: ${activePOSSession.openingCash.toFixed(2)}</span>
            </div>
            
            <button
              id="close-shift-nav-btn"
              onClick={() => setIsCloseSessionModalOpen(true)}
              type="button"
              className="flex items-center gap-1 px-2.5 h-9 rounded-lg border border-red-500/25 hover:border-red-500/40 bg-red-500/10 text-xs text-red-400 font-bold transition-all cursor-pointer"
              title="Close Shift Summary"
            >
              <span>Close Shift</span>
            </button>
          </div>
        )}

        {/* Divider */}
        <span className="h-5 w-[1px] bg-[#252525]" />

        {/* Employee session block & Logout */}
        <div className="flex items-center gap-2 select-none">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#F4F1EA]">
              {currentEmployee ? currentEmployee.name : "Employee"}
            </span>
            <span className="text-[8px] text-[#A3A3A3] uppercase tracking-wider font-semibold">
              {currentEmployee ? currentEmployee.role : "Cashier"}
            </span>
          </div>

          <div 
            className="w-8 h-8 rounded-full bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 flex items-center justify-center text-xs font-bold text-[#FF6B1A]"
            title={currentEmployee ? `${currentEmployee.name} (${currentEmployee.role})` : "Session Active"}
          >
            {getInitials(currentEmployee?.name)}
          </div>

          <button
            onClick={handleLogout}
            type="button"
            className="p-1.5 hover:bg-[#252525] text-[#A3A3A3] hover:text-[#FF6B1A] rounded-lg transition-colors cursor-pointer"
            title="Logout / Close Terminal Session"
          >
            <LogOut size={14} />
          </button>
        </div>

      </div>
    </header>
  );
}
