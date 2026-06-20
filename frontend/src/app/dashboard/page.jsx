"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import FilterSelect from "@/components/shared/FilterSelect";
import StatusBadge from "@/components/shared/StatusBadge";
import { TrendingUp, ShoppingBag, Grid, Percent } from "lucide-react";

export default function Dashboard() {
  const [period, setPeriod] = useState("Today"); // Today, Week, Month, Custom
  const [activeTab, setActiveTab] = useState("Revenue"); // Revenue, Orders
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Mock data for filter selections
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");
  const [selectedSession, setSelectedSession] = useState("All Sessions");
  const [selectedProduct, setSelectedProduct] = useState("All Products");

  // Chart Data based on selected period
  const chartData = {
    Today: {
      Revenue: [
        { label: "09:00", value: 3400 },
        { label: "11:00", value: 7800 },
        { label: "13:00", value: 14500 },
        { label: "15:00", value: 9200 },
        { label: "17:00", value: 12400 },
        { label: "19:00", value: 18600 },
        { label: "21:00", value: 11000 },
      ],
      Orders: [
        { label: "09:00", value: 12 },
        { label: "11:00", value: 24 },
        { label: "13:00", value: 48 },
        { label: "15:00", value: 28 },
        { label: "17:00", value: 36 },
        { label: "19:00", value: 54 },
        { label: "21:00", value: 32 },
      ]
    },
    Week: {
      Revenue: [
        { label: "Mon", value: 28000 },
        { label: "Tue", value: 32400 },
        { label: "Wed", value: 31000 },
        { label: "Thu", value: 42540 },
        { label: "Fri", value: 48000 },
        { label: "Sat", value: 64000 },
        { label: "Sun", value: 58000 },
      ],
      Orders: [
        { label: "Mon", value: 84 },
        { label: "Tue", value: 96 },
        { label: "Wed", value: 90 },
        { label: "Thu", value: 128 },
        { label: "Fri", value: 140 },
        { label: "Sat", value: 195 },
        { label: "Sun", value: 172 },
      ]
    },
    Month: {
      Revenue: [
        { label: "Week 1", value: 120000 },
        { label: "Week 2", value: 145000 },
        { label: "Week 3", value: 168000 },
        { label: "Week 4", value: 185000 },
      ],
      Orders: [
        { label: "Week 1", value: 380 },
        { label: "Week 2", value: 440 },
        { label: "Week 3", value: 510 },
        { label: "Week 4", value: 590 },
      ]
    },
    Custom: {
      Revenue: [
        { label: "Period A", value: 45000 },
        { label: "Period B", value: 52000 },
        { label: "Period C", value: 49000 },
        { label: "Period D", value: 63000 },
      ],
      Orders: [
        { label: "Period A", value: 135 },
        { label: "Period B", value: 160 },
        { label: "Period C", value: 142 },
        { label: "Period D", value: 185 },
      ]
    }
  };

  const activeData = chartData[period][activeTab];

  // Helper calculations for rendering SVG Line Chart
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 60;
  const paddingY = 30;

  const maxVal = Math.max(...activeData.map(d => d.value)) * 1.15;
  const minVal = 0;

  const points = activeData.map((d, index) => {
    const x = paddingX + (index * (svgWidth - 2 * paddingX)) / (activeData.length - 1);
    const y = svgHeight - paddingY - ((d.value - minVal) * (svgHeight - 2 * paddingY)) / (maxVal - minVal);
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : "";

  return (
    <DashboardLayout>
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <PageHeader 
          title="Dashboard Overview"
          description="Real-time sales, orders, and restaurant operations."
          action={{
            label: "Launch POS Terminal",
            href: "/pos",
            icon: ShoppingBag
          }}
        />

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-[#141414] p-1 rounded-xl border border-[#252525]">
          <div className="flex">
            {["Today", "Week", "Month", "Custom"].map(item => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  period === item
                    ? "bg-[#252525] text-[#FF6B1A]"
                    : "text-[#A3A3A3] hover:text-[#F4F1EA]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#252525] mx-1" />

          {/* Employee filter */}
          <FilterSelect 
            value={selectedEmployee} 
            onChange={setSelectedEmployee} 
            options={["All Employees", "Govardanan B", "Sneha M", "Aditya K"]} 
          />

          {/* Session filter */}
          <FilterSelect 
            value={selectedSession} 
            onChange={setSelectedSession} 
            options={["All Sessions", "Register #01", "Register #02", "Register #03"]} 
          />

          {/* Product filter */}
          <FilterSelect 
            value={selectedProduct} 
            onChange={setSelectedProduct} 
            options={["All Products", "Coffee", "Masala Tea", "Lassi", "Burgers"]} 
          />
        </div>
      </div>

      {/* 2. KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium tracking-wide">Revenue</span>
            <TrendingUp size={18} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">₹42,540</h3>
            <span className="text-[10px] text-green-500 font-medium mt-1 inline-flex items-center gap-0.5">
              +12.5% <span className="text-[#A3A3A3]">from yesterday</span>
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium tracking-wide">Orders</span>
            <ShoppingBag size={18} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">128 Orders</h3>
            <span className="text-[10px] text-green-500 font-medium mt-1 inline-flex items-center gap-0.5">
              +18 <span className="text-[#A3A3A3]">today</span>
            </span>
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium tracking-wide">Active Tables</span>
            <Grid size={18} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">12 / 20</h3>
            <span className="text-[10px] text-[#A3A3A3] font-medium mt-1">Currently occupied</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium tracking-wide">Avg. Order Value</span>
            <Percent size={18} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">₹332</h3>
            <span className="text-[10px] text-[#A3A3A3] font-medium mt-1">Per order</span>
          </div>
        </div>

      </div>

      {/* 3. CHART CARD */}
      <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F1EA] tracking-tight">Sales Performance</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">Performance tracking across selected filters</p>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-[#0B0B0B] border border-[#252525] p-0.5 rounded-lg">
            {["Revenue", "Orders"].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#FF6B1A] text-black"
                    : "text-[#A3A3A3] hover:text-[#F4F1EA]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
            {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
              const y = paddingY + r * (svgHeight - 2 * paddingY);
              return (
                <line
                  key={idx}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#252525"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {fillPath && (
              <polygon
                points={fillPath}
                fill="#FF6B1A"
                fillOpacity="0.04"
              />
            )}

            <path
              d={linePath}
              fill="none"
              stroke="#FF6B1A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((p, idx) => {
              const isHovered = hoveredPoint === idx;
              return (
                <g key={idx}>
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill="#A3A3A3"
                    className="text-[9px] font-medium"
                  >
                    {p.label}
                  </text>

                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "5" : "3.5"}
                    fill={isHovered ? "#FF6B1A" : "#0B0B0B"}
                    stroke="#FF6B1A"
                    strokeWidth={isHovered ? "2.5" : "1.75"}
                    className="transition-all duration-150 pointer-events-none"
                  />
                </g>
              );
            })}
          </svg>

          {hoveredPoint !== null && (
            <div
              className="absolute pointer-events-none bg-[#0B0B0B] border border-[#252525] rounded-lg px-2.5 py-1.5 text-left shadow-2xl transition-all duration-75 flex flex-col z-10"
              style={{
                left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
                top: `${(points[hoveredPoint].y / svgHeight) * 100 - 15}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <span className="text-[9px] text-[#A3A3A3] font-medium uppercase tracking-wider">{points[hoveredPoint].label}</span>
              <span className="text-[11px] text-[#F4F1EA] font-bold mt-0.5">
                {activeTab === "Revenue" ? `₹${points[hoveredPoint].value.toLocaleString("en-IN")}` : `${points[hoveredPoint].value} Orders`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Categories Donut Chart */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 lg:col-span-5 flex flex-col">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F1EA] tracking-tight">Top Categories</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">Donut breakdown of product categories</p>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 py-6">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="#252525" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="#FF6B1A" strokeWidth="12" strokeDasharray="141.37 314.16" strokeDashoffset="0" />
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="#F4F1EA" strokeWidth="12" strokeDasharray="94.25 314.16" strokeDashoffset="-141.37" />
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="#8A8A8A" strokeWidth="12" strokeDasharray="47.12 314.16" strokeDashoffset="-235.62" />
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="#3E3E3E" strokeWidth="12" strokeDasharray="31.42 314.16" strokeDashoffset="-282.74" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Sales</span>
                <span className="text-base font-bold text-[#F4F1EA] mt-0.5">100%</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { label: "Beverages", percent: "45%", color: "bg-[#FF6B1A]" },
                { label: "Meals", percent: "30%", color: "bg-[#F4F1EA]" },
                { label: "Desserts", percent: "15%", color: "bg-[#8A8A8A]" },
                { label: "Snacks", percent: "10%", color: "bg-[#3E3E3E]" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                  <span className="text-xs font-medium text-[#F4F1EA]">{item.label}</span>
                  <span className="text-xs text-[#A3A3A3] ml-auto font-medium">{item.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 lg:col-span-7 flex flex-col">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F1EA] tracking-tight">Recent Activity</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">Timeline logs of current terminal operations</p>
          </div>

          <div className="flex-1 space-y-3.5 mt-5">
            {[
              { title: "Order #125 paid", desc: "₹450 paid via UPI terminal • Cashier Sneha M.", time: "2m ago" },
              { title: "Table 7 opened", desc: "3 guests seated • Server Govardanan B.", time: "12m ago" },
              { title: "Coupon SAVE20 applied", desc: "Order #124 • 20% discount applied", time: "25m ago" },
              { title: "Session started", desc: "Register #02 opened by Govardanan B.", time: "1h ago" },
              { title: "Employee login", desc: "Employee authorized • Sneha M. logged in", time: "1h ago" },
              { title: "Kitchen order completed", desc: "Table 3 • Beverages & Snacks dispatched", time: "1h ago" }
            ].map((act, idx) => (
              <div key={idx} className="flex items-start gap-3 text-left">
                <div className="w-16 text-[10px] text-[#A3A3A3] font-medium pt-0.5 shrink-0">
                  {act.time}
                </div>
                <div className="relative flex flex-col items-center shrink-0 pt-1">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B1A] shrink-0" />
                  {idx !== 5 && (
                    <div className="w-px h-10 bg-[#252525] absolute top-2 bottom-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-[#F4F1EA] truncate">{act.title}</h4>
                  <p className="text-[10px] text-[#A3A3A3] truncate mt-0.5">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. DATA TABLES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Products */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 flex flex-col">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F1EA] tracking-tight">Top Products</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">Top-selling items in this session</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#252525]">
                  <th className="py-2 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Product</th>
                  <th className="py-2 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-right">Quantity Sold</th>
                  <th className="py-2 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]/40">
                {[
                  { name: "Masala Tea", qty: 184, rev: "₹3,680" },
                  { name: "Coffee", qty: 142, rev: "₹4,260" },
                  { name: "Lassi", qty: 96, rev: "₹2,880" },
                  { name: "Cheese Burger", qty: 78, rev: "₹6,240" }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#252525]/10 transition-colors">
                    <td className="py-3 text-xs font-semibold text-[#F4F1EA]">{row.name}</td>
                    <td className="py-3 text-xs text-[#A3A3A3] text-right font-medium">{row.qty}</td>
                    <td className="py-3 text-xs font-bold text-[#FF6B1A] text-right">{row.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 flex flex-col">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F1EA] tracking-tight">Top Orders</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">High-value transactions in this session</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#252525]">
                  <th className="py-2 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Order ID</th>
                  <th className="py-2 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Customer</th>
                  <th className="py-2 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-right">Amount</th>
                  <th className="py-2 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]/40">
                {[
                  { id: "#1025", name: "Aditya K.", amt: "₹840", status: "Paid" },
                  { id: "#1024", name: "Sneha M.", amt: "₹320", status: "Paid" },
                  { id: "#1023", name: "Rahul V.", amt: "₹520", status: "Draft" },
                  { id: "#1022", name: "Priya S.", amt: "₹1,120", status: "Cancelled" }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#252525]/10 transition-colors">
                    <td className="py-3 text-xs font-semibold text-[#FF6B1A]">{row.id}</td>
                    <td className="py-3 text-xs text-[#F4F1EA] font-medium">{row.name}</td>
                    <td className="py-3 text-xs text-[#F4F1EA] font-bold text-right">{row.amt}</td>
                    <td className="py-3 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </DashboardLayout>
  );
}
