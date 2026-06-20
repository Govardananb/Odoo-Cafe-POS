import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "ODOO CAFE - POS Terminal",
  description: "Secure employee authentication and session management for ODOO CAFE POS system.",
};

import RouteGuard from "@/components/layout/RouteGuard";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0B] text-[#F4F1EA] font-sans">
        <RouteGuard>
          {children}
        </RouteGuard>
      </body>
    </html>
  );
}

