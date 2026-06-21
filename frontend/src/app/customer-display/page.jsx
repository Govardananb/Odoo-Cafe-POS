"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/layout/Logo";
import { Coffee, QrCode, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { settingsService } from "@/services/settingsService";

export default function CustomerDisplayPage() {
  const [activeCart, setActiveCart] = useState(null);
  const [activeTableName, setActiveTableName] = useState("");
  const [time, setTime] = useState("");
  const [settings, setSettings] = useState({
    currencySymbol: "₹",
    taxRate: 5,
    cafeName: "OFFLINE CLUB",
    address: "",
    phone: ""
  });

  // Poll localStorage every 1 second to get live updates from the POS terminal
  useEffect(() => {
    // Load Settings
    settingsService.getSettings().then((s) => {
      setSettings(s);
    });

    const updateTime = () => {
      const date = new Date();
      setTime(date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    const checkCarts = () => {
      if (typeof window === "undefined") return;

      // Check for saved table carts
      const cartsRaw = localStorage.getItem("odoo_cafe_pos_table_carts");
      const activeOrderRaw = localStorage.getItem("odoo_cafe_pos_orders");
      
      let carts = cartsRaw ? JSON.parse(cartsRaw) : {};
      
      // Let's find the first non-empty cart to display
      const activeTableId = Object.keys(carts).find(id => carts[id]?.cart?.length > 0);

      if (activeTableId) {
        setActiveCart(carts[activeTableId]);
        
        // Find table number
        const tablesRaw = localStorage.getItem("odoo_cafe_tables");
        const tables = tablesRaw ? JSON.parse(tablesRaw) : [];
        const matched = tables.find(t => t.id === activeTableId);
        setActiveTableName(matched ? `Table ${matched.number}` : "Dining Table");
      } else {
        setActiveCart(null);
        setActiveTableName("");
      }
    };

    checkCarts();
    const cartInterval = setInterval(checkCarts, 1000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(cartInterval);
    };
  }, []);

  const currencySymbol = settings.currencySymbol || "₹";
  const taxRate = settings.taxRate ?? 5;

  // Compute pricing totals if cart exists
  const subtotal = activeCart?.cart?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
  const tax = subtotal * (taxRate / 100);
  
  let manualDiscountAmt = subtotal * ((activeCart?.discount || 0) / 100);
  let couponDiscountAmt = 0;
  if (activeCart?.appliedCoupon) {
    if (activeCart.appliedCoupon.type === "percent") {
      couponDiscountAmt = subtotal * (activeCart.appliedCoupon.value / 100);
    } else if (activeCart.appliedCoupon.type === "flat") {
      couponDiscountAmt = activeCart.appliedCoupon.value;
    }
  }
  const discountAmt = manualDiscountAmt + couponDiscountAmt;
  const grandTotal = Math.max(0, subtotal + tax - discountAmt);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F4F1EA] font-sans flex flex-col justify-between overflow-hidden select-none p-6 md:p-8 space-y-6">
      
      {/* 1. Top Navbar Header */}
      <header className="h-16 border-b border-[#252525] bg-[#141414] px-6 rounded-2xl flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B1A]/5 border border-[#FF6B1A]/10 flex items-center justify-center text-[#FF6B1A]">
            <Coffee size={16} />
          </div>
          <span className="text-xs tracking-[0.25em] font-extrabold text-[#F4F1EA]">
            ODOO <span className="text-[#FF6B1A]">CAFE</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {activeTableName && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B1A] bg-[#FF6B1A]/8 border border-[#FF6B1A]/20 px-3 py-1 rounded-full">
              {activeTableName}
            </span>
          )}
          <span className="text-xs font-mono font-bold text-[#A3A3A3]">
            {time}
          </span>
        </div>
      </header>

      {/* 2. Main Area Grid Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: ACTIVE CART (Col span 7) */}
        <div className="lg:col-span-7 bg-[#141414] border border-[#252525] rounded-2xl flex flex-col justify-between overflow-hidden shadow-inner h-full min-h-0">
          
          <div className="h-12 border-b border-[#252525] px-4 flex items-center justify-between shrink-0 bg-[#111111]/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">
              Your Menu Order
            </span>
            {activeCart && (
              <span className="text-[9px] font-semibold text-[#7A7A7A]">
                {activeCart.cart.length} {activeCart.cart.length === 1 ? "Item" : "Items"}
              </span>
            )}
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-none">
            {activeCart ? (
              activeCart.cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 font-sans text-xs">
                   <div className="text-left max-w-xs">
                     <h4 className="font-bold text-[#F4F1EA]">{item.product.name}</h4>
                     <span className="text-[9px] text-[#A3A3A3] mt-0.5 block">
                       {currencySymbol}{item.product.price.toFixed(2)} each
                     </span>
                   </div>
                   
                   <div className="flex items-center gap-8 shrink-0">
                     <span className="text-[#A3A3A3] font-bold">
                       x {item.quantity}
                     </span>
                     <span className="w-16 text-right font-mono font-bold text-[#F4F1EA]">
                       {currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                     </span>
                   </div>
                </div>
              ))
            ) : (
              /* Idle welcome display when no active checkout cart */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#252525]/30 border border-[#252525] flex items-center justify-center text-[#FF6B1A]/80 shadow-md">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#F4F1EA] tracking-tight">
                    Welcome to Odoo Cafe!
                  </h3>
                  <p className="text-[10px] text-[#A3A3A3] max-w-[240px] leading-normal font-sans mx-auto">
                    We are currently preparing details for your order. Let the cashier know when you are ready to order.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Pricing summary block */}
          {activeCart && (
            <div className="border-t border-[#252525] bg-[#111111]/30 p-5 space-y-3.5 shrink-0 text-xs text-[#A3A3A3]">
              <div className="space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#F4F1EA] font-mono">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes ({taxRate}%)</span>
                  <span className="text-[#F4F1EA] font-mono">{currencySymbol}{tax.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-indigo-400">
                    <span>Applied Discount</span>
                    <span className="font-mono">-{currencySymbol}{discountAmt.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-baseline text-sm font-extrabold text-[#F4F1EA] border-t border-[#252525]/50 pt-3">
                <span>Grand Total</span>
                <span className="text-[#FF6B1A] font-mono text-lg">{currencySymbol}{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: BRAND SLIDE & UPI QR MERCH (Col span 5) */}
        <div className="lg:col-span-5 bg-[#141414] border border-[#252525] rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md h-full select-none">
          
          {activeCart ? (
            /* UPI Checkout Display */
            <div className="flex-1 flex flex-col items-center justify-center space-y-5 py-4 w-full">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#FF6B1A]">
                  Scan & Settle Checkout
                </span>
                <h3 className="text-sm font-bold text-[#F4F1EA] tracking-tight">
                  Instant UPI Checkout
                </h3>
              </div>

              {/* High fidelity UPI QR box */}
              <div className="w-40 h-40 bg-white border border-[#252525] rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg relative select-none">
                <div className="w-full h-full bg-[#0B0B0B] rounded-xl flex flex-col items-center justify-center">
                  <QrCode size={70} className="text-[#FF6B1A] animate-pulse" />
                  <span className="text-[8px] font-mono font-bold text-[#A3A3A3] mt-2 tracking-wide uppercase">
                    UPI Merchant VPA
                  </span>
                </div>
              </div>

              <div className="space-y-2 select-text font-sans text-xs">
                <div className="px-3 py-1.5 bg-[#0B0B0B] border border-[#252525] rounded-full inline-block">
                  <span className="font-semibold text-[#A3A3A3] text-[10px]">VPA: </span>
                  <span className="font-mono text-[#F4F1EA] text-[10px] font-bold">cafe@ybl</span>
                </div>
                <p className="text-[10px] text-[#A3A3A3] max-w-[200px] leading-relaxed mx-auto font-sans">
                  Use GPay, PhonePe, Paytm, or any BHIM UPI app to scan and pay directly to our till register.
                </p>
              </div>
            </div>
          ) : (
            /* Idle Brand Promotion Slide */
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <Logo />
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#FF6B1A]">
                  Artisanal Coffee & Sandwiches
                </span>
                <h3 className="text-sm font-bold text-[#F4F1EA] tracking-tight">
                  Brewed for perfection, served with love.
                </h3>
              </div>
              <div className="w-20 h-[1px] bg-[#252525]" />
              <div className="flex items-center gap-1.5 text-[9px] text-[#A3A3A3] font-semibold">
                <CheckCircle2 size={12} className="text-green-500" />
                <span>Register #02 Active</span>
              </div>
            </div>
          )}

          {/* Display Footer message */}
          <div className="pt-4 border-t border-[#252525]/40 w-full text-[9px] text-[#7A7A7A] select-none font-sans font-semibold flex items-center justify-center gap-1">
            <span>Thank you for dining with us!</span>
            <Heart size={9} className="text-red-500 fill-red-500" />
          </div>

        </div>

      </div>

      {/* 3. Bottom Footer Security branding */}
      <footer className="text-center pt-2 select-none">
        <p className="text-[8px] tracking-wider text-[#7A7A7A]/40 font-mono">
          ODOO CAFE CUSTOMER VIEW v14.0.2 • SECURE TERMINAL CHANNEL
        </p>
      </footer>

    </div>
  );
}
