"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Settings & System Configurations"
        description="Configure cafe branding, currency symbols, tax rates, and terminal profiles."
      />
      <div className="border border-[#252525] rounded-2xl bg-[#141414] py-12 flex items-center justify-center">
        <EmptyState
          title="POS Settings Panel Placeholder"
          message="Adjust print templates, tax rates, terminal registrations, and hardware connections here."
          icon={Settings}
        />
      </div>
    </DashboardLayout>
  );
}
