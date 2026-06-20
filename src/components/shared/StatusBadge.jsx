"use client";

import React from "react";

export default function StatusBadge({ status }) {
  const getBadgeStyle = (val) => {
    const s = val?.toLowerCase();
    switch (s) {
      case "paid":
      case "active":
      case "available":
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "draft":
      case "pending":
      case "occupied":
        return "text-yellow-500 bg-yellow-500/10";
      case "cancelled":
      case "inactive":
      case "closed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-[#A3A3A3] bg-[#252525]/30";
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-[10px] text-[9px] font-semibold tracking-wide uppercase inline-block select-none ${getBadgeStyle(status)}`}>
      {status}
    </span>
  );
}
