"use client";

import React from "react";
import AuthFlow from "@/components/AuthFlow";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      {/* Premium POS Auth Container */}
      <div className="w-full max-w-[400px] bg-surface border border-border rounded-[24px] flex flex-col overflow-hidden">
        <AuthFlow />
      </div>
    </main>
  );
}
