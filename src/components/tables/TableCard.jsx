"use client";

import React from "react";
import StatusBadge from "../shared/StatusBadge";
import VisualTable from "./VisualTable";
import { Users, Edit2, Trash2 } from "lucide-react";

export default function TableCard({
  table,
  onEdit,
  onDelete,
  interactive = true,
  isSelected = false,
  onClick
}) {
  const isAvailable = table.status?.toLowerCase() === "available" || table.status?.toLowerCase() === "active";
  const isOccupied = table.status?.toLowerCase() === "occupied";
  const isReserved = table.status?.toLowerCase() === "reserved";
  const isDisabled = table.status?.toLowerCase() === "disabled" || table.status?.toLowerCase() === "inactive";

  // Dynamic border and shadow classes depending on status and selection
  const getCardStyle = () => {
    if (isSelected) {
      return "border-[#FF6B1A] shadow-lg shadow-[#FF6B1A]/5 ring-1 ring-[#FF6B1A]/30";
    }

    if (isDisabled) {
      return "border-[#252525] opacity-60 hover:opacity-75";
    }

    switch (table.status?.toLowerCase()) {
      case "occupied":
        return "border-[#252525] hover:border-yellow-500/40 hover:shadow-md hover:shadow-yellow-500/2";
      case "reserved":
        return "border-[#252525] hover:border-indigo-500/40 hover:shadow-md hover:shadow-indigo-500/2";
      case "available":
      default:
        return "border-[#252525] hover:border-[#FF6B1A]/40 hover:shadow-md hover:shadow-[#FF6B1A]/2";
    }
  };

  const handleCardClick = (e) => {
    // Prevent triggering card click when clicking action buttons
    if (e.target.closest("button")) return;
    if (onClick) onClick(table);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-[#141414] border rounded-2xl p-4.5 space-y-4 relative flex flex-col justify-between transition-all duration-300 ${getCardStyle()} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Top Header details */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[10px] text-[#A3A3A3] font-medium font-sans">
          <Users size={11} className="text-[#FF6B1A]/70" />
          <span>{table.capacity} Seats</span>
        </span>
        <StatusBadge status={table.status} />
      </div>

      {/* Primary Visual Representation and Identifier */}
      <div className="flex flex-col items-center justify-center py-2 space-y-3">
        <VisualTable
          capacity={table.capacity}
          number={table.number}
          status={table.status}
        />
        <div className="text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#7A7A7A] font-bold block">Table</span>
          <h3 className="text-xl font-extrabold text-[#F4F1EA] tracking-tight font-sans mt-0.5">
            {table.number}
          </h3>
        </div>
      </div>

      {/* Footer / Action panel */}
      {interactive && (
        <div className="flex items-center justify-center gap-2 pt-2.5 border-t border-[#252525]/40">
          <button
            onClick={() => onEdit && onEdit(table)}
            type="button"
            className="flex-1 h-7 rounded bg-[#252525]/50 hover:bg-[#252525] text-[11px] text-[#A3A3A3] hover:text-[#FF6B1A] flex items-center justify-center gap-1 transition-all cursor-pointer font-medium"
            title="Edit Table Configuration"
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete && onDelete(table.id)}
            type="button"
            className="h-7 w-7 rounded bg-[#252525]/50 hover:bg-[#252525] text-xs text-[#A3A3A3] hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
            title="Delete Table"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
