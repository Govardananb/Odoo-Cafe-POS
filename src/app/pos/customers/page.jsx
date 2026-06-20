"use client";

import React, { useState, useEffect } from "react";
import POSLayout from "@/components/layout/POSLayout";
import EmptyState from "@/components/shared/EmptyState";
import { Users, Search, Plus, User, Phone, Check } from "lucide-react";
import Modal from "@/components/shared/Modal";

const DEFAULT_CUSTOMERS = [
  { id: "c1", name: "Walk-in Customer", phone: "N/A", visits: 12 },
  { id: "c2", name: "Alice Smith", phone: "+91 98765 43210", visits: 4 },
  { id: "c3", name: "Bob Johnson", phone: "+91 87654 32109", visits: 7 },
  { id: "c4", name: "Carol Williams", phone: "+91 76543 21098", visits: 1 }
];

export default function POSCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const loadCustomers = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("odoo_cafe_pos_customers");
      if (stored) {
        setCustomers(JSON.parse(stored));
      } else {
        localStorage.setItem("odoo_cafe_pos_customers", JSON.stringify(DEFAULT_CUSTOMERS));
        setCustomers(DEFAULT_CUSTOMERS);
      }
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newCust = {
      id: "cust-" + Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      visits: 0
    };

    const updated = [newCust, ...customers];
    setCustomers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("odoo_cafe_pos_customers", JSON.stringify(updated));
    }
    
    setIsModalOpen(false);
    setName("");
    setPhone("");
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#0B0B0B]">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h2 className="text-lg font-bold text-[#F4F1EA] tracking-tight">
              Customer Directory
            </h2>
            <p className="text-xs text-[#A3A3A3] font-sans mt-0.5">
              Review visitor checkout history and register new customer cards.
            </p>
          </div>

          <div className="flex gap-2 items-center w-full sm:max-w-md shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full h-10 pl-9 pr-4 bg-[#141414] border border-[#252525] rounded-xl text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A]"
              />
              <Search size={13} className="absolute left-3 top-3.5 text-[#7A7A7A]" />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="h-10 px-3.5 bg-[#FF6B1A] text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Customer Cards Grid layout */}
        {filtered.length === 0 ? (
          <div className="py-20 border border-[#252525] rounded-2xl bg-[#141414] flex justify-center">
            <EmptyState
              title="No Customers Found"
              message="Register your first checkout client to record loyalty visit tallies."
              icon={Users}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((cust) => (
              <div
                key={cust.id}
                className="bg-[#141414] border border-[#252525] hover:border-[#FF6B1A]/40 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FF6B1A]/5 border border-[#FF6B1A]/10 flex items-center justify-center text-[#FF6B1A] shrink-0">
                    <User size={15} />
                  </div>
                  <div className="text-left font-sans">
                    <h4 className="text-xs font-bold text-[#F4F1EA]">{cust.name}</h4>
                    <span className="text-[9px] text-[#A3A3A3] flex items-center gap-1 mt-0.5 font-mono">
                      <Phone size={8} /> {cust.phone}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#252525]/40 flex items-center justify-between text-[9px] text-[#7A7A7A] font-semibold select-none font-sans">
                  <span>Loyalty Status</span>
                  <span className="text-[#FF6B1A]">
                    {cust.visits} {cust.visits === 1 ? "Visit" : "Visits"} Recorded
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Register Customer Modal popup */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Guest Profile"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-left font-sans select-none">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 99999 88888"
              required
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#252525]/40 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="h-10 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#F4F1EA] text-xs font-medium rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
