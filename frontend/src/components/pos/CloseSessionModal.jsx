"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePOS } from "@/context/POSContext";
import { X, Calendar, Clock, DollarSign, Wallet, ShieldAlert, Award } from "lucide-react";

export default function CloseSessionModal() {
  const router = useRouter();
  const {
    activePOSSession,
    isCloseSessionModalOpen,
    setIsCloseSessionModalOpen,
    closePOSSession
  } = usePOS();

  if (!isCloseSessionModalOpen || !activePOSSession) return null;

  const {
    openingCash = 0,
    cashSales = 0,
    cardSales = 0,
    upiSales = 0,
    totalSales = 0,
    transactionCount = 0,
    employeeName = "Employee",
    openedAt
  } = activePOSSession;

  const expectedDrawerCash = openingCash + cashSales;

  const handleConfirmClose = () => {
    closePOSSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(val);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    }) + " (" + date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ")";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCloseSessionModalOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
      />

      {/* Modal Container */}
      <div className="bg-[#141414] border border-[#252525] rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 animate-slide-in">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-[#252525]">
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              Close Shift Session
            </h3>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Confirm your shift totals before closing the register.
            </p>
          </div>
          <button
            onClick={() => setIsCloseSessionModalOpen(false)}
            className="p-1 hover:bg-[#252525] text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shift Identity Card */}
        <div className="bg-[#1C1C1C] border border-[#252525] rounded-xl p-3.5 mb-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Cashier</span>
            <span className="text-[#FF6B1A] font-semibold">{employeeName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Session Started</span>
            <span className="text-text-primary font-mono">{formatTime(openedAt)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Transactions</span>
            <span className="text-text-primary font-bold">{transactionCount} orders</span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3 mb-6">
          <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">
            Register Drawer Tally
          </span>
          
          <div className="space-y-2.5 bg-[#1C1C1C] border border-[#252525] rounded-xl p-4">
            
            {/* Opening Cash Float */}
            <div className="flex justify-between items-center text-xs border-b border-[#252525]/50 pb-2.5">
              <span className="text-text-secondary flex items-center gap-1.5">
                <DollarSign size={13} className="text-[#A3A3A3]" />
                Opening Cash Float
              </span>
              <span className="text-text-primary font-semibold font-mono">
                {formatCurrency(openingCash)}
              </span>
            </div>

            {/* Sales Breakdown */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary pl-5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Cash Sales
                </span>
                <span className="text-text-primary font-mono">{formatCurrency(cashSales)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary pl-5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Card Sales
                </span>
                <span className="text-text-primary font-mono">{formatCurrency(cardSales)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary pl-5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  UPI / QR Sales
                </span>
                <span className="text-text-primary font-mono">{formatCurrency(upiSales)}</span>
              </div>
            </div>

            {/* Total Sales Summary */}
            <div className="flex justify-between items-center text-xs border-t border-[#252525]/50 pt-2.5">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Wallet size={13} className="text-[#FF6B1A]" />
                Total Sales
              </span>
              <span className="text-[#FF6B1A] font-extrabold font-mono text-sm">
                {formatCurrency(totalSales)}
              </span>
            </div>

            {/* Expected Drawer Cash (Opening Float + Cash Sales) */}
            <div className="flex justify-between items-center text-xs bg-[#FF6B1A]/5 border border-[#FF6B1A]/20 rounded-lg p-2.5 mt-2">
              <span className="text-text-primary font-semibold flex items-center gap-1.5">
                <DollarSign size={13} className="text-[#FF6B1A]" />
                Expected Drawer Cash
              </span>
              <span className="text-text-primary font-bold font-mono text-sm">
                {formatCurrency(expectedDrawerCash)}
              </span>
            </div>

          </div>
        </div>

        {/* Warning Callout */}
        <div className="flex gap-2.5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-yellow-500/80 text-[11px] leading-relaxed mb-6 font-medium">
          <ShieldAlert size={16} className="shrink-0 text-yellow-500 mt-0.5" />
          <span>
            Closing this shift session will store the financial summary in history and log you out. Please count drawer physical cash to verify against <strong>{formatCurrency(expectedDrawerCash)}</strong>.
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            id="cancel-close-session"
            onClick={() => setIsCloseSessionModalOpen(false)}
            type="button"
            className="flex-1 h-11 bg-transparent border border-[#252525] hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-[#F4F1EA] text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-close-session"
            onClick={handleConfirmClose}
            type="button"
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/15"
          >
            Confirm & Close Shift
          </button>
        </div>

      </div>
    </div>
  );
}
