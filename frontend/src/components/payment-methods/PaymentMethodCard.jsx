"use client";

import React from "react";
import { Banknote, CreditCard, QrCode, Edit2, Trash2 } from "lucide-react";

export default function PaymentMethodCard({
  method,
  onEdit,
  onDelete,
  onToggleStatus
}) {
  const isEnabled = method.status?.toLowerCase() === "enabled";
  const type = method.type?.toLowerCase();

  // Dynamic icon depending on method type
  const renderIcon = () => {
    const iconClass = "text-[#FF6B1A]";
    switch (type) {
      case "cash":
        return <Banknote size={15} className={iconClass} />;
      case "card":
        return <CreditCard size={15} className={iconClass} />;
      case "upi":
        return <QrCode size={15} className={iconClass} />;
      default:
        return <CreditCard size={15} className={iconClass} />;
    }
  };

  return (
    <div
      className={`group bg-[#141414] border border-[#252525] hover:border-[#FF6B1A]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md ${
        !isEnabled ? "opacity-60 hover:opacity-75" : ""
      }`}
    >
      <div className="space-y-4">
        {/* Header section with Type Icon & Switch Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B1A]/5 border border-[#FF6B1A]/10 flex items-center justify-center select-none">
            {renderIcon()}
          </div>
          
          <div className="flex items-center gap-2 select-none">
            <span className={`text-[9px] uppercase tracking-wider font-semibold ${
              isEnabled ? "text-green-500" : "text-[#7A7A7A]"
            }`}>
              {method.status}
            </span>
            {/* Custom iOS-like toggle switch */}
            <button
              onClick={() => onToggleStatus && onToggleStatus(method)}
              type="button"
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEnabled ? "bg-[#FF6B1A]" : "bg-[#252525]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Name and Description */}
        <div className="text-left space-y-1">
          <h3 className="text-sm font-bold text-[#F4F1EA] tracking-tight">
            {method.name}
          </h3>
          <p className="text-[10px] text-[#A3A3A3] font-sans leading-relaxed min-h-[30px]">
            {method.description || "Configure POS transaction settings."}
          </p>
        </div>

        {/* Configuration Details Box */}
        {type === "upi" ? (
          <div className="px-3 py-2 bg-[#0B0B0B] border border-[#252525] rounded-xl flex items-center justify-between text-left">
            <span className="text-[9px] uppercase tracking-wide text-[#7A7A7A] font-bold">UPI ID</span>
            <span className="text-[10px] font-mono text-[#F4F1EA] font-semibold tracking-wider">
              {method.upiId || "Not Configured"}
            </span>
          </div>
        ) : (
          <div className="px-3 py-2 bg-[#0B0B0B] border border-[#252525] rounded-xl flex items-center justify-between text-left select-none">
            <span className="text-[9px] uppercase tracking-wide text-[#7A7A7A] font-bold">Integration</span>
            <span className="text-[9px] text-[#A3A3A3] font-sans font-medium">
              {type === "cash" ? "Standard Till Drawer" : "Card Terminal"}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons Panel */}
      <div className="mt-4 pt-3.5 border-t border-[#252525]/40 flex items-center justify-center gap-2">
        <button
          onClick={() => onEdit && onEdit(method)}
          type="button"
          className="flex-1 h-7 rounded bg-[#252525]/50 hover:bg-[#252525] text-[11px] text-[#A3A3A3] hover:text-[#FF6B1A] flex items-center justify-center gap-1 transition-all cursor-pointer font-medium"
          title="Edit Configuration"
        >
          <Edit2 size={11} />
          <span>Configure</span>
        </button>
        <button
          onClick={() => onDelete && onDelete(method.id)}
          type="button"
          className="h-7 w-7 rounded bg-[#252525]/50 hover:bg-[#252525] text-xs text-[#A3A3A3] hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
          title="Delete Method"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
