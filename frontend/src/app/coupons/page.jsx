"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { couponService } from "@/services/couponService";
import { usePOS } from "@/context/POSContext";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Percent, 
  Wallet, 
  AlertTriangle 
} from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import DataTable from "@/components/shared/DataTable";

export default function CouponsPage() {
  const { settings } = usePOS();
  const currencySymbol = settings?.currencySymbol || "₹";

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percent",
    value: "",
    minOrderAmount: "",
    status: "Active",
    description: ""
  });

  // Deletion confirm
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadCoupons = () => {
    setLoading(true);
    couponService.getCoupons()
      .then((data) => {
        setCoupons(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleEditClick = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      status: coupon.status,
      description: coupon.description || ""
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      type: "percent",
      value: "",
      minOrderAmount: "0",
      status: "Active",
      description: ""
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (editingCoupon) {
      couponService.updateCoupon(editingCoupon.id, formData)
        .then(() => {
          loadCoupons();
          setIsModalOpen(false);
        })
        .catch(alert);
    } else {
      couponService.addCoupon(formData)
        .then(() => {
          loadCoupons();
          setIsModalOpen(false);
        })
        .catch(alert);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      couponService.deleteCoupon(deleteId)
        .then(() => {
          loadCoupons();
          setIsDeleteOpen(false);
        })
        .catch(alert);
    }
  };

  const tableHeaders = [
    { label: "Voucher Code" },
    { label: "Discount Type" },
    { label: "Benefit Value" },
    { label: "Min Order Req." },
    { label: "Status" },
    { label: "Description" },
    { label: "Actions", align: "center" }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 select-none text-left">
        <PageHeader
          title="Promo Coupons & Voucher Codes"
          description="Manage active campaigns, discount codes, percentage loyalty deals, and flat savings tags."
        />
        
        <button
          onClick={handleAddClick}
          className="h-10 px-5 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#FF6B1A]/10 self-start sm:self-auto"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Active Campaigns</span>
          <h3 className="text-2xl font-bold text-[#F4F1EA]">
            {coupons.filter(c => c.status === "Active").length} / {coupons.length}
          </h3>
        </div>
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Max Coupon discount</span>
          <h3 className="text-2xl font-bold text-[#FF6B1A]">
            {coupons.length > 0 ? Math.max(...coupons.map(c => c.type === "percent" ? c.value : 0)) : 0}%
          </h3>
        </div>
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3">
          <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Highest Flat Voucher</span>
          <h3 className="text-2xl font-bold text-green-500">
            {currencySymbol}{coupons.length > 0 ? Math.max(...coupons.map(c => c.type === "flat" ? c.value : 0)) : 0}
          </h3>
        </div>
      </div>

      {/* Table view */}
      <div className="relative">
        <DataTable
          headers={tableHeaders}
          data={coupons}
          loading={loading}
          emptyMessage="No promo coupons currently in database."
          renderRow={(coupon) => (
            <tr key={coupon.id} className="hover:bg-[#252525]/10 transition-colors text-left">
              <td className="py-3.5 px-5 font-mono font-bold text-[#FF6B1A]">
                {coupon.code}
              </td>
              <td className="py-3.5 px-5 capitalize text-xs">
                {coupon.type === "percent" ? "Percentage Off" : "Flat Rate Off"}
              </td>
              <td className="py-3.5 px-5 font-bold font-mono text-[#F4F1EA]">
                {coupon.type === "percent" ? `${coupon.value}%` : `${currencySymbol}${coupon.value}`}
              </td>
              <td className="py-3.5 px-5 font-semibold font-mono text-[#A3A3A3]">
                {currencySymbol}{coupon.minOrderAmount}
              </td>
              <td className="py-3.5 px-5">
                <StatusBadge status={coupon.status} />
              </td>
              <td className="py-3.5 px-5 text-xs text-[#A3A3A3] max-w-[200px] truncate">
                {coupon.description || "-"}
              </td>
              <td className="py-3.5 px-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEditClick(coupon)}
                    className="p-1.5 text-[#A3A3A3] hover:text-[#FF6B1A] hover:bg-[#252525] rounded transition-all cursor-pointer"
                    title="Edit Coupon"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(coupon.id)}
                    className="p-1.5 text-[#A3A3A3] hover:text-red-500 hover:bg-[#252525] rounded transition-all cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141414] border border-[#252525] rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in text-left select-none font-sans">
            <div className="h-14 border-b border-[#252525] px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={15} className="text-[#FF6B1A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">
                  {editingCoupon ? "Edit Coupon Details" : "Create New Campaign Coupon"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-[#F4F1EA]">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Promo Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
                  placeholder="e.g. OFFLINE20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Voucher Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="percent">Percentage Off (%)</option>
                    <option value="flat">Flat Rate Off ({currencySymbol})</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Benefit Value
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
                    placeholder={formData.type === "percent" ? "e.g. 20" : "e.g. 50"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Min Order Spend ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Campaign Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Campaign Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="2"
                  className="w-full bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 py-2 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors resize-none"
                  placeholder="Explain benefits to cashier..."
                />
              </div>

              <div className="pt-4 border-t border-[#252525] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 bg-transparent border border-[#252525] hover:bg-[#252525] text-[#A3A3A3] hover:text-[#F4F1EA] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>Save Coupon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Promo Coupon"
        message="Are you sure you want to permanently remove this campaign voucher from the POS terminal?"
        confirmLabel="Remove Coupon"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
      />

    </DashboardLayout>
  );
}
