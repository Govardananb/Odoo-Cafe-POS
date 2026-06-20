"use client";

import React from "react";
import Link from "next/link";

export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-[#252525]/20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[#A3A3A3] mt-1 font-sans">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex shrink-0">
          {action.href ? (
            <Link
              href={action.href}
              className="h-9 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              {action.icon && <action.icon size={14} />}
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="h-9 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              {action.icon && <action.icon size={14} />}
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
