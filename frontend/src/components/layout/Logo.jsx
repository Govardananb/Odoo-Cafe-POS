import React from "react";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="font-sans text-sm tracking-[0.25em] font-semibold text-text-primary select-none">
        ODOO <span className="text-accent">CAFE</span>
      </span>
    </div>
  );
}
