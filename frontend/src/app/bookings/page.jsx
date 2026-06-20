"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Calendar } from "lucide-react";

export default function BookingsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Table Bookings"
        description="Schedule dining reservations, private dining blocks, and waiting lists."
      />
      <div className="border border-[#252525] rounded-2xl bg-[#141414] py-12 flex items-center justify-center">
        <EmptyState
          title="Reservations System Placeholder"
          message="Review table timings, upcoming guest logs, and seating assignments here."
          icon={Calendar}
        />
      </div>
    </DashboardLayout>
  );
}
