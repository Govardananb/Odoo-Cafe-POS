"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";

import { paymentService } from "@/services/paymentService";

import PaymentMethodCard from "@/components/payment-methods/PaymentMethodCard";
import PaymentMethodFormModal from "@/components/payment-methods/PaymentMethodFormModal";

import { CreditCard, Plus, CheckCircle, QrCode } from "lucide-react";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Dialogs States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const [deleteMethodId, setDeleteMethodId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Load payment methods
  const loadMethods = () => {
    setLoading(true);
    paymentService.getMethods()
      .then((data) => {
        setMethods(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMethods();
  }, []);

  // CRUD Actions
  const handleAddClick = () => {
    setEditingMethod(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (method) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleSaveMethod = (payload) => {
    if (editingMethod) {
      paymentService.updateMethod(editingMethod.id, payload)
        .then(() => {
          loadMethods();
          setIsFormOpen(false);
          setEditingMethod(null);
        })
        .catch(alert);
    } else {
      paymentService.addMethod(payload)
        .then(() => {
          loadMethods();
          setIsFormOpen(false);
        })
        .catch(alert);
    }
  };

  const handleToggleStatus = (method) => {
    const nextStatus = method.status?.toLowerCase() === "enabled" ? "Disabled" : "Enabled";
    paymentService.updateMethod(method.id, { status: nextStatus })
      .then(() => {
        loadMethods();
      })
      .catch(alert);
  };

  const handleDeleteClick = (id) => {
    setDeleteMethodId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteMethodId) {
      paymentService.deleteMethod(deleteMethodId)
        .then(() => {
          loadMethods();
          setIsDeleteOpen(false);
          setDeleteMethodId(null);
        })
        .catch(alert);
    }
  };

  // Stats Computations
  const totalCount = methods.length;
  const activeCount = methods.filter((m) => m.status === "Enabled").length;
  const upiConfiguredCount = methods.filter((m) => m.status === "Enabled" && m.type === "UPI").length;

  // Filtered Methods
  const filteredMethods = methods.filter((m) => {
    return (m.name || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout>
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <PageHeader
          title="Payment Methods"
          description="Configure checkout options, cash register tills, and UPI gateway merchants."
        />

        <button
          onClick={handleAddClick}
          type="button"
          className="h-9 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={13} />
          <span>Add Method</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Payment Methods */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Total Methods</span>
            <CreditCard size={16} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{totalCount}</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Payment modes in POS index</p>
          </div>
        </div>

        {/* Enabled Payment Methods */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Active Methods</span>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{activeCount}</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Available for checkout panels</p>
          </div>
        </div>

        {/* UPI Merchant accounts */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">UPI Configured</span>
            <QrCode size={16} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{upiConfiguredCount} UPI</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Active UPI QR merchants</p>
          </div>
        </div>
      </div>

      {/* 3. SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-3.5 border border-[#252525] rounded-2xl">
        <div className="w-full sm:max-w-xs">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payment methods..."
          />
        </div>
      </div>

      {/* 4. CARDS GRID / EMPTY STATES */}
      {loading ? (
        <div className="py-24 text-center text-xs text-[#A3A3A3]">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
            <span>Loading payment methods...</span>
          </div>
        </div>
      ) : methods.length === 0 ? (
        <div className="py-20 border border-[#252525] rounded-2xl bg-[#141414] flex justify-center">
          <EmptyState
            title="No Payment Methods Configured"
            message="Configure Cash, Credit Cards, or UPI options to allow POS terminals to record checkout orders."
            icon={CreditCard}
          />
        </div>
      ) : filteredMethods.length === 0 ? (
        <div className="py-20 border border-[#252525] rounded-2xl bg-[#141414] flex justify-center">
          <EmptyState
            title="No Results Found"
            message={`No payment methods match the search query "${searchQuery}".`}
            icon={CreditCard}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {filteredMethods.map((m) => (
            <PaymentMethodCard
              key={m.id}
              method={m}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* 5. ADD/EDIT PAYMENT METHOD MODAL */}
      <PaymentMethodFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMethod(null);
        }}
        editingMethod={editingMethod}
        onSave={handleSaveMethod}
      />

      {/* 6. CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Payment Method"
        message="Are you sure you want to remove this payment method? POS terminals will no longer be able to settle transaction balances with this method."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteMethodId(null);
        }}
      />
    </DashboardLayout>
  );
}
