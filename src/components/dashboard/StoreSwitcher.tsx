"use client";

import { useState, useRef, useEffect } from "react";
import { Store, ChevronDown, Check, Plus, Clock, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function StoreSwitcher() {
  const { stores, activeStoreId, activeStore, setActiveStoreId, setIsCreateModalOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeStore) {
    return (
      <div className="h-9 px-3 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center gap-2 animate-pulse">
        <Store className="w-3.5 h-3.5 text-[#EEEFF2]/50" />
        <span className="font-mono text-xs text-[#EEEFF2]/50">Loading Stores...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-xs font-medium text-[#EEEFF2] transition-all cursor-pointer shadow-sm active:scale-95"
      >
        <div className="w-5 h-5 rounded-lg bg-[#010101] border border-[#EEEFF2]/10 flex items-center justify-center shrink-0">
          <Store className="w-3 h-3 text-amber-400" />
        </div>

        <div className="flex items-center gap-1.5 text-left">
          <span className="font-bold text-[#EEEFF2] max-w-[120px] sm:max-w-[160px] truncate">
            {activeStore.name}
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-[#010101] text-amber-400 border border-amber-500/30 font-semibold shrink-0">
            @{activeStore.subdomain}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#EEEFF2]/60 group-hover:text-[#EEEFF2] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2 border-b border-[#EEEFF2]/10 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#EEEFF2]/50">
              ร้านค้าของคุณ (YOUR TENANT STORES)
            </span>
            <span className="font-mono text-[10px] text-amber-400 font-semibold">
              {stores.length} ร้าน
            </span>
          </div>

          {/* Store List */}
          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-[#EEEFF2]/5">
            {stores.map((s) => {
              const isSelected = s.id === activeStoreId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveStoreId(s.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#272835]/80 text-[#EEEFF2]"
                      : "hover:bg-[#272835]/40 text-[#EEEFF2]/80 hover:text-[#EEEFF2]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                          : "bg-[#272835] border-[#EEEFF2]/10 text-[#EEEFF2]/60"
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex flex-col">
                      <span className="font-semibold text-xs truncate text-[#EEEFF2]">
                        {s.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] text-amber-400/90 font-medium">
                          @{s.subdomain}
                        </span>
                        <span className="text-[#EEEFF2]/30">&bull;</span>
                        <span
                          className={`font-mono text-[9px] px-1 py-0.2 rounded ${
                            s.is_active
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {s.is_active ? "ACTIVE" : "EXPIRED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer: Create Store CTA Button */}
          <div className="p-2 border-t border-[#EEEFF2]/10 mt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#272835] hover:bg-[#343647] border border-amber-500/30 hover:border-amber-500/50 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>สร้างร้านค้าใหม่ (+14 วันทดลองใช้ฟรี)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
