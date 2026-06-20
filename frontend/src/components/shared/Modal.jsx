"use client";

import React from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      
      <div className="w-full max-w-md bg-[#141414] border border-[#252525] rounded-2xl p-6 space-y-4 shadow-2xl relative animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#A3A3A3] hover:text-[#F4F1EA] hover:bg-[#252525]/50 transition-all cursor-pointer"
          title="Close Modal"
        >
          <X size={16} />
        </button>

        <h3 className="text-sm font-semibold text-[#F4F1EA] tracking-tight border-b border-[#252525] pb-3 text-left">
          {title}
        </h3>

        <div className="pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
