"use client";

import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

export default function CartItem({ item, onIncrement, onDecrement, onUpdateQty }) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-[#111111] border border-[#252525]/40 rounded-xl select-none">
      {/* Product Details */}
      <div className="flex-1 text-left min-w-0">
        <h4 className="text-xs font-bold text-[#F4F1EA] truncate">{product.name}</h4>
        <span className="text-[10px] text-[#7A7A7A] mt-0.5 block">
          ${product.price.toFixed(2)} each
        </span>
      </div>

      {/* Touch-Friendly Quantity Incrementor */}
      <div className="flex items-center gap-1 bg-[#141414] border border-[#252525] rounded-lg p-0.5 shrink-0 select-none">
        <button
          onClick={onDecrement}
          type="button"
          className="w-7 h-7 rounded bg-[#252525]/30 hover:bg-[#252525] text-[#A3A3A3] hover:text-[#FF6B1A] flex items-center justify-center transition-colors cursor-pointer"
        >
          {quantity === 1 ? <Trash2 size={10} /> : <Minus size={10} />}
        </button>
        
        <input
          type="number"
          value={quantity}
          onChange={(e) => onUpdateQty(parseInt(e.target.value) || 0)}
          className="w-8 text-center text-xs font-bold text-[#F4F1EA] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
        />

        <button
          onClick={onIncrement}
          type="button"
          className="w-7 h-7 rounded bg-[#252525]/30 hover:bg-[#252525] text-[#A3A3A3] hover:text-[#FF6B1A] flex items-center justify-center transition-colors cursor-pointer"
        >
          <Plus size={10} />
        </button>
      </div>

      {/* Line Total */}
      <div className="w-16 text-right shrink-0">
        <span className="text-xs font-extrabold text-[#F4F1EA] font-mono">
          ${lineTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
