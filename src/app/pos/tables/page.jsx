"use client";

import React, { useState, useEffect } from "react";
import POSLayout from "@/components/layout/POSLayout";
import { usePOS } from "@/context/POSContext";
import { floorService } from "@/services/floorService";
import { tableService } from "@/services/tableService";
import TableCard from "@/components/tables/TableCard";
import { Grid, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

export default function POSTablesPage() {
  const router = useRouter();
  const { currentTable, selectTable } = usePOS();
  
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeFloor, setActiveFloor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      floorService.getFloors(),
      tableService.getTables()
    ]).then(([floorsData, tablesData]) => {
      const activeFloors = floorsData.filter(f => f.status === "Active");
      setFloors(activeFloors);
      setTables(tablesData);
      
      if (activeFloors.length > 0) {
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
  }, [currentTable]);

  const handleTableSelect = (table) => {
    selectTable(activeFloor, table);
    router.push("/pos");
  };

  const floorTables = tables.filter((t) => t.floorId === activeFloor?.id);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#0B0B0B]">
        
        {/* Page Header */}
        <div className="text-left">
          <h2 className="text-lg font-bold text-[#F4F1EA] tracking-tight">
            Dining Tables Layout Selection
          </h2>
          <p className="text-xs text-[#A3A3A3] font-sans mt-0.5">
            Select an active dining table below to load its menu order ticket.
          </p>
        </div>

        {/* Section Floor Selector Tabs */}
        <div className="border-b border-[#252525] flex items-center justify-between gap-4 select-none">
          <div className="flex flex-wrap gap-2 -mb-[1px]">
            {floors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => setActiveFloor(floor)}
                className={`h-11 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeFloor?.id === floor.id
                    ? "border-[#FF6B1A] text-[#F4F1EA]"
                    : "border-transparent text-[#A3A3A3] hover:text-[#F4F1EA]"
                }`}
              >
                {floor.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table Cards Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs text-[#A3A3A3]">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
              <span>Scanning seating layout...</span>
            </div>
          </div>
        ) : floorTables.length === 0 ? (
          <div className="py-24 border border-[#252525] rounded-2xl bg-[#141414] text-center text-[#A3A3A3] font-sans text-xs">
            No tables registered in this floor section.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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

        {/* Legend / Status bar */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#252525]/40 text-[10px] text-[#A3A3A3] font-semibold select-none font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>Available (Empty / Ready)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Occupied (Active Order)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>Reserved (Upcoming Dining)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#252525] border border-neutral-700/30" />
            <span>Disabled (Section Closed)</span>
          </div>
        </div>

      </div>
    </>
  );
}
