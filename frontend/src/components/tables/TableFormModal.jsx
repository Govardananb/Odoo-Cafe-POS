"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";

export default function TableFormModal({ isOpen, onClose, editingTable, floors, onSave }) {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [floorId, setFloorId] = useState("");
  const [status, setStatus] = useState("Available");

  // Get active floors list
  const activeFloors = floors.filter(f => f.status === "Active");

  useEffect(() => {
    if (isOpen) {
      if (editingTable) {
        setNumber(editingTable.number || "");
        setCapacity(editingTable.capacity?.toString() || "4");
        setFloorId(editingTable.floorId || "");
        setStatus(editingTable.status || "Available");
      } else {
        setNumber("");
        setCapacity("4");
        setFloorId(activeFloors[0]?.id || "");
        setStatus("Available");
      }
    }
  }, [isOpen, editingTable, floors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!number.trim() || !floorId) return;

    const payload = {
      number: number.trim(),
      capacity: parseInt(capacity) || 2,
      floorId,
      status
    };

    onSave(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTable ? "Edit Table Configuration" : "Add New Cafe Table"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">
        
        {/* Table Number */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Table Number / Label</label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. 101, T1"
            required
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          />
        </div>

        {/* Seat Count & Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Capacity / Seats */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Seat Count</label>
            <input
              type="number"
              min="1"
              max="20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
            />
          </div>

          {/* Active Status */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Table Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

        </div>

        {/* Floor Assignment */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Floor Assignment</label>
          <select
            value={floorId}
            onChange={(e) => setFloorId(e.target.value)}
            required
            className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
          >
            {activeFloors.length === 0 ? (
              <option value="" disabled>No active floors configured</option>
            ) : (
              activeFloors.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))
            )}
          </select>
          {activeFloors.length === 0 && (
            <p className="text-[10px] text-red-400 mt-1">Please configure and activate a floor first.</p>
          )}
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
            disabled={activeFloors.length === 0}
            className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 disabled:opacity-50 text-black text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            Save Table
          </button>
        </div>

      </form>
    </Modal>
  );
}
