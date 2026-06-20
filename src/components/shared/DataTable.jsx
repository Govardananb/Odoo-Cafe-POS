"use client";

import React from "react";
import EmptyState from "./EmptyState";

export default function DataTable({ headers, data, loading, renderRow, emptyMessage = "No records found" }) {
  return (
    <div className="overflow-x-auto w-full border border-[#252525] rounded-2xl bg-[#141414]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#252525]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={`py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold ${
                  header.align === "right" ? "text-right" : header.align === "center" ? "text-center" : "text-left"
                }`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#252525]/40">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center text-xs text-[#A3A3A3]">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center">
                <EmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((item, idx) => renderRow(item, idx))
          )}
        </tbody>
      </table>
    </div>
  );
}
