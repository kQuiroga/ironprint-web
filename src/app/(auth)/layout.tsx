"use client";

import { Suspense, type ReactNode } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { SideNav } from "@/components/ui/SideNav";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop only */}
      <Suspense>
        <SideNav />
      </Suspense>

      {/* Header — mobile only */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-primary/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
          <span className="text-xl font-black text-primary font-headline tracking-tight">
            IronPrint
          </span>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
            aria-label="Configuración"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              settings
            </span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-20 md:pt-10 pb-28 md:pb-10 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <Suspense>
          <BottomNav />
        </Suspense>
      </div>
    </div>
  );
}
