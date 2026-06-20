"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 text-xs text-[#A3A3A3] hover:text-[#F4F1EA] flex items-center gap-1.5 cursor-pointer rounded-lg hover:bg-[#252525]/30 border border-transparent hover:border-[#252525] transition-all"
      >
        <span>{value}</span>
        <ChevronDown size={14} />
      </button>
      {isOpen && (
        <>
          {/* Click outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-1.5 w-40 bg-[#141414] border border-[#252525] rounded-lg shadow-xl z-50 py-1 font-sans overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#A3A3A3] hover:text-[#F4F1EA] hover:bg-[#252525]/50 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
