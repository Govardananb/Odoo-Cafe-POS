"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Tag } from "lucide-react";

export default function CouponsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Coupons & Promotions"
        description="Set up happy hour deals, percentage discounts, and voucher codes."
      />
      <div className="border border-[#252525] rounded-2xl bg-[#141414] py-12 flex items-center justify-center">
        <EmptyState
          title="Vouchers & Offers Placeholder"
          message="Create and schedule promo codes, active campaigns, and customer loyalty rewards here."
          icon={Tag}
        />
      </div>
    </DashboardLayout>
  );
}
