"use client";

import React from "react";
import Modal from "../shared/Modal";
import { usePOS } from "@/context/POSContext";
import { Receipt, Printer, QrCode, Heart } from "lucide-react";

export default function ReceiptModal({ isOpen, onClose, order }) {
  let contextActiveOrder = null;
  let contextSettings = null;
  try {
    const pos = usePOS();
    contextActiveOrder = pos?.activeOrder;
    contextSettings = pos?.settings;
  } catch (e) {
    // Gracefully handle outside POSProvider rendering
  }

  const activeOrder = order || contextActiveOrder;
  const settings = contextSettings || {
    cafeName: "OFFLINE CLUB",
    address: "12, Khader Nawaz Khan Rd, Nungambakkam, Chennai - 600006",
    phone: "+91 44 4567 8901",
    currencySymbol: "₹",
    taxRate: 5
  };
  const currencySymbol = settings.currencySymbol;

  if (!activeOrder) return null;

  const isUpi = activeOrder.paymentMethod?.toLowerCase().includes("upi");

  // Format date
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Invoice Receipt"
    >
      <div className="space-y-4 text-[#F4F1EA] font-sans text-left select-none">
        
        {/* Ticket Box */}
        <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-5 space-y-4 font-mono text-[11px] relative overflow-hidden select-text">
          
          {/* Top Receipt header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-[#252525]">
            <h3 className="text-sm font-bold tracking-[0.25em] text-[#FF6B1A] font-sans select-none uppercase">
              {settings.cafeName}
            </h3>
            <p className="text-[9px] text-[#7A7A7A] uppercase select-none">
              {settings.address}
            </p>
            <p className="text-[9px] text-[#7A7A7A] uppercase select-none">
              Tel: {settings.phone}
            </p>
          </div>

          {/* Metadata details */}
          <div className="space-y-1 pt-1 text-[#A3A3A3]">
            <div className="flex justify-between">
              <span>Receipt ID:</span>
              <span className="text-[#F4F1EA] font-bold">{activeOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date / Time:</span>
              <span className="text-[#F4F1EA]">{formatDate(activeOrder.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span className="text-[#F4F1EA]">{activeOrder.cashier}</span>
            </div>
            <div className="flex justify-between">
              <span>Table / Section:</span>
              <span className="text-[#F4F1EA]">
                {activeOrder.tableNumber === "Direct" 
                  ? "Direct POS Checkout" 
                  : `Table ${activeOrder.tableNumber} (${activeOrder.floorName || "Floor"})`
                }
              </span>
            </div>
          </div>

          {/* Ticket Items List */}
          <div className="border-t border-b border-dashed border-[#252525] py-3 space-y-2">
            <div className="flex justify-between text-[#7A7A7A] font-bold select-none text-[10px]">
              <span>ITEMS / QTY</span>
              <span>TOTAL</span>
            </div>
            
            <div className="space-y-1.5 pt-0.5">
              {activeOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-baseline">
                  <div className="max-w-[180px]">
                    <span className="text-[#F4F1EA] font-bold">{item.product.name}</span>
                    <span className="text-[#7A7A7A] block text-[9px] mt-0.5">
                      {item.quantity} x {currencySymbol}{item.product.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[#F4F1EA] font-bold">
                    {currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Totals */}
          <div className="space-y-1.5 pt-1 text-[#A3A3A3]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-[#F4F1EA]">{currencySymbol}{activeOrder.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({settings.taxRate}%):</span>
              <span className="text-[#F4F1EA]">{currencySymbol}{activeOrder.tax?.toFixed(2)}</span>
            </div>
            {activeOrder.discountPct > 0 && (
              <div className="flex justify-between text-indigo-400">
                <span>Discount ({activeOrder.discountPct}%):</span>
                <span>-{currencySymbol}{activeOrder.discount?.toFixed(2)}</span>
              </div>
            )}
            {activeOrder.appliedCoupon && (
              <div className="flex justify-between text-[#FF6B1A]">
                <span>Coupon ({activeOrder.appliedCoupon.code}):</span>
                <span>-{currencySymbol}{activeOrder.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold text-[#F4F1EA] pt-2 border-t border-[#252525]/30">
              <span>TOTAL PAID:</span>
              <span className="text-[#FF6B1A]">{currencySymbol}{activeOrder.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[9px] pt-1">
              <span>Payment Mode:</span>
              <span className="text-[#FF6B1A] uppercase font-bold">{activeOrder.paymentMethod}</span>
            </div>
          </div>

          {/* Dynamic UPI QR display inside receipt for payment verification */}
          {isUpi && (
            <div className="mt-4 pt-3.5 border-t border-dashed border-[#252525] flex flex-col items-center justify-center space-y-2 select-none">
              <div className="w-24 h-24 bg-white border border-[#252525] rounded-lg p-2 flex items-center justify-center relative shadow-inner">
                {/* Visual mock QR code drawing */}
                <div className="w-full h-full bg-[#111111] flex flex-col items-center justify-center rounded">
                  <QrCode size={40} className="text-[#FF6B1A] animate-pulse" />
                  <span className="text-[7px] text-[#A3A3A3] font-bold mt-1 font-mono">SCAN TO VERIFY</span>
                </div>
              </div>
              <div className="text-center font-sans">
                <span className="text-[9px] text-[#A3A3A3] block font-mono">Merchant VPA: cafe@ybl</span>
                <span className="text-[8px] text-[#7A7A7A] mt-0.5 block">Payment settled via unified QR gateway</span>
              </div>
            </div>
          )}

          {/* Receipt Footer tag */}
          <div className="text-center pt-3 border-t border-dashed border-[#252525] space-y-1 select-none text-[#7A7A7A]">
            <p className="flex items-center justify-center gap-1">
              <span>Made with</span>
              <Heart size={9} className="text-red-500 fill-red-500" />
              <span>at Odoo Cafe</span>
            </p>
            <p className="text-[8px] tracking-widest font-sans uppercase">
              Thank you for your visit!
            </p>
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-2 pt-2 select-none">
          <button
            onClick={() => alert("Forwarding ticket stream to POS printer...")}
            type="button"
            className="h-10 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#A3A3A3] hover:text-[#F4F1EA] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Receipt</span>
          </button>
          
          <button
            onClick={onClose}
            type="button"
            className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
}
