import { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { StoreProvider } from "@/context/StoreContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CreateStoreModal from "@/components/dashboard/CreateStoreModal";

export const metadata = {
  title: "Merchant Dashboard - 3NFM Platform",
  description: "3NFM SaaS Merchant Management Portal",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col selection:bg-[#272835] selection:text-[#EEEFF2]">
        {/* Dynamic Top Navigation Bar with Multi-Store Switcher */}
        <DashboardHeader />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Global Create Store Modal */}
        <CreateStoreModal />

        {/* Footer */}
        <footer className="border-t border-[#EEEFF2]/10 py-6 bg-[#010101] text-xs text-[#EEEFF2]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>3NFM Commerce Engine &bull; Multi-Tenant Merchant Control Suite</span>
            </div>
            <div className="font-mono text-[11px]">
              Session: user_id=&apos;u-001&apos; &bull; Shared Account Wallet &bull; Isolated Tenant Stores
            </div>
          </div>
        </footer>
      </div>
    </StoreProvider>
  );
}
