"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Coffee,
  FolderTree,
  Grid,
  Users,
  ShoppingBag,
  CreditCard,
  Tag,
  Calendar,
  ChefHat,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();

  const navigation = [
    {
      section: "OVERVIEW",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }
      ]
    },
    {
      section: "MANAGEMENT",
      items: [
        { id: "products", label: "Products", icon: Coffee, href: "/products" },
        { id: "categories", label: "Categories", icon: FolderTree, href: "/categories" },
        { id: "tables", label: "Tables", icon: Grid, href: "/tables" },
        { id: "employees", label: "Employees", icon: Users, href: "/employees" }
      ]
    },
    {
      section: "SALES",
      items: [
        { id: "payment-methods", label: "Payment Methods", icon: CreditCard, href: "/payment-methods" },
        { id: "coupons", label: "Coupons & Promotions", icon: Tag, href: "/coupons" }
      ]
    },
    {
      section: "OPERATIONS",
      items: [
        { id: "bookings", label: "Bookings", icon: Calendar, href: "/bookings" },
        { id: "kds", label: "Kitchen Display (KDS)", icon: ChefHat, href: "/kds" },
        { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" }
      ]
    },
    {
      section: "SYSTEM",
      items: [
        { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
        { id: "logout", label: "Logout", icon: LogOut, href: "/" }
      ]
    }
  ];

  const isItemActive = (href) => {
    if (href === "/") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside 
      className={`h-screen bg-[#0B0B0B] border-r border-[#252525] flex flex-col justify-between shrink-0 transition-all duration-300 relative select-none z-30 ${
        isCollapsed ? "w-[68px]" : "w-[260px]"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-5 -right-3 z-50 w-6 h-6 bg-[#141414] border border-[#252525] hover:border-[#FF6B1A] rounded-full flex items-center justify-center text-[#A3A3A3] hover:text-[#F4F1EA] cursor-pointer transition-all duration-200 shadow-md"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Main navigation contents */}
      <div className="flex flex-col flex-1 overflow-y-auto pb-4 scrollbar-none">
        
        {/* Header/Logo area */}
        <div className="h-16 border-b border-[#252525] flex items-center shrink-0">
          {isCollapsed ? (
            <div className="w-full flex items-center justify-center">
              <span className="text-xs tracking-wider font-bold text-[#FF6B1A]">
                OC
              </span>
            </div>
          ) : (
            <div className="px-6 flex items-center justify-start">
              <span className="text-xs tracking-[0.25em] font-semibold text-[#F4F1EA]">
                ODOO <span className="text-[#FF6B1A]">CAFE</span>
              </span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="py-4 space-y-4">
          {navigation.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#5A5A5A] px-6 py-1 select-none font-sans">
                  {group.section}
                </div>
              )}
              
              <div className="px-3.5 space-y-0.5">
                {group.items.map((item) => {
                  const isActive = isItemActive(item.href);
                  const Icon = item.icon;

                  const buttonClass = `w-full h-9 flex items-center rounded-lg text-xs transition-all relative font-sans cursor-pointer group ${
                    isCollapsed ? "justify-center px-0" : "px-3"
                  } ${
                    isActive 
                      ? "text-[#F4F1EA] font-medium bg-[#FF6B1A]/8" 
                      : "text-[#A3A3A3] hover:text-[#F4F1EA] hover:bg-[#252525]/20"
                  }`;

                  return (
                    <div key={item.id} className="relative">
                      {/* Left border active indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#FF6B1A] rounded-r-md" />
                      )}

                      <Link href={item.href} className={buttonClass}>
                        <div className="flex items-center gap-3">
                          <Icon 
                            size={16} 
                            className={`shrink-0 transition-colors ${
                              isActive ? "text-[#FF6B1A]" : "text-[#A3A3A3] group-hover:text-[#F4F1EA]"
                            }`} 
                          />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
