"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import { orderService } from "@/services/orderService";
import { usePOS } from "@/context/POSContext";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Percent, 
  Calendar,
  Wallet,
  Printer,
  X,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  TrendingDown
} from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";

export default function ReportsPage() {
  const { settings } = usePOS();
  const currencySymbol = settings?.currencySymbol || "₹";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("Today"); // Today, Week, Month

  // Drawer audits
  const [drawerLogs, setDrawerLogs] = useState([]);
  const [openingCash, setOpeningCash] = useState("1000");
  const [closingCash, setClosingCash] = useState("");
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [activeShift, setActiveShift] = useState(null);

  // Z-Report modal
  const [isZReportOpen, setIsZReportOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    orderService.getOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    if (typeof window !== "undefined") {
      const shiftRaw = localStorage.getItem("odoo_cafe_active_shift");
      if (shiftRaw) {
        setActiveShift(JSON.parse(shiftRaw));
      } else {
        // Mock default shift if none exists
        const mockShift = {
          id: "SHIFT-001",
          cashier: "Govardanan B",
          openedAt: new Date(new Date().setHours(9, 0, 0)).toISOString(),
          openingCash: 1000
        };
        localStorage.setItem("odoo_cafe_active_shift", JSON.stringify(mockShift));
        setActiveShift(mockShift);
      }

      const logsRaw = localStorage.getItem("odoo_cafe_drawer_audits");
      setDrawerLogs(logsRaw ? JSON.parse(logsRaw) : []);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Filter orders by period
  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter((o) => {
      const oDate = new Date(o.createdAt);
      if (period === "Today") {
        return oDate.toDateString() === now.toDateString();
      } else if (period === "Week") {
        const diffTime = Math.abs(now - oDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else if (period === "Month") {
        return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const periodOrders = getFilteredOrders();
  const paidOrders = periodOrders.filter(o => o.status === "Paid");

  // Calculations
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTax = paidOrders.reduce((sum, o) => sum + o.tax, 0);
  const totalDiscount = paidOrders.reduce((sum, o) => sum + o.discount, 0);
  const transactionCount = paidOrders.length;
  const avgBill = transactionCount > 0 ? totalRevenue / transactionCount : 0;

  // Payments breakdown
  const paymentMethods = paidOrders.reduce((acc, o) => {
    const key = o.paymentMethod || "Other";
    acc[key] = (acc[key] || 0) + o.total;
    return acc;
  }, {});

  // Category breakdown
  const categorySales = paidOrders.reduce((acc, o) => {
    o.items?.forEach((item) => {
      const cat = item.product.category || "Beverages";
      acc[cat] = (acc[cat] || 0) + item.product.price * item.quantity;
    });
    return acc;
  }, {});

  // Top products
  const productStats = paidOrders.reduce((acc, o) => {
    o.items?.forEach((item) => {
      const name = item.product.name;
      if (!acc[name]) {
        acc[name] = { name, quantity: 0, revenue: 0 };
      }
      acc[name].quantity += item.quantity;
      acc[name].revenue += item.product.price * item.quantity;
    });
    return acc;
  }, {});

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Drawer audit submission
  const handlePerformAudit = (e) => {
    e.preventDefault();
    if (!activeShift) return;

    const actualClose = parseFloat(closingCash) || 0;
    
    // Cash sales = all paid orders settled via 'cash' during this shift
    const cashSales = orders
      .filter(o => o.status === "Paid" && o.paymentMethod?.toLowerCase() === "cash" && new Date(o.createdAt) >= new Date(activeShift.openedAt))
      .reduce((sum, o) => sum + o.total, 0);

    const expectedClose = activeShift.openingCash + cashSales;
    const variance = actualClose - expectedClose;

    const newAudit = {
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      cashier: activeShift.cashier,
      openedAt: activeShift.openedAt,
      closedAt: new Date().toISOString(),
      openingCash: activeShift.openingCash,
      cashSales,
      expectedCash: expectedClose,
      actualCash: actualClose,
      variance,
      status: Math.abs(variance) < 1 ? "Balanced" : variance > 0 ? "Overage" : "Shortage"
    };

    const newLogs = [newAudit, ...drawerLogs];
    setDrawerLogs(newLogs);
    localStorage.setItem("odoo_cafe_drawer_audits", JSON.stringify(newLogs));

    // Clear active shift and open modal notifications
    localStorage.removeItem("odoo_cafe_active_shift");
    setActiveShift(null);
    setClosingCash("");
    setIsAuditModalOpen(false);
    alert(`Register shift closed and audited successfully! Variance: ${currencySymbol}${variance.toFixed(2)}`);
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 select-none text-left">
        <PageHeader
          title="Reports & Sales Analytics"
          description="Track transaction metrics, evaluate category popularity, and run register security drawer audits."
        />

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* Timeframe selector */}
          <div className="flex bg-[#141414] border border-[#252525] p-1 rounded-xl">
            {["Today", "Week", "Month"].map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer uppercase ${
                  period === item
                    ? "bg-[#252525] text-[#FF6B1A]"
                    : "text-[#A3A3A3] hover:text-[#F4F1EA]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {activeShift && (
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="h-10 px-4 bg-transparent border border-[#252525] hover:border-[#FF6B1A]/20 text-[#F4F1EA] hover:text-[#FF6B1A] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck size={13} />
              <span>Close Shift Audit</span>
            </button>
          )}

          <button
            onClick={() => setIsZReportOpen(true)}
            className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#FF6B1A]/10"
          >
            <Printer size={13} />
            <span>Generate Z-Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left select-none">
        {/* Total Sales */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase block">Revenue ({period})</span>
          <h3 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">
            {currencySymbol}{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        {/* GST Tax */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase block">GST Tax Collected</span>
          <h3 className="text-2xl font-bold tracking-tight text-[#A3A3A3]">
            {currencySymbol}{totalTax.toFixed(2)}
          </h3>
        </div>

        {/* Total Discounts */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase block">Promo Savings</span>
          <h3 className="text-2xl font-bold tracking-tight text-[#FF6B1A]">
            {currencySymbol}{totalDiscount.toFixed(2)}
          </h3>
        </div>

        {/* Average Bill */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase block">Avg Order value</span>
          <h3 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">
            {currencySymbol}{avgBill.toFixed(2)}
          </h3>
        </div>

        {/* Transactions */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase block">Receipt Checks</span>
          <h3 className="text-2xl font-bold tracking-tight text-green-500">
            {transactionCount} Paid
          </h3>
        </div>
      </div>

      {/* Grid Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Payment breakdown */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 lg:col-span-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">Sales by Payment method</h3>
            <p className="text-[10px] text-[#7A7A7A] mt-0.5">Settle values grouped by active methods</p>
          </div>

          <div className="space-y-4">
            {["UPI", "Cash", "Card"].map((method) => {
              const amount = paymentMethods[method] || 0;
              const percent = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
              
              let barColor = "bg-[#FF6B1A]";
              if (method === "Cash") barColor = "bg-green-500";
              if (method === "Card") barColor = "bg-indigo-400";

              return (
                <div key={method} className="space-y-1.5 font-sans">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#F4F1EA]">{method}</span>
                    <span className="text-[#A3A3A3] font-mono">
                      {currencySymbol}{amount.toFixed(2)} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0B0B0B] rounded-full overflow-hidden border border-[#252525]/30">
                    <div 
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Popularity */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 lg:col-span-7 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">Menu Categories Sales</h3>
            <p className="text-[10px] text-[#7A7A7A] mt-0.5">Popularity metrics calculated from category sales</p>
          </div>

          <div className="space-y-3.5">
            {["Beverages", "Meals", "Desserts", "Snacks"].map((cat) => {
              const amount = categorySales[cat] || 0;
              const percent = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;

              return (
                <div key={cat} className="flex items-center justify-between text-xs font-sans font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B1A]" />
                    <span className="text-[#F4F1EA]">{cat}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="w-32 bg-[#0B0B0B] h-1.5 rounded-full overflow-hidden border border-[#252525]/30 hidden sm:block">
                      <div className="h-full bg-[#A3A3A3] rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-[#A3A3A3] font-mono text-right w-24">
                      {currencySymbol}{amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Top Products & Audit Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Top items table */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 lg:col-span-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">Top Selling Products</h3>
            <p className="text-[10px] text-[#7A7A7A] mt-0.5">Top-selling menu items by volume</p>
          </div>

          <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-[#252525] text-[#7A7A7A]">
                  <th className="py-2 font-semibold">Product</th>
                  <th className="py-2 text-center font-semibold">Qty</th>
                  <th className="py-2 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]/30">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-[#7A7A7A] italic">No sales recorded yet.</td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-semibold text-[#F4F1EA]">{p.name}</td>
                      <td className="py-3 text-center font-mono font-bold text-[#A3A3A3]">{p.quantity}</td>
                      <td className="py-3 text-right font-mono font-bold text-[#FF6B1A]">{currencySymbol}{p.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash Register Audits log list */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252525]/40 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">Register Cash Audits</h3>
              <p className="text-[10px] text-[#7A7A7A] mt-0.5">Recent audit logs for cash drawer variances</p>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {drawerLogs.length === 0 ? (
              <div className="text-center py-10 text-[#7A7A7A] italic text-xs">
                No shift audit checks on record.
              </div>
            ) : (
              drawerLogs.map((log) => (
                <div key={log.id} className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 text-left font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#FF6B1A]">{log.id}</span>
                      <span className="text-[10px] text-[#7A7A7A]">• {formatDate(log.closedAt)}</span>
                    </div>
                    <p className="text-[#A3A3A3] text-[10px]">
                      Cashier: <span className="text-[#F4F1EA] font-semibold">{log.cashier}</span> | 
                      Expected: <span className="text-[#F4F1EA] font-semibold">{currencySymbol}{log.expectedCash}</span> | 
                      Actual: <span className="text-[#F4F1EA] font-semibold">{currencySymbol}{log.actualCash}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                    <div className="text-right">
                      <span className={`text-[10px] font-bold block ${
                        log.variance === 0 
                          ? "text-green-500" 
                          : log.variance > 0 
                            ? "text-[#FF6B1A]" 
                            : "text-red-500"
                      }`}>
                        Variance: {log.variance > 0 ? "+" : ""}{currencySymbol}{log.variance.toFixed(2)}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      log.status === "Balanced" 
                        ? "bg-green-500/10 border border-green-500/20 text-green-500" 
                        : log.status === "Overage" 
                          ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500" 
                          : "bg-red-500/10 border border-red-500/20 text-red-500"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 1. Close Shift Audit Modal */}
      {isAuditModalOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setIsAuditModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141414] border border-[#252525] rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in text-left select-none font-sans">
            <div className="h-14 border-b border-[#252525] px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#FF6B1A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">
                  Register Close Out Audit
                </h3>
              </div>
              <button onClick={() => setIsAuditModalOpen(false)} className="p-1 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-[#F4F1EA]">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handlePerformAudit} className="p-6 space-y-4">
              <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-4 space-y-2 text-xs text-[#A3A3A3]">
                <div className="flex justify-between">
                  <span>Cashier Active:</span>
                  <span className="text-[#F4F1EA] font-semibold">{activeShift.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shift Opened:</span>
                  <span className="text-[#F4F1EA]">{formatDate(activeShift.openedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Drawer Opening Cash:</span>
                  <span className="text-[#F4F1EA] font-mono">{currencySymbol}{activeShift.openingCash}</span>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Actual Closing Cash Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
                  placeholder="Enter cash count in drawer..."
                />
              </div>

              <div className="pt-4 border-t border-[#252525] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="h-9 px-4 bg-transparent border border-[#252525] hover:bg-[#252525] text-[#A3A3A3] hover:text-[#F4F1EA] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle size={13} />
                  <span>Verify & End Shift</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Z-Report Thermal receipt Modal */}
      {isZReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setIsZReportOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#141414] border border-[#252525] rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in text-left font-mono">
            {/* Header */}
            <div className="p-4 border-b border-[#252525] flex justify-between items-center text-xs bg-[#111111]/30">
              <span className="font-bold text-[#FF6B1A]">Z-REPORT PREVIEW</span>
              <button onClick={() => setIsZReportOpen(false)} className="text-[#A3A3A3] hover:text-[#F4F1EA] p-0.5">
                <X size={15} />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="p-6 bg-white text-black max-h-[450px] overflow-y-auto space-y-4 text-xs font-mono">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold uppercase">{settings?.cafeName || "OFFLINE CLUB"}</h3>
                <p className="text-[9px] text-gray-500 uppercase">{settings?.address}</p>
                <p className="text-[9px] text-gray-500">TEL: {settings?.phone}</p>
                <p className="text-[9px] tracking-wider pt-1">-----------------------------</p>
                <p className="text-[10px] font-bold">END-OF-DAY REGISTER REPORT</p>
                <p className="text-[9px]">MODE: DAILY Z-REPORT</p>
                <p className="text-[9px] tracking-wider">-----------------------------</p>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIME:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>AUDITOR:</span>
                  <span>SYSTEM MASTER</span>
                </div>
                <div className="flex justify-between">
                  <span>REGISTER:</span>
                  <span>TERM-002 (ACTIVE)</span>
                </div>
                <p className="text-center text-[9px] tracking-wider">=============================</p>
              </div>

              {/* Totals registry */}
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>GROSS REVENUE:</span>
                  <span>{currencySymbol}{totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TAXES COLLECTED:</span>
                  <span>{currencySymbol}{totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TOTAL DISCOUNTS:</span>
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-dashed border-black/50 pt-1.5">
                  <span>NET SALES TOTAL:</span>
                  <span>{currencySymbol}{(totalRevenue - totalTax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TRANSACTIONS COUNT:</span>
                  <span>{transactionCount} checks</span>
                </div>
                <p className="text-center text-[9px] tracking-wider">=============================</p>
              </div>

              {/* Payments breakdown */}
              <div className="space-y-2 text-[10px]">
                <h4 className="font-bold underline text-center">PAYMENTS BREAKDOWN</h4>
                {Object.keys(paymentMethods).map((method) => (
                  <div key={method} className="flex justify-between">
                    <span>{method.toUpperCase()}:</span>
                    <span>{currencySymbol}{paymentMethods[method].toFixed(2)}</span>
                  </div>
                ))}
                <p className="text-center text-[9px] tracking-wider">=============================</p>
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] space-y-1 text-gray-500 pt-2">
                <p>Z-REPORT COMPLETED LOGGED</p>
                <p>E-JOURNAL STORAGE: OK</p>
                <p>*** END OF REPORT ***</p>
              </div>
            </div>

            {/* Print trigger */}
            <div className="p-4 border-t border-[#252525] bg-[#111111]/30 flex gap-2">
              <button
                type="button"
                onClick={() => setIsZReportOpen(false)}
                className="flex-1 h-9 bg-transparent border border-[#353535] hover:bg-[#252525] text-[#A3A3A3] hover:text-[#F4F1EA] text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handlePrintZReport}
                className="flex-1 h-9 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Report</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
