"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  match: (p: string) => boolean;
}

export function SideNav() {
  const pathname = usePathname();
  const todayDate = format(new Date(), "yyyy-MM-dd");

  const navItems: NavItem[] = [
    {
      href: `/workout/${todayDate}`,
      label: "Hoy",
      icon: "event_upcoming",
      match: (p) => p.startsWith("/workout"),
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
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-surface-container-low border-r border-outline-variant/10 z-50 px-3 py-6">
      {/* Logo */}
      <div className="px-4 mb-8">
        <span className="text-xl font-black text-primary font-headline tracking-tight">
          IronPrint
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-semibold",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <span
                className="material-symbols-outlined text-[22px] shrink-0"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                    : { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                }
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <button
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all duration-200 w-full"
        aria-label="Configuración"
      >
        <span
          className="material-symbols-outlined text-[22px] shrink-0"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          settings
        </span>
        <span>Configuración</span>
      </button>
    </aside>
  );
}
