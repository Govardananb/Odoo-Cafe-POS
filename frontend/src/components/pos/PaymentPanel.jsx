"use client";

import React, { useState, useEffect } from "react";
import { usePOS } from "@/context/POSContext";
import { paymentService } from "@/services/paymentService";
import { 
  Banknote, 
  CreditCard, 
  QrCode, 
  Check, 
  DollarSign, 
  Receipt 
} from "lucide-react";

export default function PaymentPanel() {
  const {
    cart,
    discount,
    appliedCoupon,
    settings,
    completePayment,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    setPosView,
    activeOrder
  } = usePOS();

  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load active payment methods
  useEffect(() => {
    paymentService.getMethods()
      .then((data) => {
        const activeList = data.filter((m) => m.status?.toLowerCase() === "enabled");
        setMethods(activeList);
        if (activeList.length > 0) {
          setSelectedMethod(activeList[0]);
        }
      })
      .catch(console.error);
  }, []);

  const currencySymbol = settings?.currencySymbol || "₹";
  const taxRate = settings?.taxRate || 5;

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * (taxRate / 100);
  
  let manualDiscountAmt = subtotal * (discount / 100);
  let couponDiscountAmt = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      couponDiscountAmt = subtotal * (appliedCoupon.value / 100);
    } else if (appliedCoupon.type === "flat") {
      couponDiscountAmt = appliedCoupon.value;
    }
  }
  const discountAmt = manualDiscountAmt + couponDiscountAmt;
  const grandTotal = Math.max(0, subtotal + tax - discountAmt);

  const handleCheckout = () => {
    if (!selectedMethod || cart.length === 0) return;
    setLoading(true);
    completePayment(selectedMethod.name)
      .then((success) => {
        setLoading(false);
        if (!success) {
          alert("Transaction failed. Check cart items or selected table.");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        alert("checkout processing failed.");
      });
  };

  const getMethodIcon = (mType) => {
    switch (mType?.toLowerCase()) {
      case "cash":
        return <Banknote size={16} />;
      case "card":
        return <CreditCard size={16} />;
      case "upi":
        return <QrCode size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const hasItems = cart.length > 0;

  return (
    <div className="w-full h-full flex flex-col bg-[#141414] border-l border-[#252525] shrink-0 p-4 space-y-4 select-none justify-between">
      
      <div className="space-y-4">
        {/* Title & Bill Header */}
        <div className="text-left border-b border-[#252525]/40 pb-3">
          <span className="text-[10px] uppercase tracking-wider text-[#A3A3A3] font-bold">
            Checkout Station
          </span>
          
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-xs font-bold text-[#F4F1EA]">Bill Amount</h3>
            <span className="text-xl font-extrabold text-[#FF6B1A] font-mono">
              {currencySymbol}{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 1. Payment Methods grid */}
        <div className="space-y-2">
          <span className="text-[9px] uppercase tracking-wide text-[#7A7A7A] font-bold block text-left">
            Select Payment Mode
          </span>

          <div className="grid grid-cols-1 gap-2">
            {methods.map((method) => {
              const isSelected = selectedMethod?.id === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => hasItems && setSelectedMethod(method)}
                  className={`relative p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                    !hasItems
                      ? "opacity-50 border-[#252525]"
                      : isSelected
                        ? "bg-[#FF6B1A]/8 border-[#FF6B1A] cursor-pointer"
                        : "bg-[#0B0B0B] border-[#252525] hover:border-[#252525]/60 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      isSelected 
                        ? "bg-[#FF6B1A]/10 border-[#FF6B1A]/20 text-[#FF6B1A]" 
                        : "bg-[#252525]/30 border-white/5 text-[#A3A3A3]"
                    }`}>
                      {getMethodIcon(method.type)}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${
                        isSelected ? "text-[#FF6B1A]" : "text-[#F4F1EA]"
                      }`}>
                        {method.name}
                      </h4>
                      <p className="text-[9px] text-[#A3A3A3] font-sans mt-0.5 line-clamp-1">
                        {method.type === "UPI" && method.upiId 
                          ? `Merchant VPA: ${method.upiId}` 
                          : method.description
                        }
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#FF6B1A] text-black flex items-center justify-center shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
            
            {methods.length === 0 && (
              <div className="p-4 border border-[#252525] border-dashed rounded-xl text-center text-[10px] text-[#7A7A7A]">
                No enabled payment methods configured.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Settle CTA buttons */}
      <div className="space-y-2.5 pt-4 border-t border-[#252525]/40 mt-auto">
        <button
          onClick={handleCheckout}
          disabled={loading || !hasItems || !selectedMethod}
          type="button"
          className="w-full h-12 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.99] disabled:opacity-50 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF6B1A]/5"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <DollarSign size={14} strokeWidth={2.5} />
              <span>Complete Transaction</span>
            </>
          )}
        </button>

        <button
          onClick={() => setPosView("cart")}
          type="button"
          className="w-full h-9 bg-transparent border border-[#252525] hover:border-[#FF6B1A]/40 text-[#A3A3A3] hover:text-[#F4F1EA] text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Modify Order (Back to Cart)</span>
        </button>

        {activeOrder && (
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            type="button"
            className="w-full h-9 bg-transparent border border-[#252525] hover:border-[#FF6B1A]/40 text-[#A3A3A3] hover:text-[#F4F1EA] text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Receipt size={13} />
            <span>Print Last Receipt</span>
          </button>
        )}
      </div>

    </div>
  );
}
