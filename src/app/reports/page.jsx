"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Reports & Analytics"
        description="View cash registers logs, sales tallies, and end of day summary."
      />
      <div className="border border-[#252525] rounded-2xl bg-[#141414] py-12 flex items-center justify-center">
        <EmptyState
          title="Reports Dashboard Placeholder"
          message="Detailed sales metrics, cashier audits, and visual graph reports will be integrated here."
          icon={BarChart3}
        />
      </div>
    </DashboardLayout>
  );
}
