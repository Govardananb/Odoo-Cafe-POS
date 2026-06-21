"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerCartRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/customer/menu?openCart=true");
  }, [router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #222", borderTop: "2px solid #FF6B1A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
