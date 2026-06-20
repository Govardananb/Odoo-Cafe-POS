"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

export default function EmptyState({ title = "No records found", message = "There is no data to display in this list yet.", icon: Icon = FolderOpen }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-xs mx-auto">
      <div className="w-10 h-10 rounded-full bg-[#252525]/30 border border-[#252525] flex items-center justify-center text-[#A3A3A3] mb-3 shrink-0">
        <Icon size={18} />
      </div>
      <h3 className="text-xs font-semibold text-[#F4F1EA] tracking-tight">{title}</h3>
      <p className="text-[10px] text-[#A3A3A3] mt-1 leading-normal">{message}</p>
    </div>
  );
}
