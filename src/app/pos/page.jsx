"use client";

import React from "react";
import POSLayout from "@/components/layout/POSLayout";
import { usePOS } from "@/context/POSContext";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";
import PaymentPanel from "@/components/pos/PaymentPanel";
import FloorPopup from "@/components/pos/FloorPopup";
import CustomerModal from "@/components/pos/CustomerModal";
import DiscountModal from "@/components/pos/DiscountModal";
import ReceiptModal from "@/components/pos/ReceiptModal";

export default function POSTerminalPage() {
  const {
    posView,
    isFloorPopupOpen,
    isCustomerModalOpen,
    isDiscountModalOpen,
    isReceiptModalOpen,
    setIsFloorPopupOpen,
    setIsCustomerModalOpen,
    setIsDiscountModalOpen,
    setIsReceiptModalOpen
  } = usePOS();

  return (
    <>
      <div className="flex-1 flex overflow-hidden min-h-0 bg-[#0B0B0B]">
        
        {/* Left Section: Product menu and search */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
          <ProductGrid />
        </div>

        {/* Right Section: Toggleable Cart Panel and Payment Checkout station */}
        <div className="w-[340px] md:w-[380px] shrink-0 h-full flex flex-col min-h-0 bg-[#141414] border-l border-[#252525]">
          {posView === "cart" ? (
            <CartPanel />
          ) : (
            <PaymentPanel />
          )}
        </div>

      </div>

      {/* Floating Modals and Dialogs */}
      <FloorPopup
        isOpen={isFloorPopupOpen}
        onClose={() => setIsFloorPopupOpen(false)}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </>
  );
}
