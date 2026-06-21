"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import { usePOS } from "@/context/POSContext";
import { 
  Save, 
  Settings, 
  Wifi, 
  Percent, 
  DollarSign, 
  Building, 
  Phone, 
  MapPin, 
  RefreshCw,
  Palette,
  CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = usePOS();
  
  const [formData, setFormData] = useState({
    cafeName: "",
    address: "",
    phone: "",
    taxRate: 5,
    serviceCharge: 2,
    currencySymbol: "₹",
    wifiSsid: "",
    wifiPassword: ""
  });

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sync state with settings from context
  useEffect(() => {
    if (settings) {
      setFormData({
        cafeName: settings.cafeName || "",
        address: settings.address || "",
        phone: settings.phone || "",
        taxRate: settings.taxRate ?? 5,
        serviceCharge: settings.serviceCharge ?? 2,
        currencySymbol: settings.currencySymbol || "₹",
        wifiSsid: settings.wifiSsid || "",
        wifiPassword: settings.wifiPassword || ""
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "taxRate" || name === "serviceCharge" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    updateSettings(formData)
      .then(() => {
        setSaving(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        setSaving(false);
        console.error(err);
        alert("Failed to save settings.");
      });
  };

  const handleResetDefaults = () => {
    if (confirm("Reset POS settings to default parameters?")) {
      const defaults = {
        cafeName: "OFFLINE CLUB",
        address: "12, Khader Nawaz Khan Rd, Nungambakkam, Chennai - 600006",
        phone: "+91 44 4567 8901",
        taxRate: 5,
        serviceCharge: 2,
        currencySymbol: "₹",
        wifiSsid: "OFFLINE_CLUB_5G",
        wifiPassword: "putyourphonedown"
      };
      setFormData(defaults);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings & Configurations"
        description="Manage restaurant parameters, tax levels, operational currency, and terminal WiFi credentials."
      />

      <form onSubmit={handleSubmit} className="space-y-6 relative max-w-4xl text-left select-none font-sans">
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 bg-[#141414] border border-green-500/30 text-green-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-in">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xs font-semibold">POS configurations saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Cafe Profile */}
          <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#252525]/60 pb-3">
              <Building size={16} className="text-[#FF6B1A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">Cafe Brand Profile</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Cafe Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cafeName"
                    value={formData.cafeName}
                    onChange={handleChange}
                    required
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
                    placeholder="e.g. OFFLINE CLUB"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Contact Phone
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#5A5A5A]">
                    <Phone size={14} />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl pl-9 pr-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
                    placeholder="+91 44 4567 8901"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Store Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#5A5A5A]">
                    <MapPin size={14} />
                  </span>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full bg-[#0B0B0B] border border-[#252525] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors resize-none"
                    placeholder="Enter store location details..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Financial Rules & Taxes */}
          <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#252525]/60 pb-3">
              <Percent size={16} className="text-[#FF6B1A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">Financials & Rates</h3>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Tax Tally (GST %)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    name="serviceCharge"
                    value={formData.serviceCharge}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Currency Symbol
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#5A5A5A]">
                    <DollarSign size={14} />
                  </span>
                  <select
                    name="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={handleChange}
                    className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl pl-9 pr-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="₹">₹ - Indian Rupee (INR)</option>
                    <option value="$">$ - US Dollar (USD)</option>
                    <option value="€">€ - Euro (EUR)</option>
                    <option value="£">£ - British Pound (GBP)</option>
                    <option value="¥">¥ - Japanese Yen (JPY)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Guest Connectivity & WiFi */}
          <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-4 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 border-b border-[#252525]/60 pb-3">
              <Wifi size={16} className="text-[#FF6B1A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F1EA]">Guest Wi-Fi Setup</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Wi-Fi Network Name (SSID)
                </label>
                <input
                  type="text"
                  name="wifiSsid"
                  value={formData.wifiSsid}
                  onChange={handleChange}
                  className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
                  placeholder="e.g. OFFLINE_CLUB_5G"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 block">
                  Wi-Fi Passcode
                </label>
                <input
                  type="text"
                  name="wifiPassword"
                  value={formData.wifiPassword}
                  onChange={handleChange}
                  className="w-full h-10 bg-[#0B0B0B] border border-[#252525] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
                  placeholder="e.g. putyourphonedown"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Action Panel */}
        <div className="pt-4 border-t border-[#252525] flex justify-end gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="h-10 px-5 bg-transparent border border-[#252525] hover:border-red-500/20 text-[#A3A3A3] hover:text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF6B1A]/10"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={13} />
                <span>Save POS Configurations</span>
              </>
            )}
          </button>
        </div>

      </form>
    </DashboardLayout>
  );
}
