"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import FilterSelect from "@/components/shared/FilterSelect";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

import { tableService } from "@/services/tableService";
import { floorService } from "@/services/floorService";
import { bookingService } from "@/services/bookingService";

import TableCard from "@/components/tables/TableCard";
import ManageFloorsModal from "@/components/tables/ManageFloorsModal";
import TableFormModal from "@/components/tables/TableFormModal";

import { Grid, Plus, Edit2, Trash2, Settings, Users, Layers, LayoutGrid, QrCode, X, Download } from "lucide-react";
import { getCustomerUrl, getQrImageUrl } from "@/services/qrService";


export default function TablesPage() {
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Floor Tab Selection
  const [activeFloorId, setActiveFloorId] = useState(null);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("All Capacities");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Modals & Forms States
  const [isManageFloorsOpen, setIsManageFloorsOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [deleteTableId, setDeleteTableId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // QR Code Modal
  const [qrTable, setQrTable] = useState(null);


  // Load Floors, Tables & Bookings
  const loadData = () => {
    setLoading(true);
    Promise.all([
      floorService.getFloors(),
      tableService.getTables(),
      bookingService.getBookings()
    ])
      .then(([floorsData, tablesData, bookingsData]) => {
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

        setFloors(floorsData);
        setTables(updatedTables);
        
        // Default to the first active floor if not selected yet or if previous selection is invalid
        const activeFloorsList = floorsData.filter(f => f.status === "Active");
        if (activeFloorsList.length > 0) {
          // If the previously selected floor is still active/valid, keep it. Otherwise default to first active floor.
          if (!activeFloorId || !activeFloorsList.find(f => f.id === activeFloorId)) {
            setActiveFloorId(activeFloorsList[0].id);
          }
        } else {
          setActiveFloorId(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalculate states when floors data is refreshed
  const handleFloorsChanged = (newFloors) => {
    setFloors(newFloors);
    const activeFloorsList = newFloors.filter(f => f.status === "Active");
    if (activeFloorsList.length > 0) {
      if (!activeFloorId || !activeFloorsList.find(f => f.id === activeFloorId)) {
        setActiveFloorId(activeFloorsList[0].id);
      }
    } else {
      setActiveFloorId(null);
    }
  };

  // CRUD table action triggers
  const handleAddTableClick = () => {
    setEditingTable(null);
    setIsTableModalOpen(true);
  };

  const handleEditTableClick = (table) => {
    setEditingTable(table);
    setIsTableModalOpen(true);
  };

  const handleSaveTable = (formData) => {
    if (editingTable) {
      tableService.updateTable(editingTable.id, formData)
        .then(() => {
          loadData();
          setIsTableModalOpen(false);
          setEditingTable(null);
        })
        .catch(alert);
    } else {
      tableService.addTable(formData)
        .then(() => {
          loadData();
          setIsTableModalOpen(false);
        })
        .catch(alert);
    }
  };

  const handleDeleteTableClick = (id) => {
    setDeleteTableId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTableId) {
      tableService.deleteTable(deleteTableId)
        .then(() => {
          loadData();
          setIsDeleteOpen(false);
          setDeleteTableId(null);
        })
        .catch(alert);
    }
  };

  // Stats Computations
  const activeTablesCount = tables.filter((t) => t.status?.toLowerCase() !== "disabled" && t.status?.toLowerCase() !== "inactive").length;
  const totalSeatsCount = tables.reduce((sum, t) => sum + (parseInt(t.capacity) || 0), 0);

  // Filters Options
  const capacityOptions = ["All Capacities", "2 Seats", "4 Seats", "6+ Seats"];
  const statusOptions = ["All Statuses", "Available", "Occupied", "Reserved", "Disabled"];

  // Filtered Tables list
  const filteredTables = tables.filter((table) => {
    // Floor assignment filter
    const matchesFloor = table.floorId === activeFloorId;
    
    // Search query table number filter
    const matchesSearch = (table.number || "").toString().toLowerCase().includes(searchQuery.toLowerCase());
    
    // Capacity filter
    let matchesCapacity = true;
    if (capacityFilter === "2 Seats") matchesCapacity = parseInt(table.capacity) === 2;
    else if (capacityFilter === "4 Seats") matchesCapacity = parseInt(table.capacity) === 4;
    else if (capacityFilter === "6+ Seats") matchesCapacity = parseInt(table.capacity) >= 6;

    // Status filter
    const matchesStatus = statusFilter === "All Statuses" || table.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesFloor && matchesSearch && matchesCapacity && matchesStatus;
  });

  return (
    <DashboardLayout>
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <PageHeader 
          title="Tables & Floor Management"
          description="Design floor layouts, manage table seating, and configure terminal targets."
        />
        
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setIsManageFloorsOpen(true)}
            type="button"
            className="h-9 px-4 bg-[#252525]/80 hover:bg-[#252525] border border-[#252525] hover:border-[#FF6B1A]/40 text-[#F4F1EA] text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers size={13} />
            <span>Manage Floors</span>
          </button>
          
          <button
            onClick={handleAddTableClick}
            disabled={floors.filter(f => f.status === "Active").length === 0}
            type="button"
            className="h-9 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] disabled:opacity-50 text-black text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Tables */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Total Tables</span>
            <LayoutGrid size={16} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{tables.length}</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Tables registered across sections</p>
          </div>
        </div>

        {/* Dining Capacity */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Total Seats</span>
            <Users size={16} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{totalSeatsCount} Guests</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Simultaneous dining capacity</p>
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Active Tables</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{activeTablesCount} / {tables.length}</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Available for reservation / walk-in</p>
          </div>
        </div>

      </div>

      {/* 3. FLOOR TABS BAR */}
      <div className="border-b border-[#252525] flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 -mb-[1px]">
          {floors.filter(f => f.status === "Active").map((floor) => (
            <button
              key={floor.id}
              onClick={() => setActiveFloorId(floor.id)}
              className={`h-11 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeFloorId === floor.id
                  ? "border-[#FF6B1A] text-[#F4F1EA]"
                  : "border-transparent text-[#A3A3A3] hover:text-[#F4F1EA]"
              }`}
            >
              {floor.name}
            </button>
          ))}
          {floors.filter(f => f.status === "Active").length === 0 && (
            <span className="h-11 flex items-center text-xs text-[#5A5A5A] italic">
              No active floors. Click "Manage Floors" to configure.
            </span>
          )}
        </div>
      </div>

      {/* 4. FILTERS TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-3.5 border border-[#252525] rounded-2xl">
        <div className="w-full sm:max-w-xs">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by table number..."
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-[#A3A3A3] select-none">Capacity:</span>
            <div className="bg-[#0B0B0B] border border-[#252525] rounded-lg">
              <FilterSelect
                value={capacityFilter}
                onChange={setCapacityFilter}
                options={capacityOptions}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-[#A3A3A3] select-none">Status:</span>
            <div className="bg-[#0B0B0B] border border-[#252525] rounded-lg">
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. TABLE CARDS GRID */}
      {loading ? (
        <div className="py-24 text-center text-xs text-[#A3A3A3]">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
            <span>Loading table layouts...</span>
          </div>
        </div>
      ) : !activeFloorId ? (
        <div className="py-24 border border-[#252525] rounded-2xl bg-[#141414] text-center text-[#A3A3A3]">
          <p className="text-xs font-sans">Please create or activate a floor/section to start setting up tables.</p>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="py-24 border border-[#252525] rounded-2xl bg-[#141414] text-center text-[#A3A3A3]">
          <p className="text-xs font-sans">No tables found matching the criteria in this floor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredTables.map((table) => (
            <div key={table.id} style={{ position: "relative" }}>
              <TableCard
                table={table}
                onEdit={handleEditTableClick}
                onDelete={handleDeleteTableClick}
                interactive={true}
              />
              {/* QR button overlay */}
              <button
                onClick={() => setQrTable(table)}
                title="Show QR Code"
                className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-[#0B0B0B]/80 border border-[#252525] flex items-center justify-center text-[#A3A3A3] hover:text-[#FF6B1A] hover:border-[#FF6B1A]/40 transition-all cursor-pointer z-10"
              >
                <QrCode size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 6. MANAGE FLOORS MODAL */}
      <ManageFloorsModal
        isOpen={isManageFloorsOpen}
        onClose={() => {
          setIsManageFloorsOpen(false);
          loadData();
        }}
        onFloorsChanged={handleFloorsChanged}
      />

      {/* 7. TABLE FORM MODAL */}
      <TableFormModal
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setEditingTable(null);
        }}
        editingTable={editingTable}
        floors={floors}
        onSave={handleSaveTable}
      />

      {/* 8. CONFIRM TABLE DELETION */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete POS Table"
        message="Are you sure you want to remove this table? All session data and live orders mapped to this table number will be decoupled."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteTableId(null);
        }}
      />

      {/* QR Code Modal */}
      {qrTable && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setQrTable(null)}
        >
          <div
            style={{
              background: "#141414",
              border: "1px solid #252525",
              borderRadius: 20,
              padding: 28,
              maxWidth: 320,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#F4F4F4" }}>QR Code — {qrTable.number}</span>
              <button onClick={() => setQrTable(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", display: "flex" }}><X size={16} /></button>
            </div>
            {/* QR code rendered as URL string for demo — in prod integrate qrcode library */}
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              width: "100%",
            }}>
              <img
                src={getQrImageUrl(qrTable.id, 180)}
                alt={`QR for ${qrTable.number}`}
                width={180}
                height={180}
                style={{ display: "block" }}
              />
            </div>
            <p style={{ fontSize: 11, color: "#666", textAlign: "center", margin: 0, wordBreak: "break-all" }}>
              {getCustomerUrl(qrTable.id)}
            </p>
            <a
              href={getQrImageUrl(qrTable.id, 400)}
              download={`qr-${qrTable.number}.png`}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "100%",
                padding: "11px",
                background: "#FF6B1A",
                border: "none",
                borderRadius: 12,
                color: "#000",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                textDecoration: "none",
              }}
            >
              <Download size={14} /> Download QR
            </a>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
