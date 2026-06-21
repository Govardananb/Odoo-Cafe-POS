"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import { usePOS } from "@/context/POSContext";
import { floorService } from "@/services/floorService";
import { tableService } from "@/services/tableService";
import { bookingService } from "@/services/bookingService";
import TableCard from "../tables/TableCard";

export default function FloorPopup({ isOpen, onClose }) {
  const { currentTable, selectTable } = usePOS();
  
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeFloor, setActiveFloor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load floors, tables & bookings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        floorService.getFloors(),
        tableService.getTables(),
        bookingService.getBookings()
      ]).then(([floorsData, tablesData, bookingsData]) => {
        const activeFloors = floorsData.filter(f => f.status === "Active");
        const todayStr = new Date().toISOString().split("T")[0];
        const updatedTables = tablesData.map((table) => {
          const hasReservation = bookingsData.some(
            (b) => b.tableId === table.id && b.date === todayStr && b.status === "Confirmed"
          );
          if (hasReservation && table.status === "Available") {
            return { ...table, status: "Reserved" };
          }
          return table;
        });

        setFloors(activeFloors);
        setTables(updatedTables);
        
        if (activeFloors.length > 0) {
          // Keep current floor if already selected, else default to first
          if (currentTable) {
            const matchFloor = activeFloors.find(f => f.id === currentTable.floorId);
            setActiveFloor(matchFloor || activeFloors[0]);
          } else {
            setActiveFloor(activeFloors[0]);
          }
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const handleTableSelect = (table) => {
    selectTable(activeFloor, table);
    onClose();
  };

  // Filter tables matching selected floor
  const floorTables = tables.filter((t) => t.floorId === activeFloor?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dining Seating Floor Map"
    >
      <div className="space-y-4 font-sans text-left min-h-[360px] flex flex-col justify-between select-none">
        
        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-2 border-b border-[#252525]/40 pb-2 overflow-x-auto scrollbar-none shrink-0">
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setActiveFloor(floor)}
              type="button"
              className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFloor?.id === floor.id
                  ? "bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 text-[#FF6B1A]"
                  : "bg-transparent border border-transparent text-[#A3A3A3] hover:text-[#F4F1EA]"
              }`}
            >
              {floor.name}
            </button>
          ))}
          {floors.length === 0 && !loading && (
            <span className="text-xs text-[#7A7A7A] italic">No active floors configured.</span>
          )}
        </div>

        {/* Tables Card Grid layout */}
        <div className="flex-1 overflow-y-auto max-h-[320px] py-2 scrollbar-none">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#A3A3A3]">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
                <span>Scanning seating chart...</span>
              </div>
            </div>
          ) : floorTables.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A3A3A3]">
              No tables registered in this floor section.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-2">
              {floorTables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  interactive={false}
                  isSelected={currentTable?.id === table.id}
                  onClick={handleTableSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legend / Status Helper */}
        <div className="flex items-center gap-4 pt-3 border-t border-[#252525]/40 shrink-0 text-[10px] text-[#A3A3A3] font-semibold select-none font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#252525] border border-[#7A7A7A]/30" />
            <span>Disabled</span>
          </div>
        </div>

      </div>
    </Modal>
  );
}
