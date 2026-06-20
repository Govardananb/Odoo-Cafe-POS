"use client";

import React from "react";

export default function ConfirmDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmLabel = "Confirm", 
  cancelLabel = "Cancel" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onCancel} />
      
      {/* Dialog box */}
      <div className="w-full max-w-sm bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-4 shadow-2xl animate-slide-in">
        <div className="space-y-1 text-left">
          <h3 className="text-sm font-semibold text-[#F4F1EA] tracking-tight">{title}</h3>
          <p className="text-[11px] text-[#A3A3A3] leading-normal">{message}</p>
        </div>
        
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#F4F1EA] text-xs font-medium rounded-lg transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
