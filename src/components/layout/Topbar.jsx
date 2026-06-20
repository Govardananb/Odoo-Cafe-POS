"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import SearchBar from "../shared/SearchBar";

export default function Topbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return "OC";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "";
  };

  return (
    <header className="h-16 border-b border-[#252525] bg-[#141414] px-6 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
      
      {/* Search Bar - Modular Shared Component */}
      <div className="relative max-w-sm w-full md:w-80 shrink-0">
        <SearchBar placeholder="Search products, orders, tables..." />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Session Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#252525]/40 border border-[#252525] rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-[#A3A3A3] font-medium tracking-wide">Register #02 • Active</span>
        </div>

        {/* Notifications */}
        <button className="p-1.5 hover:bg-[#252525] rounded-lg transition-colors cursor-pointer relative">
          <Bell size={18} className="text-[#F4F1EA]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF6B1A] rounded-full" />
        </button>

        {/* User initials */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex flex-col items-end font-sans">
            <span className="text-[10px] font-bold text-[#F4F1EA]">
              {user ? user.name : "Admin"}
            </span>
            <span className="text-[8px] text-[#A3A3A3] uppercase tracking-wider font-semibold">
              {user ? user.role : "Manager"}
            </span>
          </div>
          <div 
            className="w-8 h-8 rounded-full bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 flex items-center justify-center text-xs font-semibold text-[#FF6B1A] select-none"
            title={user ? `${user.name} (${user.role})` : "Administrator"}
          >
            {getInitials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
