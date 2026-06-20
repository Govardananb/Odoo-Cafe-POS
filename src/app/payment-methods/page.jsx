"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { CreditCard } from "lucide-react";

export default function PaymentMethodsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Payment Methods"
        description="Configure terminal integrations, cash drawers, and card payments."
      />
      <div className="border border-[#252525] rounded-2xl bg-[#141414] py-12 flex items-center justify-center">
        <EmptyState
          title="Payment Configurations Placeholder"
          message="UPI terminals, external card readers, and payment gateway keys will be configured here."
          icon={CreditCard}
        />
      </div>
    </DashboardLayout>
  );
}
