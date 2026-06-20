"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import { usePOS } from "@/context/POSContext";
import { Percent, Trash2 } from "lucide-react";

export default function DiscountModal({ isOpen, onClose }) {
  const { discount, applyTableDiscount } = usePOS();
  const [customDiscount, setCustomDiscount] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCustomDiscount(discount > 0 ? discount.toString() : "");
    }
  }, [isOpen, discount]);

  const handlePresetSelect = (pct) => {
    applyTableDiscount(pct);
    onClose();
  };

  const handleApply = (e) => {
    e.preventDefault();
    const val = parseInt(customDiscount) || 0;
    if (val < 0 || val > 100) {
      alert("Please enter a percentage between 0 and 100.");
      return;
    }
    applyTableDiscount(val);
    onClose();
  };

  const handleClear = () => {
    applyTableDiscount(0);
    onClose();
  };

  const presets = [5, 10, 15, 20, 25, 50];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply Bill Discount"
    >
      <div className="space-y-4 font-sans text-left select-none">
        
        {/* Preset grid buttons */}
        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-wide text-[#7A7A7A] font-bold block">
            Preset Discounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((pct) => {
              const isSelected = discount === pct;
              return (
                <button
                  key={pct}
                  onClick={() => handlePresetSelect(pct)}
                  type="button"
                  className={`h-11 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                      : "bg-[#0B0B0B] border-[#252525] hover:border-[#252525]/80 text-[#F4F1EA]"
                  }`}
                >
                  {pct}% OFF
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input form */}
        <form onSubmit={handleApply} className="space-y-3 pt-1.5">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wide text-[#7A7A7A] font-bold block">
              Custom Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
                placeholder="Enter custom rate..."
                className="w-full h-11 pl-3 pr-8 bg-[#0B0B0B] border border-[#252525] rounded-xl text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-indigo-500 font-mono"
              />
              <Percent size={13} className="absolute right-3 top-4 text-[#7A7A7A]" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-3 border-t border-[#252525]/40 mt-4 gap-2">
            {discount > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                className="h-10 px-3 bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-500 text-xs font-medium rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#F4F1EA] text-xs font-medium rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-bold rounded-lg transition-all cursor-pointer font-sans"
              >
                Apply
              </button>
            </div>
          </div>
        </form>

      </div>
    </Modal>
  );
}
