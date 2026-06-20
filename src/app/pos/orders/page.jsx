"use client";

import React, { useState } from "react";
import POSLayout from "@/components/layout/POSLayout";
import { usePOS } from "@/context/POSContext";
import EmptyState from "@/components/shared/EmptyState";
import ReceiptModal from "@/components/pos/ReceiptModal";
import StatusBadge from "@/components/shared/StatusBadge";
import { ShoppingBag, Receipt, Printer, Calendar, Clock } from "lucide-react";

export default function POSOrdersPage() {
  const { orders, setActiveOrder, setIsReceiptModalOpen, isReceiptModalOpen } = usePOS();
  const [localSearch, setLocalSearch] = useState("");

  const handlePrintReceipt = (order) => {
    setActiveOrder(order);
    setIsReceiptModalOpen(true);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filter orders by ID or table number
  const filteredOrders = orders.filter((o) => {
    return (
      o.id?.toLowerCase().includes(localSearch.toLowerCase()) ||
      o.tableNumber?.toLowerCase().includes(localSearch.toLowerCase())
    );
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#0B0B0B]">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h2 className="text-lg font-bold text-[#F4F1EA] tracking-tight">
              POS Order History
            </h2>
            <p className="text-xs text-[#A3A3A3] font-sans mt-0.5">
              Review settled terminal tickets and print duplicate guest receipts.
            </p>
          </div>

          <div className="w-full sm:max-w-xs shrink-0">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by receipt ID or table..."
              className="w-full h-10 px-3.5 bg-[#141414] border border-[#252525] rounded-xl text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A]"
            />
          </div>
        </div>

        {/* Orders Table Container */}
        {orders.length === 0 ? (
          <div className="py-20 border border-[#252525] rounded-2xl bg-[#141414] flex justify-center">
            <EmptyState
              title="No Settled Transactions"
              message="Checkout active cart orders in the main terminal to populate order log archives."
              icon={ShoppingBag}
            />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 border border-[#252525] rounded-2xl bg-[#141414] flex justify-center">
            <EmptyState
              title="No Matches Found"
              message={`No POS orders match search query "${localSearch}".`}
              icon={ShoppingBag}
            />
          </div>
        ) : (
          <div className="border border-[#252525] rounded-2xl bg-[#141414] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-[#252525] bg-[#111111]/30">
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Receipt ID</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Date / Time</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Dining Table</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Items Count</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-right">Amount Paid</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Payment Mode</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-center">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252525]/40 text-[#A3A3A3]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#252525]/10 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#F4F1EA]">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 font-sans">
                          <Clock size={11} className="text-[#7A7A7A]" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#F4F1EA]">
                        {order.tableNumber === "Direct" 
                          ? "Counter checkout" 
                          : `Table ${order.tableNumber} (${order.floorName})`
                        }
                      </td>
                      <td className="py-3.5 px-5 max-w-xs truncate font-sans">
                        {order.items?.map(i => `${i.quantity}x ${i.product.name}`).join(", ")}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#FF6B1A]">
                        ${order.total?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={order.paymentMethod} />
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => handlePrintReceipt(order)}
                          type="button"
                          className="h-7 px-2.5 rounded bg-[#252525]/50 hover:bg-[#252525] text-xs text-[#A3A3A3] hover:text-[#FF6B1A] flex items-center justify-center gap-1 transition-all cursor-pointer font-medium mx-auto"
                        >
                          <Receipt size={11} />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Floating duplicate Receipt Invoice Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setActiveOrder(null);
        }}
      />
    </>
  );
}
