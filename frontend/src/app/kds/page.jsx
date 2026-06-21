"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Play, 
  AlertTriangle,
  History,
  Trash2
} from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { posEventBus } from "@/utils/posEventBus";

export default function KDSPage() {
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // active, history
  const [now, setNow] = useState(new Date());

  const loadTickets = () => {
    if (typeof window === "undefined") return;
    const dataRaw = localStorage.getItem("odoo_cafe_kds_orders");
    const data = dataRaw ? JSON.parse(dataRaw) : [];
    
    // Sort tickets: Pending/Preparing first, then by age (older first)
    const sorted = [...data].sort((a, b) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (b.status === "Pending" && a.status !== "Pending") return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    setTickets(sorted);
  };

  useEffect(() => {
    loadTickets();

    // Listen for order updates via event bus
    const handleOrdersUpdate = () => {
      loadTickets();
    };
    posEventBus.addEventListener("ordersUpdated", handleOrdersUpdate);

    // Dynamic timer to update elapsed times every 15 seconds
    const timeInterval = setInterval(() => {
      setNow(new Date());
    }, 15000);

    return () => {
      posEventBus.removeEventListener("ordersUpdated", handleOrdersUpdate);
      clearInterval(timeInterval);
    };
  }, []);

  const updateTicketStatus = (ticketId, nextStatus) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem("odoo_cafe_kds_orders", JSON.stringify(updated));
    // Notify other components of the update
    posEventBus.dispatchEvent(new CustomEvent("ordersUpdated"));
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear completed history?")) {
      const activeTickets = tickets.filter(t => t.status !== "Completed" && t.status !== "Dispatched");
      setTickets(activeTickets);
      localStorage.setItem("odoo_cafe_kds_orders", JSON.stringify(activeTickets));
      // Notify other components of the cleared history
      posEventBus.dispatchEvent(new CustomEvent("ordersUpdated"));
    }
  };

  const getElapsedTime = (isoString) => {
    const created = new Date(isoString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const activeTickets = tickets.filter(t => t.status !== "Completed" && t.status !== "Dispatched");
  const historyTickets = tickets.filter(t => t.status === "Completed" || t.status === "Dispatched");

  const displayList = activeTab === "active" ? activeTickets : historyTickets;

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 select-none text-left">
        <PageHeader
          title="Kitchen Display System (KDS)"
          description="Monitor active tickets, tracking preparation times, status updates, and dispatch queues."
        />

        {/* Tab Controls */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
          <div className="flex bg-[#141414] border border-[#252525] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
                activeTab === "active"
                  ? "bg-[#FF6B1A] text-black"
                  : "text-[#A3A3A3] hover:text-[#F4F1EA]"
              }`}
            >
              <ChefHat size={13} />
              <span>Active orders ({activeTickets.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
                activeTab === "history"
                  ? "bg-[#252525] text-[#FF6B1A]"
                  : "text-[#A3A3A3] hover:text-[#F4F1EA]"
              }`}
            >
              <History size={13} />
              <span>Completed History</span>
            </button>
          </div>

          {activeTab === "history" && historyTickets.length > 0 && (
            <button
              onClick={clearHistory}
              className="h-10 px-4 bg-transparent hover:bg-red-500/10 border border-[#252525] hover:border-red-500/30 text-red-500 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {displayList.length === 0 ? (
        <div className="border border-[#252525] rounded-2xl bg-[#141414] py-16 flex items-center justify-center">
          <EmptyState
            title={activeTab === "active" ? "All Caught Up!" : "No History Logs"}
            message={
              activeTab === "active"
                ? "No pending beverage or meal orders in the kitchen queue right now."
                : "Completed tickets will be archived and logged here for reference."
            }
            icon={ChefHat}
          />
        </div>
      ) : (
        /* KDS Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
          {displayList.map((ticket) => {
            const minsAgo = getElapsedTime(ticket.createdAt);
            const isLate = minsAgo >= 10 && ticket.status !== "Ready";
            
            // Layout styling classes based on status
            let borderClass = "border-[#252525]";
            let bgClass = "bg-[#141414]";
            let statusDotColor = "bg-[#7A7A7A]";

            if (isLate) {
              borderClass = "border-red-500/40 animate-pulse-slow";
              statusDotColor = "bg-red-500 animate-ping";
            } else if (ticket.status === "Preparing") {
              borderClass = "border-yellow-500/30";
              statusDotColor = "bg-yellow-500";
            } else if (ticket.status === "Ready") {
              borderClass = "border-green-500/30";
              statusDotColor = "bg-green-500";
            }

            return (
              <div 
                key={ticket.id} 
                className={`border rounded-2xl ${borderClass} ${bgClass} overflow-hidden flex flex-col justify-between shadow-lg select-none`}
              >
                {/* Ticket Header */}
                <div className="border-b border-[#252525]/60 bg-[#111111]/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#F4F1EA]">
                        Table {ticket.tableNumber}
                      </h4>
                      <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wide mt-0.5 block uppercase">
                        {ticket.floorName || "Dining Area"}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#A3A3A3]">
                        {ticket.id}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                        <span className="text-[10px] uppercase font-bold text-[#A3A3A3] tracking-wide scale-90">
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Body / Items List */}
                <div className="p-4 flex-1 space-y-3 min-h-[120px]">
                  {ticket.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between text-xs gap-3">
                      <span className="text-[#F4F1EA] font-bold font-sans">
                        {item.name}
                      </span>
                      <span className="text-[#FF6B1A] font-extrabold font-mono text-sm">
                        x {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ticket Footer (Timer & Actions) */}
                <div className="border-t border-[#252525]/60 bg-[#111111]/20 p-3.5 space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#A3A3A3]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className={isLate ? "text-red-500" : "text-[#7A7A7A]"} />
                      <span className={`font-mono ${isLate ? "text-red-500 font-bold" : ""}`}>
                        {minsAgo === 0 ? "Just now" : `${minsAgo}m ago`}
                      </span>
                    </div>
                    {isLate && (
                      <span className="text-[9px] font-bold text-red-500 flex items-center gap-0.5 uppercase tracking-wide">
                        <AlertTriangle size={10} />
                        Delayed!
                      </span>
                    )}
                  </div>

                  {/* Actions Drawer */}
                  {ticket.status === "Pending" && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, "Preparing")}
                      className="w-full h-9 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/25 hover:border-yellow-500/40 text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {ticket.status === "Preparing" && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, "Ready")}
                      className="w-full h-9 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/25 hover:border-green-500/40 text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={12} />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {ticket.status === "Ready" && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, "Completed")}
                      className="w-full h-9 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-[10px] font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={12} strokeWidth={2.5} />
                      <span>Dispatch Order</span>
                    </button>
                  )}

                  {ticket.status === "Completed" && (
                    <div className="h-9 flex items-center justify-center bg-[#252525]/30 rounded-xl border border-[#252525]/40 text-[10px] font-bold text-[#7A7A7A] uppercase tracking-wider">
                      Dispatched
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
