"use client";

import React, { useState } from "react";

export default function ProductForm({ initialData, onSave, onCancel }) {
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "Coffee");
  const [price, setPrice] = useState(initialData?.price || "");
  const [status, setStatus] = useState(initialData?.status || "Active");
  const [description, setDescription] = useState(initialData?.description || "");
  const [prepTime, setPrepTime] = useState(initialData?.prepTime || "5 mins");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      name, 
      category, 
      price: parseFloat(price) || 0, 
      status, 
      description, 
      prepTime 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">
      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cardamom Tea"
          required
          className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          >
            <option value="Coffee">Coffee</option>
            <option value="Tea">Tea</option>
            <option value="Desserts">Desserts</option>
            <option value="Meals">Meals</option>
            <option value="Combos">Combos</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 50"
            required
            min="0"
            step="any"
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Prep Time</label>
          <input
            type="text"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            placeholder="e.g. 5 mins"
            required
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description..."
          rows={2}
          className="w-full p-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors resize-none font-sans"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#F4F1EA] text-xs font-medium rounded-lg transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-semibold rounded-lg transition-all cursor-pointer"
        >
          Save Product
        </button>
      </div>
    </form>
  );
}
