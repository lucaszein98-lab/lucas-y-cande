import Link from "next/link";
import { StoredImage, Progress } from "@/components/ui/Bits";
import { countdownText, daysUntil, fmtRange, money, pct } from "@/lib/format";
import { site } from "@/config/site";
import type { Trip } from "@/types";

export function TripCard({ trip, spent }: { trip: Trip; spent: number }) {
  const d = daysUntil(trip.start_date);
  const back = daysUntil(trip.end_date);
  const status = d !== null && d > 0 ? countdownText(trip.start_date)
    : d !== null && d <= 0 && back !== null && back >= 0 ? "En viaje ahora"
    : back !== null && back < 0 ? "Ya lo vivimos" : "Sin fecha";
  const used = pct(spent, Number(trip.budget || 0));
  return (
    <Link href={`/viajes/${trip.id}`} className="group block overflow-hidden rounded-[1.5rem] bg-white shadow-suave transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-44">
        <StoredImage src={trip.cover_url} fallback={site.stock.viajeDefault} alt={trip.name} className="h-full w-full transition duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-noche/80 via-noche/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-noche">{status}</span>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="font-display text-[1.7rem] leading-tight">{trip.emoji} {trip.name}</p>
          <p className="text-sm text-white/80">{trip.destination ? `${trip.destination} · ` : ""}{fmtRange(trip.start_date, trip.end_date)}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-gris">Gastado</span>
          <span className="tabular-nums text-noche"><b>{money(spent, trip.currency || "USD")}</b> de {money(trip.budget, trip.currency || "USD")}</span>
        </div>
        <Progress value={used} tone="mar" className="mt-2" />
      </div>
    </Link>
  );
}
