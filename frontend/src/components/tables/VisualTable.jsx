"use client";

import React from "react";

export default function VisualTable({ capacity, number, status = "Available" }) {
  const cap = parseInt(capacity) || 2;
  const s = status?.toLowerCase();

  const getStatusClasses = () => {
    switch (s) {
      case "occupied":
        return {
          seat: "bg-[#0B0B0B] border-yellow-500/40 group-hover:border-yellow-500 group-hover:scale-110",
          table: "bg-[#141414] border-yellow-500/30 text-[#F4F1EA] group-hover:border-yellow-500 group-hover:bg-yellow-500/5"
        };
      case "reserved":
        return {
          seat: "bg-[#0B0B0B] border-indigo-500/40 group-hover:border-indigo-500 group-hover:scale-110",
          table: "bg-[#141414] border-indigo-500/30 text-[#F4F1EA] group-hover:border-indigo-500 group-hover:bg-indigo-500/5"
        };
      case "disabled":
      case "inactive":
        return {
          seat: "bg-[#141414] border-[#252525] opacity-55",
          table: "bg-[#1A1A1A] border-[#252525] text-[#5A5A5A]"
        };
      case "available":
      case "active":
      default:
        return {
          seat: "bg-[#0B0B0B] border-[#FF6B1A]/40 group-hover:border-[#FF6B1A] group-hover:scale-110",
          table: "bg-[#141414] border-[#FF6B1A]/20 text-[#F4F1EA] group-hover:border-[#FF6B1A] group-hover:bg-[#FF6B1A]/5"
        };
    }
  };

  const statusClasses = getStatusClasses();

  // Generate seat position classes based on capacity
  const getSeats = () => {
    const seats = [];
    for (let i = 0; i < cap; i++) {
      // Calculate radial angle for seats
      const angle = (i * 360) / cap;
      const radians = (angle * Math.PI) / 180;
      
      // Radial offset distance in px
      const r = 24; 
      const x = Math.round(r * Math.cos(radians));
      const y = Math.round(r * Math.sin(radians));

      seats.push({
        id: i,
        style: {
          transform: `translate(${x}px, ${y}px)`,
          left: "calc(50% - 7px)", // center the seat (half of width 14px)
          top: "calc(50% - 7px)"
        }
      });
    }
    return seats;
  };

  const seats = getSeats();

  return (
    <div className="relative w-20 h-20 flex items-center justify-center select-none mx-auto">
      {/* Radial Seats */}
      {seats.map((seat) => (
        <span
          key={seat.id}
          style={seat.style}
          className={`absolute w-3.5 h-3.5 rounded-full border transition-all duration-200 ${statusClasses.seat}`}
        />
      ))}

      {/* Main Table Circle */}
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center font-bebas text-sm font-bold tracking-wider z-10 border shadow-inner transition-all duration-300 ${statusClasses.table}`}
      >
        {number}
      </div>
    </div>
  );
}
