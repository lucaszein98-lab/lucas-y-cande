"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plane, Gem, Settings } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { cn } from "@/lib/format";
import { QuickAdd } from "./QuickAdd";
import { Names } from "./Names";

const NAV = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/viajes", label: "Viajes", icon: Plane },
  { href: "/casamiento", label: "Casamiento", icon: Gem },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { couple } = useApp();
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <div className="min-h-dvh pb-[calc(env(safe-area-inset-bottom)+84px)] md:pb-12">
      <header className="sticky top-0 z-40 hidden border-b border-noche-100/70 bg-porcelana/85 backdrop-blur md:block">
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/inicio" className="font-display text-2xl text-noche"><Names name={couple?.name || ""} /></Link>
          <nav className="flex gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition", active(href) ? "bg-noche text-white" : "text-noche-500 hover:text-noche")}>
                <Icon size={16} />{label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <QuickAdd />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-noche-100 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Navegación principal">
        <div className="grid grid-cols-4">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active(href) ? "text-noche" : "text-noche-300")}>
              <Icon size={22} strokeWidth={active(href) ? 2.2 : 1.7} />{label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
