"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePOS } from "@/context/POSContext";
import EmptyState from "@/components/shared/EmptyState";
import { Users, Search, Plus, User, Phone, Mail, Edit2, Check } from "lucide-react";
import Modal from "@/components/shared/Modal";

const DEFAULT_CUSTOMERS = [
  { id: "c1", name: "Walk-in Customer", phone: "N/A", email: "walkin@odoocafe.com" },
  { id: "c2", name: "Alice Smith", phone: "+91 98765 43210", email: "alice.smith@gmail.com" },
  { id: "c3", name: "Bob Johnson", phone: "+91 87654 32109", email: "bob.johnson@gmail.com" },
  { id: "c4", name: "Carol Williams", phone: "+91 76543 21098", email: "carol.williams@gmail.com" }
];

export default function POSCustomersPage() {
  const router = useRouter();
  const { setTableCustomer, currentTable } = usePOS();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const loadCustomers = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("odoo_cafe_pos_customers");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Normalize any old localstorage data to include emails
        const needsEmail = parsed.some(c => c.id !== "c1" && !c.email);
        if (needsEmail) {
          const migrated = parsed.map(c => {
            if (!c.email) {
              c.email = c.id === "c1" ? "walkin@odoocafe.com" : c.name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com";
            }
            return c;
          });
          localStorage.setItem("odoo_cafe_pos_customers", JSON.stringify(migrated));
          setCustomers(migrated);
        } else {
          setCustomers(parsed);
        }
      } else {
        localStorage.setItem("odoo_cafe_pos_customers", JSON.stringify(DEFAULT_CUSTOMERS));
        setCustomers(DEFAULT_CUSTOMERS);
      }
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleEditClick = (cust) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setPhone(cust.phone);
    setEmail(cust.email || "");
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    let updated;
    if (editingCustomer) {
      updated = customers.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, name: name.trim(), phone: phone.trim(), email: email.trim() } 
          : c
      );
    } else {
      const newCust = {
        id: "cust-" + Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim()
      };
      updated = [newCust, ...customers];
    }

    setCustomers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("odoo_cafe_pos_customers", JSON.stringify(updated));
    }
    
    setIsModalOpen(false);
    setEditingCustomer(null);
    setName("");
    setPhone("");
    setEmail("");
  };

  const handleSelectCustomer = (cust) => {
    setTableCustomer(cust);
    router.push("/pos");
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
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
              Search and assign customer accounts to active terminal bills.
            </p>
          </div>

          <div className="flex gap-2 items-center w-full sm:max-w-md shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full h-10 pl-9 pr-4 bg-[#141414] border border-[#252525] rounded-xl text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A]"
              />
              <Search size={13} className="absolute left-3 top-3.5 text-[#7A7A7A]" />
            </div>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setName("");
                setPhone("");
                setEmail("");
                setIsModalOpen(true);
              }}
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
              message="Register a new customer profile to proceed with account allocation."
              icon={Users}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((cust) => (
              <div
                key={cust.id}
                className="bg-[#141414] border border-[#252525] hover:border-[#FF6B1A]/40 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-md relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FF6B1A]/5 border border-[#FF6B1A]/10 flex items-center justify-center text-[#FF6B1A] shrink-0">
                        <User size={14} />
                      </div>
                      <div className="text-left font-sans">
                        <h4 className="text-xs font-bold text-[#F4F1EA] truncate max-w-[140px]">{cust.name}</h4>
                      </div>
                    </div>
                    
                    {/* Edit trigger */}
                    <button
                      onClick={() => handleEditClick(cust)}
                      className="p-1 hover:bg-[#252525] rounded text-[#7A7A7A] hover:text-[#FF6B1A] transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 size={11} />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-[#A3A3A3] font-sans text-left pl-0.5">
                    <div className="flex items-center gap-2">
                      <Phone size={10} className="text-[#7A7A7A]" />
                      <span>{cust.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={10} className="text-[#7A7A7A]" />
                      <span className="truncate max-w-[170px]">{cust.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252525]/40">
                  <button
                    onClick={() => handleSelectCustomer(cust)}
                    type="button"
                    className="w-full h-8 bg-[#FF6B1A]/10 hover:bg-[#FF6B1A] border border-[#FF6B1A]/20 hover:border-transparent text-[#FF6B1A] hover:text-black text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Check size={11} strokeWidth={2.5} />
                    <span>Select Customer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Register / Edit Customer Modal popup */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? "Edit Customer Profile" : "Register Guest Profile"}
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 text-left font-sans select-none">
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

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@example.com"
              required
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#252525]/40 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCustomer(null);
              }}
              className="h-10 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#F4F1EA] text-xs font-medium rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {editingCustomer ? "Save Changes" : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
