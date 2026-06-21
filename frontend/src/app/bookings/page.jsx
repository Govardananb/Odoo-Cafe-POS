"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { bookingService } from "@/services/bookingService";
import { tableService } from "@/services/tableService";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  Clock, 
  User, 
  Users, 
  Grid,
  CheckCircle,
  AlertOctagon
} from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import DataTable from "@/components/shared/DataTable";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState("Today"); // Today, Upcoming, History, All

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    tableId: "",
    date: "",
    time: "",
    partySize: "2",
    notes: "",
    status: "Confirmed"
  });

  // Deletion
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      bookingService.getBookings(),
      tableService.getTables()
    ]).then(([bookingsList, tablesList]) => {
      setBookings(bookingsList);
      setTables(tablesList);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddClick = () => {
    setEditingBooking(null);
    setFormData({
      name: "",
      phone: "",
      tableId: tables[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      time: "19:00",
      partySize: "2",
      notes: "",
      status: "Confirmed"
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setFormData({
      name: booking.name,
      phone: booking.phone,
      tableId: booking.tableId,
      date: booking.date,
      time: booking.time,
      partySize: booking.partySize.toString(),
      notes: booking.notes || "",
      status: booking.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleSaveBooking = (e) => {
    e.preventDefault();
    const matchedTable = tables.find(t => t.id === formData.tableId);
    const finalData = {
      ...formData,
      tableNumber: matchedTable ? matchedTable.number.toString() : ""
    };

    if (editingBooking) {
      bookingService.updateBooking(editingBooking.id, finalData)
        .then(() => {
          loadData();
          setIsModalOpen(false);
        })
        .catch(alert);
    } else {
      bookingService.addBooking(finalData)
        .then(() => {
          loadData();
          setIsModalOpen(false);
        })
        .catch(alert);
    }
  };

  const handleStatusChange = (bookingId, nextStatus) => {
    bookingService.updateBooking(bookingId, { status: nextStatus })
      .then((updatedBooking) => {
        // If seated, automatically mark table as occupied
        if (nextStatus === "Seated") {
          tableService.updateTable(updatedBooking.tableId, { status: "Occupied" })
            .then(() => {
              loadData();
              alert(`Guest seated! Table ${updatedBooking.tableNumber} status set to Occupied.`);
            });
        } else if (nextStatus === "Cancelled") {
          loadData();
        } else {
          loadData();
        }
      })
      .catch(alert);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      bookingService.deleteBooking(deleteId)
        .then(() => {
          loadData();
          setIsDeleteOpen(false);
        })
        .catch(alert);
    }
  };

  // Filter Bookings logic
  const getFilteredBookings = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    return bookings.filter((b) => {
      if (filterPeriod === "Today") {
        return b.date === todayStr;
      } else if (filterPeriod === "Upcoming") {
        return b.date > todayStr;
      } else if (filterPeriod === "History") {
        return b.date < todayStr || b.status === "Seated" || b.status === "Cancelled";
      }
      return true;
    });
  };

  const filteredBookings = getFilteredBookings();

  const tableHeaders = [
    { label: "Ref ID" },
    { label: "Guest Name" },
    { label: "Time" },
    { label: "Table" },
    { label: "Party Size" },
    { label: "Status" },
    { label: "Quick Seating Status Actions", align: "center" },
    { label: "Actions", align: "center" }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 select-none text-left font-sans">
        <PageHeader
          title="Table Reservations & Bookings"
          description="Log table bookings, private guest seatings, and manage arrival times."
        />

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto shrink-0">
          {/* Time range tab filters */}
          <div className="flex bg-[#141414] border border-[#252525] p-1 rounded-xl">
            {["Today", "Upcoming", "History", "All"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer uppercase ${
                  filterPeriod === p
                    ? "bg-[#252525] text-[#FF6B1A]"
                    : "text-[#A3A3A3] hover:text-[#F4F1EA]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddClick}
            className="h-10 px-5 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#FF6B1A]/10"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Book A Table</span>
          </button>
        </div>
      </div>

      {/* Listing grid */}
      <div className="relative">
        <DataTable
          headers={tableHeaders}
          data={filteredBookings}
          loading={loading}
          emptyMessage={`No reservations booked under timeframe "${filterPeriod}".`}
          renderRow={(booking) => (
            <tr key={booking.id} className="hover:bg-[#252525]/10 transition-colors text-left text-xs">
              <td className="py-3.5 px-5 font-mono font-bold text-[#FF6B1A]">
                {booking.id}
              </td>
              <td className="py-3.5 px-5">
                <div className="flex flex-col">
                  <span className="font-bold text-[#F4F1EA]">{booking.name}</span>
                  <span className="text-[10px] text-[#7A7A7A] font-mono mt-0.5">{booking.phone}</span>
                </div>
              </td>
              <td className="py-3.5 px-5 font-semibold text-[#F4F1EA]">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-[#7A7A7A]" />
                  <span>{booking.date} @ {booking.time}</span>
                </div>
              </td>
              <td className="py-3.5 px-5 font-extrabold text-[#F4F1EA]">
                Table {booking.tableNumber}
              </td>
              <td className="py-3.5 px-5 font-bold font-mono">
                {booking.partySize} Guests
              </td>
              <td className="py-3.5 px-5">
                <StatusBadge status={booking.status} />
              </td>
              <td className="py-3.5 px-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  {booking.status === "Confirmed" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(booking.id, "Seated")}
                        className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 hover:border-green-500/35 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                      >
                        Seat Guest
                      </button>
                      <button
                        onClick={() => handleStatusChange(booking.id, "Cancelled")}
                        className="px-2.5 py-1 bg-transparent hover:bg-red-500/10 text-[#7A7A7A] hover:text-red-500 border border-[#252525] hover:border-red-500/20 rounded-lg font-semibold text-[10px] uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === "Seated" && (
                    <span className="text-[10px] font-semibold text-green-500 flex items-center gap-1">
                      <CheckCircle size={10} /> Seated
                    </span>
                  )}
                  {booking.status === "Cancelled" && (
                    <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                      <AlertOctagon size={10} /> Cancelled
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3.5 px-5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => handleEditClick(booking)}
                    className="p-1 text-[#A3A3A3] hover:text-[#FF6B1A] hover:bg-[#252525] rounded transition-all cursor-pointer"
                    title="Edit Booking"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(booking.id)}
                    className="p-1 text-[#A3A3A3] hover:text-red-500 hover:bg-[#252525] rounded transition-all cursor-pointer"
                    title="Delete Booking"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141414] border border-[#252525] rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in text-left select-none font-sans">
            <div className="h-14 border-b border-[#252525] px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#FF6B1A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">
                  {editingBooking ? "Edit Seating details" : "Schedule Table Reservation"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-[#F4F1EA]">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
                    placeholder="e.g. Sneha Menon"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Guest Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Select Dining Table
                  </label>
                  <select
                    value={formData.tableId}
                    onChange={(e) => setFormData(prev => ({ ...prev, tableId: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors appearance-none cursor-pointer font-sans"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        Table {t.number} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Party Size (Guests)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.partySize}
                    onChange={(e) => setFormData(prev => ({ ...prev, partySize: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Reservation Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="2"
                  className="w-full bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 py-2 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors resize-none"
                  placeholder="Seating preferences, allergics..."
                />
              </div>

              <div className="pt-4 border-t border-[#252525] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 bg-transparent border border-[#252525] hover:bg-[#252525] text-[#A3A3A3] hover:text-[#F4F1EA] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>Reserve Table</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Reservation Booking"
        message="Are you sure you want to cancel and permanently delete this dining reservation?"
        confirmLabel="Remove Booking"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
      />

    </DashboardLayout>
  );
}
