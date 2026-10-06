"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCollection } from "@/hooks/useCollection";
import { useHashTab } from "@/hooks/useHashTab";
import { useFeedback } from "@/components/ui/Feedback";
import { Tabs, Spinner, Empty } from "@/components/ui/Bits";
import { ResourceManager } from "@/components/crud/ResourceManager";
import { ResourceForm } from "@/components/crud/ResourceForm";
import { TripHeader } from "@/components/trips/TripHeader";
import { TripSummary } from "@/components/trips/TripSummary";
import { TripHotels } from "@/components/trips/TripHotels";
import { TripExpenses, useTripTotals } from "@/components/trips/TripExpenses";
import { Itinerary } from "@/components/trips/Itinerary";
import { TripChecklist } from "@/components/trips/TripChecklist";
import { tripFields, flights, places, tripIdeas, tripDocuments, tripNotes } from "@/config/trip-resources";
import { errorMessage } from "@/services/db";
import type { Trip } from "@/types";

const TABS = [
  { id: "resumen", label: "Resumen" }, { id: "vuelos", label: "Vuelos" }, { id: "hotel", label: "Hotel" },
  { id: "lugares", label: "Lugares" }, { id: "ideas", label: "Ideas" }, { id: "itinerario", label: "Itinerario" },
  { id: "gastos", label: "Gastos" }, { id: "documentos", label: "Documentos" }, { id: "checklist", label: "Checklist" }, { id: "notas", label: "Notas" },
];

function Section({ id, tripId, config, currency }: { id: string; tripId: string; config: any; currency: string }) {
  const col = useCollection(config.table, { trip_id: tripId });
  return <ResourceManager key={id} config={config} col={col} currency={currency} defaults={{ currency }} />;
}

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useFeedback();
  const tripCol = useCollection<Trip>("trips", { id });
  const expenses = useCollection("trip_expenses", { trip_id: id }, { key: "date", asc: false });
  const [tab, setTab] = useHashTab(TABS.map((t) => t.id), "resumen");
  const [editing, setEditing] = useState(false);
  const trip = tripCol.rows[0];
  const totals = useTripTotals(expenses.rows, trip);

  if (tripCol.loading) return <Spinner />;
  if (!trip) return <div className="container-app py-10"><Empty title="No encontramos este viaje" text="Puede que se haya eliminado." /></div>;
  const cur = trip.currency || "USD";

  const updateTrip = async (d: Record<string, any>) => {
    try { await tripCol.update(trip.id, d); } catch (e) { toast(errorMessage(e), "error"); }
  };

  return (
    <div>
      <TripHeader trip={trip} spent={totals.total} onEdit={() => setEditing(true)} />
      <div className="container-app mt-5">
        <div className="sticky top-0 z-30 -mx-4 bg-porcelana/90 px-4 pb-2 pt-[max(env(safe-area-inset-top),8px)] backdrop-blur md:top-16 md:mx-0 md:px-0 md:pt-2">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="py-5">
          {tab === "resumen" && <TripSummary trip={trip} go={setTab} />}
          {tab === "vuelos" && <Section id="vuelos" tripId={trip.id} config={flights} currency={cur} />}
          {tab === "hotel" && <TripHotels trip={trip} />}
          {tab === "lugares" && <Section id="lugares" tripId={trip.id} config={places} currency={cur} />}
          {tab === "ideas" && <Section id="ideas" tripId={trip.id} config={tripIdeas} currency={cur} />}
          {tab === "itinerario" && <Itinerary trip={trip} onUpdateTrip={updateTrip} />}
          {tab === "gastos" && <TripExpenses trip={trip} col={expenses} />}
          {tab === "documentos" && <Section id="documentos" tripId={trip.id} config={tripDocuments} currency={cur} />}
          {tab === "checklist" && <TripChecklist tripId={trip.id} />}
          {tab === "notas" && <Section id="notas" tripId={trip.id} config={tripNotes} currency={cur} />}
        </div>
      </div>
      <ResourceForm open={editing} onClose={() => setEditing(false)} title="Editar viaje" fields={tripFields} initial={trip}
        onSave={(v) => tripCol.update(trip.id, v)}
        onDelete={async () => { await tripCol.remove(trip.id); router.replace("/viajes"); }} />
    </div>
  );
}
