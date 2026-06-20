"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";

export default function CategoryFormModal({
  isOpen,
  onClose,
  editingCategory,
  onSave
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#FF6B1A");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setName(editingCategory.name || "");
        setDescription(editingCategory.description || "");
        setColor(editingCategory.color || "#FF6B1A");
        setStatus(editingCategory.status || "Active");
      } else {
        setName("");
        setDescription("");
        setColor("#FF6B1A");
        setStatus("Active");
      }
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      color: color.trim(),
      status
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? "Edit Category Details" : "Add New POS Category"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">
        {/* Category Name */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Beverages, Hot Eats"
            required
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          />
        </div>

        {/* Category Description */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Coffees, teas, and specialty sodas"
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          />
        </div>

        {/* Color Picker & HEX Input */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
            Category Accent Color
          </label>
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-lg border border-[#252525] overflow-hidden shrink-0 relative cursor-pointer">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-[-6px] w-[calc(100%+12px)] h-[calc(100%+12px)] cursor-pointer"
              />
            </div>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#FF6B1A"
              required
              className="flex-1 h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
            />
          </div>
        </div>

        {/* Status selection */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Action Buttons */}
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
            Save Category
          </button>
        </div>
      </form>
    </Modal>
  );
}
