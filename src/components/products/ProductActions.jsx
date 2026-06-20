"use client";

import React from "react";
import { Plus, Download, Upload } from "lucide-react";

export default function ProductActions({ onAddClick, onExport, onImport }) {
  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={onImport}
        type="button"
        className="h-9 px-3 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#A3A3A3] hover:text-[#F4F1EA] text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Upload size={13} />
        <span className="hidden sm:inline">Import</span>
      </button>
      
      <button
        onClick={onExport}
        type="button"
        className="h-9 px-3 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#A3A3A3] hover:text-[#F4F1EA] text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Download size={13} />
        <span className="hidden sm:inline">Export</span>
      </button>
      
      <button
        onClick={onAddClick}
        type="button"
        className="h-9 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Plus size={13} />
        <span>Add Product</span>
      </button>
    </div>
  );
}
