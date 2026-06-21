import React from 'react';

export default function KdsSearch({ value, onChange }) {
  return (
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Search by order #, product, table..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
      />
    </div>
  );
}
