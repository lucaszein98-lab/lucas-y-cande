"use client";
import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import { ResourceManager } from "@/components/crud/ResourceManager";
import { useCollection } from "@/hooks/useCollection";
import { Badge } from "@/components/ui/Bits";
import { hotels } from "@/config/trip-resources";
import { cn, money, nightsBetween } from "@/lib/format";
import type { Trip } from "@/types";

export function TripHotels({ trip }: { trip: Trip }) {
  const col = useCollection("trip_hotels", { trip_id: trip.id });
  const [compare, setCompare] = useState(false);
  const cur = trip.currency || "USD";

  const transform = (v: Record<string, any>) => {
    const nights = v.nights || nightsBetween(v.check_in, v.check_out);
    const total = v.total_price || (v.price_per_night && nights ? v.price_per_night * nights : null);
    return { ...v, nights: nights || null, total_price: total };
  };

  const ranked = useMemo(() => col.rows.filter((h) => h.status !== "Descartado")
    .sort((a, b) => Number(a.total_price ?? Infinity) - Number(b.total_price ?? Infinity)), [col.rows]);

  const header = col.rows.length > 1 ? (
    <div className="mb-4">
      <button onClick={() => setCompare((c) => !c)} className={cn("chip", compare && "!bg-noche !text-white")}><Scale size={14} />Comparar alojamientos</button>
      {compare && (
        <div className="card fade-in mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs text-gris"><tr className="border-b border-noche-100">
              <th className="p-3 font-medium">Alojamiento</th><th className="p-3 font-medium">Noches</th><th className="p-3 font-medium">Por noche</th><th className="p-3 font-medium">Total</th><th className="p-3 font-medium">Estado</th></tr></thead>
            <tbody>
              {ranked.map((h, i) => (
                <tr key={h.id} className="border-b border-noche-100 last:border-0">
                  <td className="p-3"><p className="font-medium text-noche">{h.name}</p><p className="text-xs text-gris">{h.location}</p></td>
                  <td className="p-3 tabular-nums">{h.nights ?? "—"}</td>
                  <td className="p-3 tabular-nums">{h.price_per_night ? money(h.price_per_night, h.currency || cur) : "—"}</td>
                  <td className="p-3 tabular-nums font-semibold">{h.total_price ? money(h.total_price, h.currency || cur) : "—"}{i === 0 && h.total_price ? <Badge tone="ok" className="ml-2">Más económico</Badge> : null}</td>
                  <td className="p-3"><Badge tone={hotels.tones?.[h.status]}>{h.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  ) : null;

  return <ResourceManager config={hotels} col={col} currency={cur} header={header} transform={transform}
    defaults={{ currency: cur, check_in: trip.start_date, check_out: trip.end_date }} />;
}
