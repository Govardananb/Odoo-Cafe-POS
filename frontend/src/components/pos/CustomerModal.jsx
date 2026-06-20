"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import { usePOS } from "@/context/POSContext";
import { Search, Plus, User, Check, Phone } from "lucide-react";

const DEFAULT_CUSTOMERS = [
  { id: "c1", name: "Walk-in Customer", phone: "N/A", visits: 12 },
  { id: "c2", name: "Alice Smith", phone: "+91 98765 43210", visits: 4 },
  { id: "c3", name: "Bob Johnson", phone: "+91 87654 32109", visits: 7 },
  { id: "c4", name: "Carol Williams", phone: "+91 76543 21098", visits: 1 }
];

export default function CustomerModal({ isOpen, onClose }) {
  const { activeCustomer, setTableCustomer } = usePOS();
  
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // New Customer Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Load customers on mount/open
  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("odoo_cafe_pos_customers");
        if (stored) {
          setCustomers(JSON.parse(stored));
        } else {
          localStorage.setItem("odoo_cafe_pos_customers", JSON.stringify(DEFAULT_CUSTOMERS));
          setCustomers(DEFAULT_CUSTOMERS);
        }
      }
      setIsAdding(false);
      setName("");
      setPhone("");
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelectCustomer = (customer) => {
    setTableCustomer(customer);
    onClose();
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newCust = {
      id: "cust-" + Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      visits: 1
    };

    const updatedList = [newCust, ...customers];
    setCustomers(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem("odoo_cafe_pos_customers", JSON.stringify(updatedList));
    }

    setTableCustomer(newCust);
    onClose();
  };

  // Filter list
  const filteredCustomers = customers.filter((c) => {
    return (
      (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || "").includes(searchQuery)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdding ? "Register New Customer" : "Assign Checkout Customer"}
    >
      <div className="space-y-4 font-sans text-left min-h-[350px] flex flex-col justify-between select-none">
        
        {/* Toggle between Create & List */}
        {!isAdding ? (
          <>
            {/* Search Toolbar */}
            <div className="flex gap-2 shrink-0">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full h-10 pl-9 pr-4 bg-[#0B0B0B] border border-[#252525] rounded-xl text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A]"
                />
                <Search size={13} className="absolute left-3 top-3.5 text-[#7A7A7A]" />
              </div>
              <button
                onClick={() => setIsAdding(true)}
                type="button"
                className="h-10 px-3.5 bg-[#FF6B1A] text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>New</span>
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto max-h-[260px] py-1 space-y-2 scrollbar-none">
              {filteredCustomers.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#7A7A7A]">
                  No customers found matching search criteria.
                </div>
              ) : (
                filteredCustomers.map((cust) => {
                  const isSelected = activeCustomer?.id === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#FF6B1A]/8 border-[#FF6B1A]"
                          : "bg-[#0B0B0B] border-[#252525] hover:border-[#252525]/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isSelected 
                            ? "bg-[#FF6B1A]/10 border-[#FF6B1A]/20 text-[#FF6B1A]" 
                            : "bg-[#252525]/30 border-white/5 text-[#A3A3A3]"
                        }`}>
                          <User size={14} />
                        </div>
                        <div className="text-left font-sans">
                          <h4 className="text-xs font-bold text-[#F4F1EA]">
                            {cust.name}
                          </h4>
                          <span className="text-[9px] text-[#A3A3A3] flex items-center gap-1 mt-0.5 font-mono">
                            <Phone size={8} /> {cust.phone}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#FF6B1A] text-black flex items-center justify-center shrink-0">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="text-[9px] text-[#7A7A7A] font-semibold pr-2">
                          {cust.visits} {cust.visits === 1 ? "Visit" : "Visits"}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* ADD NEW CUSTOMER FORM */
          <form onSubmit={handleCreateCustomer} className="flex-1 flex flex-col justify-between">
            <div className="space-y-4 pt-1">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
                  Customer Name
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

              {/* Phone number */}
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
            </div>

            {/* Actions button */}
            <div className="flex justify-end gap-2 pt-6 border-t border-[#252525]/40 mt-6">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="h-10 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#F4F1EA] text-xs font-medium rounded-lg transition-all cursor-pointer"
              >
                Back to List
              </button>
              <button
                type="submit"
                className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Create & Attach
              </button>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
}
