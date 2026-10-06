"use client";
import { Plane, BedDouble, Heart, CheckCircle2 } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { Badge, Progress } from "@/components/ui/Bits";
import { fmtDate, money, pct } from "@/lib/format";
import type { Trip } from "@/types";

export function TripSummary({ trip, go }: { trip: Trip; go: (tab: string) => void }) {
  const flights = useCollection("trip_flights", { trip_id: trip.id }, { key: "date", asc: true });
  const hotels = useCollection("trip_hotels", { trip_id: trip.id });
  const places = useCollection("trip_places", { trip_id: trip.id });
  const tasks = useCollection("trip_tasks", { trip_id: trip.id });
  const reserved = hotels.rows.find((h) => h.status === "Reservado");
  const favs = places.rows.filter((p) => p.favorite || p.priority === "Imperdible").slice(0, 6);
  const done = tasks.rows.filter((t) => t.done).length;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <button onClick={() => go("vuelos")} className="card p-4 text-left">
        <p className="mb-3 flex items-center gap-2 font-medium text-noche"><Plane size={18} />Vuelos</p>
        {flights.rows.length ? flights.rows.slice(0, 3).map((f) => (
          <div key={f.id} className="flex items-center justify-between border-t border-noche-100 py-2 text-sm first:border-0">
            <span><Badge tone={f.direction === "Ida" ? "ok" : "info"}>{f.direction}</Badge> <b className="ml-1">{f.from_airport || "?"} → {f.to_airport || "?"}</b></span>
            <span className="text-gris">{fmtDate(f.date)} {f.time}</span>
          </div>
        )) : <p className="text-sm text-gris">Todavía no cargaron vuelos.</p>}
      </button>
      <button onClick={() => go("hotel")} className="card p-4 text-left">
        <p className="mb-3 flex items-center gap-2 font-medium text-noche"><BedDouble size={18} />Alojamiento</p>
        {reserved ? (
          <div><p className="font-display text-2xl text-noche">{reserved.name}</p>
            <p className="text-sm text-gris">{reserved.location} · {fmtDate(reserved.check_in)} → {fmtDate(reserved.check_out)}</p>
            {reserved.total_price && <p className="mt-1 text-sm">{money(reserved.total_price, reserved.currency || trip.currency || "USD")}</p>}</div>
        ) : <p className="text-sm text-gris">{hotels.rows.length ? `${hotels.rows.length} opciones guardadas, ninguna reservada todavía.` : "Sin alojamiento cargado."}</p>}
      </button>
      <button onClick={() => go("checklist")} className="card p-4 text-left">
        <p className="mb-3 flex items-center gap-2 font-medium text-noche"><CheckCircle2 size={18} />Checklist</p>
        <p className="text-sm text-gris">{done} de {tasks.rows.length} tareas listas</p>
        <Progress value={pct(done, tasks.rows.length)} tone="mar" className="mt-2" />
        <ul className="mt-3 space-y-1 text-sm">{tasks.rows.filter((t) => !t.done).slice(0, 4).map((t) => <li key={t.id} className="text-noche-700">○ {t.title}</li>)}</ul>
      </button>
      <button onClick={() => go("lugares")} className="card p-4 text-left">
        <p className="mb-3 flex items-center gap-2 font-medium text-noche"><Heart size={18} />Imperdibles y favoritos</p>
        {favs.length ? <div className="flex flex-wrap gap-1.5">{favs.map((p) => <Badge key={p.id} tone="rose">{p.name}</Badge>)}</div>
          : <p className="text-sm text-gris">Marcá lugares como favoritos o imperdibles y aparecen acá.</p>}
      </button>
      {trip.notes && <div className="card p-4 md:col-span-2"><p className="mb-1 font-medium text-noche">Notas del viaje</p><p className="whitespace-pre-line text-sm text-noche-700">{trip.notes}</p></div>}
    </div>
  );
}
