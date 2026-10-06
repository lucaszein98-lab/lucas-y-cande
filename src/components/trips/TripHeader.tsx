"use client";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { StoredImage, Progress } from "@/components/ui/Bits";
import { countdownText, daysUntil, fmtRange, money, pct } from "@/lib/format";
import { site } from "@/config/site";
import type { Trip } from "@/types";

export function TripHeader({ trip, spent, onEdit }: { trip: Trip; spent: number; onEdit: () => void }) {
  const cur = trip.currency || "USD";
  const budget = Number(trip.budget || 0);
  const left = budget - spent;
  const d = daysUntil(trip.start_date);
  return (
    <header className="relative">
      <div className="relative h-[46dvh] min-h-[300px] overflow-hidden md:h-[380px]">
        <StoredImage src={trip.cover_url} fallback={site.stock.viajeDefault} alt={trip.name} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/35 to-noche/20" />
        <div className="absolute inset-x-0 top-0 flex justify-between p-4 pt-[max(env(safe-area-inset-top),16px)]">
          <Link href="/viajes" className="rounded-full bg-white/90 p-2.5 text-noche shadow" aria-label="Volver a viajes"><ArrowLeft size={20} /></Link>
          <button onClick={onEdit} className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-noche shadow"><Pencil size={15} />Editar viaje</button>
        </div>
        <div className="container-app absolute inset-x-0 bottom-0 pb-16 text-white">
          {d !== null && d > 0 && <p className="mb-1 text-sm font-medium text-[#D9B26A]">Próxima aventura ❤️ · {countdownText(trip.start_date)}</p>}
          {d !== null && d <= 0 && <p className="mb-1 text-sm font-medium text-[#D9B26A]">{countdownText(trip.start_date)}</p>}
          <h1 className="font-display text-5xl font-light leading-none sm:text-6xl">{trip.emoji} {trip.name}</h1>
          <p className="mt-2 text-white/80">{trip.destination ? `${trip.destination} · ` : ""}{fmtRange(trip.start_date, trip.end_date)}</p>
        </div>
      </div>
      <div className="container-app relative -mt-10">
        <div className="card grid grid-cols-3 gap-2 p-4">
          <div><p className="text-xs text-gris">Presupuesto</p><p className="font-display text-xl tabular-nums text-noche sm:text-2xl">{money(budget, cur)}</p></div>
          <div><p className="text-xs text-gris">Gastado</p><p className="font-display text-xl tabular-nums text-vela-600 sm:text-2xl">{money(spent, cur)}</p></div>
          <div><p className="text-xs text-gris">Disponible</p><p className={`font-display text-xl tabular-nums sm:text-2xl ${left < 0 ? "text-malva" : "text-mar"}`}>{money(left, cur)}</p></div>
          <div className="col-span-3 mt-1 flex items-center gap-3">
            <Progress value={pct(spent, budget)} tone="mar" />
            <span className="shrink-0 text-xs font-medium tabular-nums text-noche-500">{pct(spent, budget)}%</span>
          </div>
        </div>
      </div>
    </header>
  );
}
