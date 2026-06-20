"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePOS } from "@/context/POSContext";
import Logo from "@/components/layout/Logo";
import { Coins, LogOut, ArrowRight } from "lucide-react";

export default function OpenSessionView() {
  const router = useRouter();
  const { currentEmployee, openPOSSession } = usePOS();
  const [openingCash, setOpeningCash] = useState("100.00");
  const [error, setError] = useState("");

  const handleOpenSession = (e) => {
    e.preventDefault();
    const cashVal = parseFloat(openingCash);
    if (isNaN(cashVal) || cashVal < 0) {
      setError("Please enter a valid opening float amount.");
      return;
    }
    setError("");
    openPOSSession(cashVal);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  };

  const handleQuickSelect = (amount) => {
    setOpeningCash(amount.toFixed(2));
    setError("");
  };

  const presets = [50, 100, 150, 200];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B0B] text-[#F4F1EA] px-4 font-sans select-none">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6B1A]/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6B1A]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#141414] border border-[#252525] rounded-2xl p-6 md:p-8 shadow-2xl relative z-10">
        {/* Branding & Logo */}
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <div className="mt-2 text-[10px] tracking-[0.2em] font-extrabold text-[#A3A3A3] uppercase">
            POS Terminal Session Lock
          </div>
        </div>

        {/* User Greeting */}
        <div className="text-center space-y-1.5 mb-8">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            Ready to start your shift?
          </h2>
          <p className="text-xs text-text-secondary">
            Welcome back, <span className="text-[#FF6B1A] font-medium">{currentEmployee?.name || "Cashier"}</span> ({currentEmployee?.role || "Employee"})
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleOpenSession} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[14px] text-red-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Opening Cash Float
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                <span className="text-base font-medium">$</span>
              </div>
              <input
                id="opening-cash-input"
                type="number"
                step="0.01"
                min="0"
                value={openingCash}
                onChange={(e) => {
                  setOpeningCash(e.target.value);
                  if (error) setError("");
                }}
                placeholder="0.00"
                className="w-full h-14 pl-8 pr-12 bg-[#1C1C1C] border border-[#2B2B2B] focus:border-[#FF6B1A] focus:ring-1 focus:ring-[#FF6B1A] rounded-[14px] text-text-primary placeholder-[#5A5A5A] text-xl font-bold tracking-wide focus:outline-none transition-all font-mono"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#FF6B1A]">
                <Coins size={18} />
              </div>
            </div>
          </div>

          {/* Quick Setup Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">
              Quick Setup Float
            </span>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickSelect(amt)}
                  className={`h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    parseFloat(openingCash) === amt
                      ? "border-[#FF6B1A] bg-[#FF6B1A]/10 text-[#FF6B1A]"
                      : "border-[#252525] bg-[#1C1C1C] hover:border-[#FF6B1A]/40 text-[#A3A3A3] hover:text-[#F4F1EA]"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            <button
              id="open-session-submit"
              type="submit"
              className="w-full h-12 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.99] text-black font-bold rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>Open POS Session & Start Shift</span>
              <ArrowRight size={16} />
            </button>

            <button
              id="switch-cashier-btn"
              type="button"
              onClick={handleLogout}
              className="w-full h-12 bg-transparent border border-[#252525] hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-[#F4F1EA] font-semibold rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <LogOut size={14} />
              <span>Switch Employee / Log Out</span>
            </button>
          </div>
        </form>

        {/* Branding Footer */}
        <div className="mt-8 text-center border-t border-[#252525] pt-4">
          <p className="text-[9px] tracking-wider text-text-secondary/40 font-mono">
            ODOO CAFE POS TERMINAL • SECURE SESSION ENCRYPTED
          </p>
        </div>
      </div>
    </div>
  );
}
