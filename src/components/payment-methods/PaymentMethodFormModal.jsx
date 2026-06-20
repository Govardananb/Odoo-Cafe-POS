"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";

export default function PaymentMethodFormModal({
  isOpen,
  onClose,
  editingMethod,
  onSave
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Cash");
  const [description, setDescription] = useState("");
  const [upiId, setUpiId] = useState("");
  const [status, setStatus] = useState("Enabled");

  useEffect(() => {
    if (isOpen) {
      if (editingMethod) {
        setName(editingMethod.name || "");
        setType(editingMethod.type || "Cash");
        setDescription(editingMethod.description || "");
        setUpiId(editingMethod.upiId || "");
        setStatus(editingMethod.status || "Enabled");
      } else {
        setName("");
        setType("Cash");
        setDescription("");
        setUpiId("");
        setStatus("Enabled");
      }
    }
  }, [isOpen, editingMethod]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      type,
      description: description.trim(),
      upiId: type === "UPI" ? upiId.trim() : "",
      status
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMethod ? "Edit Payment Method" : "Add Payment Method"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">
        {/* Method Name */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
            Method Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Card Terminal, UPI GPay"
            required
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          />
        </div>

        {/* Method Type & Status Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Method Type */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
              Method Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card / Digital</option>
              <option value="UPI">UPI QR</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
            >
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. scan to pay with any UPI app"
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          />
        </div>

        {/* Conditional UPI ID field */}
        {type === "UPI" && (
          <div className="space-y-1 animate-slide-in">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
              UPI Merchant ID (VPA)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. cafe@ybl"
              required={type === "UPI"}
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#F4F1EA] text-xs font-medium rounded-lg transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            Save Method
          </button>
        </div>
      </form>
    </Modal>
  );
}
