import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi-Tenant SaaS Platform | Store Rental & Automated API Gateway",
  description:
    "ระบบ Multi-tenant SaaS สำหรับปล่อยเช่าร้านค้าออนไลน์และให้บริการ API อัตโนมัติ พร้อมระบบ Billing และ PromptPay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
