"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useApp } from "@/hooks/useApp";
import { TripCard } from "@/components/trips/TripCard";
import { ResourceForm, initialValues } from "@/components/crud/ResourceForm";
import { Button } from "@/components/ui/Button";
import { Empty, Spinner } from "@/components/ui/Bits";
import { tripFields, DEFAULT_TRIP_TASKS } from "@/config/trip-resources";
import { insertMany } from "@/services/db";
import { daysUntil, inTripCurrency } from "@/lib/format";
import { site } from "@/config/site";
import type { Trip } from "@/types";

export default function Viajes() {
  const { couple } = useApp();
  const router = useRouter();
  const trips = useCollection<Trip>("trips", {}, { key: "start_date", asc: true });
  const expenses = useCollection("trip_expenses");
  const [creating, setCreating] = useState(false);

  const spentBy = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of expenses.rows) {
      const t = trips.rows.find((x) => x.id === e.trip_id);
      m[e.trip_id] = (m[e.trip_id] || 0) + inTripCurrency(e, t?.currency).value;
    }
    return m;
  }, [expenses.rows, trips.rows]);

  const upcoming = trips.rows.filter((t) => { const d = daysUntil(t.end_date || t.start_date); return d === null || d >= 0; });
  const past = trips.rows.filter((t) => !upcoming.includes(t));

  const create = async (v: Record<string, any>) => {
    const trip = await trips.create(v);
    await insertMany("trip_tasks", DEFAULT_TRIP_TASKS.map((title, i) => ({ title, position: i + 1, trip_id: trip.id, couple_id: couple!.id })));
    router.push(`/viajes/${trip.id}`);
  };

  return (
    <div>
      <section className="relative h-[34dvh] min-h-[240px] overflow-hidden md:h-[320px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={site.stock.viajes} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/40 to-noche/10" />
        <div className="container-app absolute inset-x-0 bottom-0 pb-7 text-white">
          <h1 className="font-display text-5xl font-light leading-none">Nuestros viajes</h1>
          <p className="mt-2 text-white/80">Viajes que queremos vivir juntos.</p>
        </div>
      </section>
      <div className="container-app py-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gris">{trips.rows.length} {trips.rows.length === 1 ? "viaje" : "viajes"}</p>
          <Button onClick={() => setCreating(true)} variant="sea"><Plus size={18} />Crear nuevo viaje</Button>
        </div>
        {trips.loading ? <Spinner /> : trips.rows.length === 0 ? (
          <Empty title="El primer destino los espera" text="Creen un viaje (por ejemplo, Río de Janeiro 2027) y empiecen a cargar vuelos, hoteles e ideas."
            action={<Button variant="sea" onClick={() => setCreating(true)}><Plus size={18} />Crear nuevo viaje</Button>} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((t) => <TripCard key={t.id} trip={t} spent={spentBy[t.id] || 0} />)}
            </div>
            {past.length > 0 && (
              <>
                <h2 className="mb-3 mt-10 font-display text-2xl text-noche">Los que ya vivimos</h2>
                <div className="grid gap-4 opacity-90 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((t) => <TripCard key={t.id} trip={t} spent={spentBy[t.id] || 0} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <ResourceForm open={creating} onClose={() => setCreating(false)} title="Nuevo viaje" fields={tripFields}
        initial={initialValues(tripFields, { currency: "USD" })} onSave={create} />
    </div>
  );
}
