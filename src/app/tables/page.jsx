"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { tableService } from "@/services/tableService";
import { Grid, Plus } from "lucide-react";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tableService.getTables().then(data => {
      setTables(data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Tables Management"
        description="Monitor cafe table occupancy and dining capacities."
        action={{
          label: "Add Table",
          icon: Plus,
          onClick: () => alert("Add Table CRUD action placeholder")
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tables.map(table => (
          <div key={table.id} className="border border-[#252525] rounded-2xl bg-[#141414] p-5 space-y-3 relative text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F4F1EA]">{table.name}</span>
              <StatusBadge status={table.status} />
            </div>
            <div>
              <p className="text-[10px] text-[#A3A3A3]">Capacity: {table.capacity} guests</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
