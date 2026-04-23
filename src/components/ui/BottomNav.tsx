"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  match: (p: string) => boolean;
}

export function BottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: "/today",
      label: "Hoy",
      icon: "event_upcoming",
      match: (p) => p === "/today" || p.startsWith("/workout"),
    },
    {
      href: "/calendar",
      label: "Calendario",
      icon: "calendar_month",
      match: (p) => p === "/calendar",
    },
    {
      href: "/routines",
      label: "Rutinas",
      icon: "exercise",
      match: (p) => p.startsWith("/routines"),
    },
    {
      href: "/",
      label: "Perfil",
      icon: "person",
      match: (p) => p === "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl rounded-t-3xl border-t border-outline-variant/10 shadow-[0_-8px_32px_rgba(57,56,47,0.06)]">
      <div className="flex justify-around items-center pb-8 pt-3 px-4">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary scale-95"
                  : "text-outline hover:text-on-surface"
              )}
            >
              <span
                className="material-symbols-outlined text-[24px] mb-1"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                    : { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                }
              >
                {item.icon}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
