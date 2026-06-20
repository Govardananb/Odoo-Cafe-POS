"use client";

import React from "react";
import StatusBadge from "../shared/StatusBadge";
import { FolderTree, Coffee, Edit2, Trash2 } from "lucide-react";

export default function CategoryCard({
  category,
  productCount = 0,
  onEdit,
  onDelete
}) {
  const accentColor = category.color || "#FF6B1A";
  const isActive = category.status?.toLowerCase() === "active";

  return (
    <div
      className={`group bg-[#141414] border-t-4 border-l border-r border-b border-[#252525] hover:border-[#252525]/60 hover:shadow-md rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 ${
        !isActive ? "opacity-70 hover:opacity-85" : ""
      }`}
      style={{ borderTopColor: accentColor }}
    >
      <div className="space-y-3">
        {/* Header section with Icon & StatusBadge */}
        <div className="flex items-center justify-between gap-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/5"
            style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
          >
            <FolderTree size={13} />
          </div>
          <StatusBadge status={category.status} />
        </div>

        {/* Core details */}
        <div className="text-left space-y-1.5">
          <h3 className="text-sm font-bold text-[#F4F1EA] tracking-tight group-hover:text-[#FF6B1A] transition-colors">
            {category.name}
          </h3>
          
          {/* Swatch & Color hex code */}
          <div className="flex items-center gap-1.5 select-none">
            <span 
              className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0" 
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[9px] text-[#7A7A7A] font-mono tracking-wider font-semibold">
              {accentColor}
            </span>
          </div>

          <p className="text-[10px] text-[#A3A3A3] line-clamp-2 leading-relaxed font-sans pt-1">
            {category.description || "Organized POS items."}
          </p>
        </div>
      </div>

      {/* Footer and Actions */}
      <div className="mt-4.5 pt-3 border-t border-[#252525]/40 flex items-center justify-between gap-2">
        <span 
          className="flex items-center gap-1 text-[10px] font-bold font-sans"
          style={{ color: isActive ? accentColor : "#A3A3A3" }}
        >
          <Coffee size={11} className="opacity-80" />
          <span>{productCount} {productCount === 1 ? "Product" : "Products"}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit && onEdit(category)}
            type="button"
            className="h-7 px-2.5 rounded bg-[#252525]/50 hover:bg-[#252525] text-[11px] text-[#A3A3A3] hover:text-[#FF6B1A] flex items-center justify-center gap-1 transition-all cursor-pointer font-medium"
            title="Edit Category"
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete && onDelete(category.id)}
            type="button"
            className="h-7 w-7 rounded bg-[#252525]/50 hover:bg-[#252525] text-xs text-[#A3A3A3] hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
            title="Delete Category"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
