"use client";

import React from "react";
import AuthFlow from "@/components/pos/AuthFlow";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] bg-surface border border-border rounded-[24px] flex flex-col overflow-hidden">
        <AuthFlow initialScreen="login" />
      </div>
    </main>
  );
}
