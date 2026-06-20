"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { ChefHat } from "lucide-react";

export default function KDSPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Kitchen Display System (KDS)"
        description="Monitor current ticket processing status and prep station updates."
      />
      <div className="border border-[#252525] rounded-2xl bg-[#141414] py-12 flex items-center justify-center">
        <EmptyState
          title="KDS Controller Placeholder"
          message="Incoming order tickets, preparation lists, and kitchen monitor logs will be rendered here."
          icon={ChefHat}
        />
      </div>
    </DashboardLayout>
  );
}
