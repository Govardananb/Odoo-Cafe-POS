"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ReceiptModal from "@/components/pos/ReceiptModal";
import DataTable from "@/components/shared/DataTable";
import { orderService } from "@/services/orderService";
import { settingsService } from "@/services/settingsService";
import {
  Receipt,
  Search,
  Calendar,
  Clock,
  User,
  DollarSign,
  ShoppingBag,
  FileText,
  Trash2,
  Edit2,
  Printer,
  X,
  ChevronRight,
  AlertTriangle,
  Ban,
  ArrowRight
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setCurrencySymbol(s.currencySymbol || "₹");
    });
  }, []);

  // Drawer / Overlay State
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Reprint Receipt Modal State
  const [reprintOrder, setReprintOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Confirmations
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  // Load orders
  const loadOrders = () => {
    setLoading(true);
    orderService.getOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Sync selectedOrder with updated list if it is updated (e.g. cancelled)
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

  // Statistics computations
  const totalOrders = orders.length;
  const draftOrders = orders.filter(o => o.status === "Draft").length;
  const paidOrders = orders.filter(o => o.status === "Paid").length;
  const totalRevenue = orders
    .filter(o => o.status === "Paid")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Handlers
  const handleEditDraft = (order) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("odoo_cafe_pos_load_draft_id", order.id);
      router.push("/pos");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    orderService.deleteOrder(deleteId)
      .then(() => {
        loadOrders();
        setIsDeleteOpen(false);
        setDeleteId(null);
        if (selectedOrder && selectedOrder.id === deleteId) {
          setSelectedOrder(null);
        }
        alert("Draft order deleted successfully.");
      })
      .catch((err) => {
        console.error("Failed to delete draft:", err);
        setIsDeleteOpen(false);
      });
  };

  const handleCancelClick = (id) => {
    setCancelId(id);
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelId) return;
    orderService.updateOrder(cancelId, { status: "Cancelled" })
      .then(() => {
        loadOrders();
        setIsCancelOpen(false);
        setCancelId(null);
        alert("Order cancelled successfully.");
      })
      .catch((err) => {
        console.error("Failed to cancel order:", err);
        setIsCancelOpen(false);
      });
  };

  const handleReprint = (order) => {
    setReprintOrder(order);
    setIsReceiptOpen(true);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filtering Logic
  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (selectedStatus !== "All" && order.status !== selectedStatus) {
      return false;
    }

    // Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const orderIdMatch = order.id?.toLowerCase().includes(q);
      const customerMatch = order.customer?.name?.toLowerCase().includes(q) || 
                            order.customer?.phone?.toLowerCase().includes(q);
      const dateMatch = formatDate(order.createdAt).toLowerCase().includes(q);
      return orderIdMatch || customerMatch || dateMatch;
    }

    return true;
  });

  // Table Headers
  const tableHeaders = [
    { label: "Order Number" },
    { label: "Date / Time" },
    { label: "Table" },
    { label: "Customer" },
    { label: "Items" },
    { label: "Total Amount", align: "right" },
    { label: "Status" },
    { label: "Actions", align: "center" }
  ];

  return (
    <DashboardLayout>
      {/* 1. Page Header */}
      <PageHeader
        title="Orders Registry"
        description="Monitor order lifecycles, manage drafts, issue reprints, and analyze sales transaction flows."
      />

      {/* 2. Metrics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        {/* Total Orders Card */}
        <div className="bg-[#141414] border border-[#252525] hover:border-[#FF6B1A]/20 transition-all duration-300 rounded-2xl p-5 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-widest uppercase">Total Orders</span>
            <div className="p-2 rounded-lg bg-[#252525]/30 text-[#A3A3A3] group-hover:text-[#FF6B1A] transition-colors">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#F4F1EA] font-sans">{totalOrders}</h3>
            <p className="text-[9px] text-[#7A7A7A] font-sans mt-0.5">Draft, paid, and cancelled logs</p>
          </div>
        </div>

        {/* Draft Orders Card */}
        <div className="bg-[#141414] border border-[#252525] hover:border-yellow-500/20 transition-all duration-300 rounded-2xl p-5 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-widest uppercase">Draft Orders</span>
            <div className="p-2 rounded-lg bg-[#252525]/30 text-[#A3A3A3] group-hover:text-yellow-500 transition-colors">
              <FileText size={15} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-yellow-500 font-sans">{draftOrders}</h3>
            <p className="text-[9px] text-[#7A7A7A] font-sans mt-0.5">Active checks awaiting settlement</p>
          </div>
        </div>

        {/* Paid Orders Card */}
        <div className="bg-[#141414] border border-[#252525] hover:border-green-500/20 transition-all duration-300 rounded-2xl p-5 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-widest uppercase">Paid Orders</span>
            <div className="p-2 rounded-lg bg-[#252525]/30 text-[#A3A3A3] group-hover:text-green-500 transition-colors">
              <Receipt size={15} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-green-500 font-sans">{paidOrders}</h3>
            <p className="text-[9px] text-[#7A7A7A] font-sans mt-0.5">Settle tickets completed</p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-[#141414] border border-[#252525] hover:border-[#FF6B1A]/20 transition-all duration-300 rounded-2xl p-5 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-widest uppercase">Revenue</span>
            <div className="p-2 rounded-lg bg-[#FF6B1A]/10 text-[#FF6B1A] transition-colors">
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#FF6B1A] font-sans">
              {currencySymbol}{totalRevenue.toFixed(2)}
            </h3>
            <p className="text-[9px] text-[#7A7A7A] font-sans mt-0.5">Calculated from paid orders only</p>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Left: Filter Tabs */}
        <div className="flex bg-[#141414] border border-[#252525] rounded-xl p-1 shrink-0 self-start">
          {["All", "Draft", "Paid", "Cancelled"].map((status) => {
            const count = status === "All" 
              ? orders.length 
              : orders.filter(o => o.status === status).length;
            const isActive = selectedStatus === status;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
                  isActive
                    ? "bg-[#FF6B1A] text-black"
                    : "text-[#A3A3A3] hover:text-[#F4F1EA]"
                }`}
              >
                <span>{status}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-black/15 text-black" : "bg-[#252525] text-[#A3A3A3]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Search Input */}
        <div className="w-full md:max-w-xs">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, guest, date..."
          />
        </div>
      </div>

      {/* 4. Orders Data Table */}
      <div className="relative">
        <DataTable
          headers={tableHeaders}
          data={filteredOrders}
          loading={loading}
          emptyMessage={
            selectedStatus === "All"
              ? "No orders found in the log."
              : `No orders matching status "${selectedStatus}" found.`
          }
          renderRow={(order) => (
            <tr
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="hover:bg-[#252525]/10 transition-colors cursor-pointer text-left"
            >
              <td className="py-3.5 px-5 font-mono font-bold text-[#F4F1EA]">
                {order.id}
              </td>
              <td className="py-3.5 px-5">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Clock size={11} className="text-[#7A7A7A]" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </td>
              <td className="py-3.5 px-5 font-semibold text-[#F4F1EA]">
                {order.tableNumber === "Direct" 
                  ? "Direct Checkout" 
                  : `${order.tableNumber} (${order.floorName || "Table"})`
                }
              </td>
              <td className="py-3.5 px-5">
                {order.customer ? (
                  <div className="flex items-center gap-1">
                    <User size={11} className="text-[#FF6B1A] shrink-0" />
                    <span className="truncate max-w-[120px] font-medium text-[#F4F1EA]">
                      {order.customer.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[#7A7A7A] italic">Walk-in Guest</span>
                )}
              </td>
              <td className="py-3.5 px-5 max-w-xs truncate text-[11px]">
                {order.items?.map(i => `${i.quantity}x ${i.product.name}`).join(", ")}
              </td>
              <td className="py-3.5 px-5 text-right font-mono font-bold text-[#FF6B1A]">
                {currencySymbol}{order.total?.toFixed(2)}
              </td>
              <td className="py-3.5 px-5">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1.5">
                  {order.status === "Draft" ? (
                    <>
                      <button
                        onClick={() => handleEditDraft(order)}
                        className="p-1 text-[#A3A3A3] hover:text-[#FF6B1A] hover:bg-[#252525]/30 rounded transition-all cursor-pointer"
                        title="Edit Order"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(order.id)}
                        className="p-1 text-[#A3A3A3] hover:text-red-500 hover:bg-[#252525]/30 rounded transition-all cursor-pointer"
                        title="Delete Order"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReprint(order)}
                        className="p-1 text-[#A3A3A3] hover:text-[#FF6B1A] hover:bg-[#252525]/30 rounded transition-all cursor-pointer"
                        title="Reprint Receipt"
                      >
                        <Printer size={13} />
                      </button>
                      {order.status === "Paid" && (
                        <button
                          onClick={() => handleCancelClick(order.id)}
                          className="p-1 text-[#A3A3A3] hover:text-red-500 hover:bg-[#252525]/30 rounded transition-all cursor-pointer"
                          title="Cancel Order"
                        >
                          <Ban size={13} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* 5. Order Details Drawer Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-w-md bg-[#141414] border-l border-[#252525] h-full flex flex-col shadow-2xl z-50 animate-slide-in select-none">
            {/* Drawer Header */}
            <div className="h-16 border-b border-[#252525] px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt size={15} className="text-[#FF6B1A]" />
                <h3 className="text-sm font-bold text-[#F4F1EA] tracking-wide uppercase">
                  Order details
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#A3A3A3] hover:text-[#F4F1EA] hover:bg-[#252525] rounded-lg transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Order Metadata */}
              <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-4 space-y-3 text-left font-sans text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#7A7A7A] font-semibold">Order Number</span>
                  <span className="font-mono font-bold text-[#F4F1EA]">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7A7A7A] font-semibold">Date & Time</span>
                  <span className="text-[#F4F1EA]">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7A7A7A] font-semibold">Dining Table</span>
                  <span className="text-[#F4F1EA] font-semibold">
                    {selectedOrder.tableNumber === "Direct" 
                      ? "Counter Checkout" 
                      : `Table ${selectedOrder.tableNumber} (${selectedOrder.floorName || "Floor"})`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7A7A7A] font-semibold">Cashier</span>
                  <span className="text-[#F4F1EA]">{selectedOrder.cashier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7A7A7A] font-semibold">Status</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>

              {/* Customer details */}
              <div className="space-y-2 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#7A7A7A] px-1">Customer / Guest</h4>
                <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-4 font-sans text-xs">
                  {selectedOrder.customer ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#7A7A7A]">Name</span>
                        <span className="text-[#F4F1EA] font-bold">{selectedOrder.customer.name}</span>
                      </div>
                      {selectedOrder.customer.phone && (
                        <div className="flex justify-between">
                          <span className="text-[#7A7A7A]">Phone</span>
                          <span className="text-[#F4F1EA] font-mono">{selectedOrder.customer.phone}</span>
                        </div>
                      )}
                      {selectedOrder.customer.email && (
                        <div className="flex justify-between">
                          <span className="text-[#7A7A7A]">Email</span>
                          <span className="text-[#F4F1EA] font-mono">{selectedOrder.customer.email}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[#7A7A7A] italic text-center py-1">
                      Walk-in / Direct POS Customer
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#7A7A7A] px-1">Purchased Products</h4>
                <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl overflow-hidden font-sans text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#252525] text-[#7A7A7A] text-[9px] uppercase tracking-wider font-semibold bg-[#111111]/30">
                        <th className="py-2.5 px-4 text-left">Product</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Price</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252525]/30 text-[#A3A3A3]">
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 font-bold text-[#F4F1EA]">{item.product.name}</td>
                          <td className="py-3 px-4 text-center font-semibold text-[#F4F1EA]">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono">{currencySymbol}{item.product.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#F4F1EA]">
                            {currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-[#0B0B0B] border border-[#252525] rounded-xl p-4 space-y-2.5 text-left font-sans text-xs">
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#F4F1EA]">{currencySymbol}{selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>CGST & SGST (5%)</span>
                  <span className="font-mono text-[#F4F1EA]">{currencySymbol}{selectedOrder.tax?.toFixed(2)}</span>
                </div>
                {selectedOrder.discountPct > 0 && (
                  <div className="flex justify-between text-indigo-400">
                    <span>Discount ({selectedOrder.discountPct}%)</span>
                    <span className="font-mono">-{currencySymbol}{selectedOrder.discount?.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-[#252525] my-1" />

                <div className="flex justify-between items-baseline font-bold">
                  <span className="text-xs text-[#F4F1EA] uppercase tracking-wider">Grand Total</span>
                  <span className="text-xl font-extrabold text-[#FF6B1A] font-mono">
                    {currencySymbol}{selectedOrder.total?.toFixed(2)}
                  </span>
                </div>

                {selectedOrder.paymentMethod && (
                  <div className="flex justify-between text-[10px] text-[#A3A3A3] pt-1.5 border-t border-dashed border-[#252525]/50">
                    <span>Payment Mode</span>
                    <span className="text-[#FF6B1A] font-bold uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Actions Footer */}
            <div className="p-4 border-t border-[#252525] bg-[#111111]/50 flex gap-2 shrink-0 select-none">
              {selectedOrder.status === "Draft" ? (
                <>
                  <button
                    onClick={() => handleEditDraft(selectedOrder)}
                    type="button"
                    className="flex-1 h-10 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit Order</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedOrder.id)}
                    type="button"
                    className="h-10 px-4 bg-transparent hover:bg-red-500/10 border border-[#252525] hover:border-red-500/30 text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center justify-center cursor-pointer"
                    title="Delete Draft"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleReprint(selectedOrder)}
                    type="button"
                    className="flex-1 h-10 bg-[#252525] hover:bg-[#252525]/80 active:scale-[0.98] border border-[#353535] text-[#F4F1EA] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Reprint Receipt</span>
                  </button>
                  {selectedOrder.status === "Paid" && (
                    <button
                      onClick={() => handleCancelClick(selectedOrder.id)}
                      type="button"
                      className="h-10 px-4 bg-transparent hover:bg-red-500/10 border border-[#252525] hover:border-red-500/30 text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center justify-center cursor-pointer"
                      title="Cancel Settle"
                    >
                      <Ban size={13} />
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. Invoice reprint overlay */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setReprintOrder(null);
        }}
        order={reprintOrder}
      />

      {/* 7. Draft deletion warning modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Draft Order"
        message="Are you sure you want to delete this draft order? This action will permanently remove it from the system."
        confirmLabel="Delete Draft"
        cancelLabel="Keep Order"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
      />

      {/* 8. Settle cancellation warning modal */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        title="Cancel Paid Order"
        message="Are you sure you want to void/cancel this paid order? The status will be changed to 'Cancelled' and any revenue from it will be retracted from logs."
        confirmLabel="Void Transaction"
        cancelLabel="Keep Paid"
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setIsCancelOpen(false);
          setCancelId(null);
        }}
      />

    </DashboardLayout>
  );
}
