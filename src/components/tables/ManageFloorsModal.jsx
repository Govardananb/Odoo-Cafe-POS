"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import StatusBadge from "../shared/StatusBadge";
import { Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { floorService } from "@/services/floorService";

export default function ManageFloorsModal({ isOpen, onClose, onFloorsChanged }) {
  const [floors, setFloors] = useState([]);
  const [newFloorName, setNewFloorName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("Active");

  const loadFloors = () => {
    floorService.getFloors().then((data) => {
      setFloors(data);
      if (onFloorsChanged) onFloorsChanged(data);
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadFloors();
      setNewFloorName("");
      setEditingId(null);
    }
  }, [isOpen]);

  const handleAddFloor = (e) => {
    e.preventDefault();
    if (!newFloorName.trim()) return;

    floorService.addFloor({ name: newFloorName.trim(), status: "Active" })
      .then(() => {
        setNewFloorName("");
        loadFloors();
      })
      .catch((err) => alert(err.message));
  };

  const handleStartEdit = (floor) => {
    setEditingId(floor.id);
    setEditName(floor.name);
    setEditStatus(floor.status);
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim()) return;

    floorService.updateFloor(id, { name: editName.trim(), status: editStatus })
      .then(() => {
        setEditingId(null);
        loadFloors();
      })
      .catch((err) => alert(err.message));
  };

  const handleDeleteFloor = (id, name) => {
    const confirmMsg = `Are you sure you want to delete "${name}"? Warning: All tables assigned to this floor will need to be re-assigned or deleted.`;
    if (window.confirm(confirmMsg)) {
      floorService.deleteFloor(id)
        .then(() => {
          loadFloors();
        })
        .catch((err) => alert(err.message));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Cafe Floors & Sections">
      <div className="space-y-5 text-left font-sans">
        
        {/* Form: Add New Floor */}
        <form onSubmit={handleAddFloor} className="space-y-1.5 pb-4 border-b border-[#252525]">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
            Add New Floor / Section
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              placeholder="e.g. Ground Floor, Rooftop"
              className="flex-1 h-9 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
              required
            />
            <button
              type="submit"
              className="h-9 px-3 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* List of Existing Floors */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
            Existing Floors
          </label>
          
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {floors.length === 0 ? (
              <p className="text-xs text-[#5A5A5A] italic text-center py-4">No floors configured yet.</p>
            ) : (
              floors.map((floor) => (
                <div
                  key={floor.id}
                  className="flex items-center justify-between p-2.5 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs"
                >
                  {editingId === floor.id ? (
                    /* Edit mode inline form */
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-8 px-2 bg-[#141414] border border-[#252525] rounded text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A]"
                        required
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="h-8 px-2 bg-[#141414] border border-[#252525] rounded text-xs text-[#F4F1EA]"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(floor.id)}
                          className="p-1.5 bg-[#FF6B1A] text-black rounded hover:bg-[#FF6B1A]/90 cursor-pointer"
                          title="Save changes"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-[#252525] text-[#A3A3A3] rounded hover:text-[#F4F1EA] cursor-pointer"
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode row */
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-[#F4F1EA]">{floor.name}</span>
                        <StatusBadge status={floor.status} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(floor)}
                          className="p-1 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-[#FF6B1A] transition-colors cursor-pointer"
                          title="Edit Floor"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteFloor(floor.id, floor.name)}
                          className="p-1 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Floor"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-[#252525] hover:bg-[#252525]/80 text-[#F4F1EA] text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
}
