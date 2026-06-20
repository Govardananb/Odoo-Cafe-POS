"use client";

import React, { useState } from "react";
import { usePOS } from "@/context/POSContext";
import CartItem from "./CartItem";
import { 
  ShoppingBag, 
  User, 
  Percent, 
  ChefHat, 
  Trash2, 
  Utensils,
  CreditCard,
  FileText
} from "lucide-react";

export default function CartPanel() {
  const {
    currentTable,
    currentFloor,
    cart,
    activeCustomer,
    discount,
    addToCart,
    removeFromCart,
    updateQuantity,
    setTableCustomer,
    applyTableDiscount,
    sendToKitchen,
    saveDraftOrder,
    setIsCustomerModalOpen,
    setIsDiscountModalOpen,
    setIsFloorPopupOpen,
    setPosView
  } = usePOS();

  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const handleSaveDraft = () => {
    if (cart.length === 0) return;
    setSavingDraft(true);
    saveDraftOrder()
      .then((success) => {
        setSavingDraft(false);
        if (success) {
          alert(`Draft order saved successfully!`);
        }
      })
      .catch((err) => {
        setSavingDraft(false);
        console.error(err);
        alert("Failed to save draft order.");
      });
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const discountAmt = subtotal * (discount / 100);
  const grandTotal = subtotal + tax - discountAmt;

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    setSending(true);
    sendToKitchen()
      .then((success) => {
        setSending(false);
        if (success) {
          alert(`Order sent to kitchen for Table ${currentTable.number}!`);
        }
      })
      .catch((err) => {
        setSending(false);
        console.error(err);
        alert("Failed to send order to kitchen.");
      });
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear the cart for this table?")) {
      // Clear cart is done by updating cart to empty list
      updateQuantity(null, -1); // Helper in updateQuantity: if quantity is <= 0 it updates. Let's just pass empty list to internal state.
      // Wait, let's look at POSContext.jsx. We can just clear it by calling updateActiveTableCart([], null, 0)
      // Since POSContext exports updateActiveTableCart inside context, let's check if it is exported.
      // Wait, let's look at POSContext:
      // Operational Actions: selectTable, addToCart, removeFromCart, updateQuantity, setTableCustomer, applyTableDiscount, sendToKitchen, completePayment
      // Ah! updateActiveTableCart is not exported in the Provider value!
      // But we can clear the cart by calling updateQuantity for all items or just setting the quantity of each to 0.
      // Wait, we can call updateQuantity with a specific clear trigger, or we can just iterate over cart items.
      // Let's do:
      cart.forEach((item) => updateQuantity(item.product.id, 0));
      setTableCustomer(null);
      applyTableDiscount(0);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#141414] border-l border-[#252525] shrink-0 select-none">
      
      {/* 1. Header Row */}
      <div className="h-14 border-b border-[#252525] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag size={14} className="text-[#FF6B1A]" />
          <h3 className="text-xs font-bold text-[#F4F1EA] tracking-wide uppercase">
            {currentTable ? `Table ${currentTable.number}` : "Active Cart"}
          </h3>
        </div>
        
        {currentTable && (
          <div className="flex items-center gap-1.5">
            {/* Assign Customer */}
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              type="button"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                activeCustomer
                  ? "bg-[#FF6B1A]/8 border-[#FF6B1A]/30 text-[#FF6B1A]"
                  : "bg-transparent border-transparent text-[#7A7A7A] hover:text-[#F4F1EA] hover:bg-[#252525]"
              }`}
              title={activeCustomer ? `Customer: ${activeCustomer.name}` : "Assign Customer"}
            >
              <User size={13} />
            </button>

            {/* Apply Discount */}
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              type="button"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                discount > 0
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  : "bg-transparent border-transparent text-[#7A7A7A] hover:text-[#F4F1EA] hover:bg-[#252525]"
              }`}
              title={discount > 0 ? `Discount: ${discount}%` : "Apply Discount"}
            >
              <Percent size={13} />
            </button>

            {/* Clear Cart */}
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                type="button"
                className="p-1.5 hover:bg-[#252525] rounded-lg text-[#7A7A7A] hover:text-red-500 transition-colors border border-transparent cursor-pointer"
                title="Clear Table Cart"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Cart Items Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#252525]/30 border border-[#252525] flex items-center justify-center text-[#7A7A7A]">
              <Utensils size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F4F1EA]">Cart is Empty</h4>
              <p className="text-[10px] text-[#A3A3A3] mt-1 max-w-[200px] leading-normal font-sans mx-auto">
                {currentTable 
                  ? `Select items from the product menu to add to Table ${currentTable.number}.`
                  : "Please select a dining table from the topbar to start taking orders."
                }
              </p>
            </div>
            {!currentTable && (
              <button
                onClick={() => setIsFloorPopupOpen(true)}
                type="button"
                className="h-8 px-4 bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 hover:border-[#FF6B1A]/40 text-[#FF6B1A] text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Select Table
              </button>
            )}
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onIncrement={() => addToCart(item.product)}
              onDecrement={() => removeFromCart(item.product.id)}
              onUpdateQty={(val) => updateQuantity(item.product.id, val)}
            />
          ))
        )}
      </div>

      {/* 3. Summary & Quick Action Panel */}
      {cart.length > 0 && (
        <div className="border-t border-[#252525] bg-[#111111]/40 p-4 space-y-4 shrink-0">
          
          {/* Pricing breakdown details */}
          <div className="space-y-2 text-xs font-medium text-[#A3A3A3] font-sans">
            <div className="flex justify-between items-center text-[11px]">
              <span>Subtotal</span>
              <span className="text-[#F4F1EA] font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Tax (5%)</span>
              <span className="text-[#F4F1EA] font-mono">${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-[11px] text-indigo-400">
                <span>Discount ({discount}%)</span>
                <span className="font-mono">-${discountAmt.toFixed(2)}</span>
              </div>
            )}
            
            {/* Visual separator */}
            <div className="border-t border-dashed border-[#252525] my-1" />

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs font-bold text-[#F4F1EA] uppercase tracking-wider">Total Due</span>
              <span className="text-2xl font-extrabold text-[#FF6B1A] font-mono tracking-tight">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1.5">
            {/* Primary: Proceed to Checkout */}
            <button
              onClick={() => setPosView("payment")}
              type="button"
              className="w-full h-12 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.99] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer select-none shadow-lg shadow-[#FF6B1A]/10"
            >
              <CreditCard size={15} strokeWidth={2.5} />
              <span>Proceed to Checkout</span>
            </button>

            {/* Secondary: Send to Kitchen & Save Draft */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSendToKitchen}
                disabled={sending || savingDraft || cart.length === 0}
                type="button"
                className="h-9 bg-transparent hover:bg-[#1C1C1C] active:scale-[0.99] border border-[#252525]/85 text-[#A3A3A3] hover:text-[#F4F1EA] font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
              >
                {sending ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#A3A3A3] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ChefHat size={12} className="text-[#FF6B1A]" />
                    <span>Kitchen</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={sending || savingDraft || cart.length === 0}
                type="button"
                className="h-9 bg-transparent hover:bg-[#1C1C1C] active:scale-[0.99] border border-[#252525]/85 text-[#A3A3A3] hover:text-[#F4F1EA] font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
              >
                {savingDraft ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#A3A3A3] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FileText size={12} className="text-[#FF6B1A]" />
                    <span>Save Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
