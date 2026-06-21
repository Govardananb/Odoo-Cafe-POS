"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Perform verification checks
    authCheck(pathname);
  }, [pathname]);

  const authCheck = (url) => {
    setChecking(true);
    
    // Check if window is defined (browser environment)
    if (typeof window === "undefined") {
      setChecking(false);
      return;
    }

    const userRaw = localStorage.getItem("currentUser");
    const user = userRaw ? JSON.parse(userRaw) : null;

    // Define public routes
    const isPublicRoute = 
      url === "/login" || 
      url === "/signup" || 
      url === "/" ||
      url.startsWith("/s/") ||
      url.startsWith("/customer");
    
    // Define admin-only routes
    const isAdminRoute = 
      url.startsWith("/dashboard") ||
      url.startsWith("/products") ||
      url.startsWith("/categories") ||
      url.startsWith("/employees") ||
      url.startsWith("/tables") ||
      url.startsWith("/payment-methods") ||
      url.startsWith("/coupons") ||
      url.startsWith("/bookings") ||
      url.startsWith("/reports") ||
      url.startsWith("/settings");

    if (!user) {
      // User is not logged in
      if (!isPublicRoute) {
        setAuthorized(false);
        router.replace("/login");
      } else {
        setAuthorized(true);
        setChecking(false);
      }
    } else {
      // User is logged in
      const isAdmin = user.role === "admin";

      if (url === "/login" || url === "/signup" || url === "/") {
        // Redirect logged-in users away from auth pages
        setAuthorized(false);
        if (isAdmin) {
          router.replace("/dashboard");
        } else {
          router.replace("/pos");
        }
      } else if (isAdminRoute && !isAdmin) {
        // Redirect non-admins trying to access admin pages
        setAuthorized(false);
        router.replace("/pos");
      } else {
        // Authorized
        setAuthorized(true);
        setChecking(false);
      }
    }
  };

  if (checking || !authorized) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0B0B] text-[#F4F1EA] select-none font-sans">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#A3A3A3] tracking-widest uppercase">
            Verifying Terminal Authorization...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
