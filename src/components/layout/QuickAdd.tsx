"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Wallet, Lightbulb, Bell, Receipt, UserPlus, MapPin, X } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { ResourceForm, initialValues } from "@/components/crud/ResourceForm";
import { insertRow, listRows } from "@/services/db";
import { tripExpenseFields, tripIdeas } from "@/config/trip-resources";
import { reminders, weddingIdeas, weddingExpenseFields, guestFields } from "@/config/wedding-resources";
import { cn } from "@/lib/format";
import type { FieldDef, Trip } from "@/types";

type Action = { id: string; label: string; icon: any; table: string; fields: FieldDef[]; needsTrip?: boolean; title: string };

const ACTIONS: Action[] = [
  { id: "tgasto", label: "Gasto de viaje", icon: Wallet, table: "trip_expenses", fields: tripExpenseFields, needsTrip: true, title: "Nuevo gasto de viaje" },
  { id: "tidea", label: "Idea de viaje", icon: MapPin, table: "trip_ideas", fields: tripIdeas.fields, needsTrip: true, title: "Nueva idea de viaje" },
  { id: "wgasto", label: "Gasto del casamiento", icon: Receipt, table: "wedding_expenses", fields: weddingExpenseFields, title: "Nuevo gasto del casamiento" },
  { id: "widea", label: "Idea del casamiento", icon: Lightbulb, table: "wedding_ideas", fields: weddingIdeas.fields, title: "Nueva idea del casamiento" },
  { id: "rec", label: "Recordatorio", icon: Bell, table: "wedding_reminders", fields: reminders.fields, title: "Nuevo recordatorio" },
  { id: "inv", label: "Invitado", icon: UserPlus, table: "wedding_guests", fields: guestFields, title: "Nuevo invitado" },
];

export function QuickAdd() {
  const { couple } = useApp();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (open && couple) listRows<Trip>("trips", { couple_id: couple.id }, "start_date", true).then(setTrips).catch(() => {});
  }, [open, couple]);

  const currentTrip = path.match(/^\/viajes\/([0-9a-f-]{36})/)?.[1];

  const fields = useMemo(() => {
    if (!action) return [];
    if (!action.needsTrip) return action.fields;
    const tripField: FieldDef = {
      name: "trip_id", label: "Viaje", type: "select", required: true,
      options: trips.map((t) => t.id), optionLabels: Object.fromEntries(trips.map((t) => [t.id, `${t.emoji || ""} ${t.name}`])),
    };
    return [tripField, ...action.fields];
  }, [action, trips]);

  const defaults = useMemo(() => {
    if (!action?.needsTrip) return {};
    const t = trips.find((x) => x.id === currentTrip) || trips[0];
    return t ? { trip_id: t.id, currency: t.currency } : {};
  }, [action, trips, currentTrip]);

  const choose = (a: Action) => { setOpen(false); setAction(a); };
  const available = ACTIONS.filter((a) => !a.needsTrip || trips.length > 0);

  return (
    <>
      {open && <div className="fade-in fixed inset-0 z-40 bg-noche/30 backdrop-blur-[1px]" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+80px)] right-4 z-50 flex flex-col items-end gap-2 md:bottom-8 md:right-8">
        {open && available.map((a) => (
          <button key={a.id} onClick={() => choose(a)} className="sheet-in flex items-center gap-3 rounded-full bg-white py-2 pl-4 pr-2 text-sm font-medium text-noche shadow-flotante">
            {a.label}<span className="rounded-full bg-porcelana p-2"><a.icon size={18} /></span>
          </button>
        ))}
        <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Cerrar" : "Agregar rápido"} aria-expanded={open}
          className={cn("flex h-14 w-14 items-center justify-center rounded-full text-white shadow-flotante transition", open ? "rotate-90 bg-noche-700" : "bg-noche")}>
          {open ? <X size={24} /> : <Plus size={26} />}
        </button>
      </div>
      {action && (
        <ResourceForm open={!!action} onClose={() => setAction(null)} title={action.title} fields={fields}
          initial={initialValues(fields, defaults)}
          onSave={(v) => insertRow(action.table, { ...v, couple_id: couple!.id })} />
      )}
    </>
  );
}
