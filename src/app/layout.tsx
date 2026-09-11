import type { Metadata } from "next";
import { Inter, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "3NFM - Multi-Tenant SaaS Platform",
  description: "Next-Generation Multi-Tenant Commerce and Storefront Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} font-sans bg-[#010101] text-[#EEEFF2] min-h-[100dvh] antialiased selection:bg-[#272835] selection:text-[#EEEFF2]`}
      >
        <div className="min-h-[100dvh] flex flex-col">{children}</div>
      </body>
    </html>
  );
}
