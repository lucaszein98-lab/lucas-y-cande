"use client";
import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { Plus, Clock, MapPin, GripVertical, Sun, Sunset, Moon, CalendarPlus } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useFeedback } from "@/components/ui/Feedback";
import { ResourceForm, initialValues } from "@/components/crud/ResourceForm";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Bits";
import { itineraryFields, PERIODS } from "@/config/trip-resources";
import { cn, nightsBetween, parseDate } from "@/lib/format";
import { errorMessage } from "@/services/db";
import type { Row, Trip } from "@/types";

const PERIOD_ICON: Record<string, any> = { "Mañana": Sun, "Tarde": Sunset, "Noche": Moon };

function Card({ item, onOpen, overlay }: { item: Row; onOpen?: () => void; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id, disabled: overlay });
  return (
    <div ref={overlay ? undefined : setNodeRef}
      className={cn("flex items-start gap-2 rounded-xl border border-noche-100 bg-white p-2.5 text-sm shadow-sm", isDragging && "opacity-30", overlay && "rotate-1 shadow-flotante")}>
      <button {...listeners} {...attributes} className="mt-0.5 cursor-grab touch-none text-noche-300 active:cursor-grabbing" aria-label="Mover actividad"><GripVertical size={16} /></button>
      <button onClick={onOpen} className="flex-1 text-left">
        <p className="font-medium text-tinta">{item.title}</p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gris">
          {item.time && <span className="flex items-center gap-1"><Clock size={12} />{item.time}</span>}
          {item.location && <span className="flex items-center gap-1"><MapPin size={12} />{item.location}</span>}
        </p>
      </button>
    </div>
  );
}

function Slot({ id, period, items, onAdd, onOpen }: { id: string; period: string; items: Row[]; onAdd: () => void; onOpen: (r: Row) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const Icon = PERIOD_ICON[period];
  return (
    <div ref={setNodeRef} className={cn("rounded-2xl bg-porcelana/70 p-2.5 transition", isOver && "bg-mar-100 ring-2 ring-mar/40")}>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-noche-500"><Icon size={14} />{period}</p>
        <button onClick={onAdd} className="rounded-full p-1 text-noche-500 hover:bg-white" aria-label={`Agregar actividad a la ${period.toLowerCase()}`}><Plus size={16} /></button>
      </div>
      <div className="min-h-[44px] space-y-2">
        {items.map((it) => <Card key={it.id} item={it} onOpen={() => onOpen(it)} />)}
        {!items.length && <p className="px-1 py-2 text-xs text-noche-300">Arrastrá o agregá algo</p>}
      </div>
    </div>
  );
}

export function Itinerary({ trip, onUpdateTrip }: { trip: Trip; onUpdateTrip: (d: Record<string, any>) => Promise<any> }) {
  const col = useCollection("trip_itinerary", { trip_id: trip.id }, { key: "position", asc: true });
  const { toast } = useFeedback();
  const [form, setForm] = useState<{ row?: Row; defaults?: Record<string, any> } | null>(null);
  const [dragging, setDragging] = useState<Row | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  const days = useMemo(() => {
    const fromDates = nightsBetween(trip.start_date, trip.end_date);
    const maxUsed = col.rows.reduce((m, r) => Math.max(m, Number(r.day) || 1), 0);
    return Math.max(trip.itinerary_days || (fromDates !== null ? fromDates + 1 : 3), maxUsed, 1);
  }, [trip, col.rows]);

  const dayLabel = (n: number) => {
    const s = parseDate(trip.start_date);
    if (!s) return "";
    const d = new Date(s); d.setDate(d.getDate() + n - 1);
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "short" });
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setDragging(null);
    if (!e.over) return;
    const [day, period] = String(e.over.id).split("|");
    const item = col.rows.find((r) => r.id === e.active.id);
    if (!item || (String(item.day) === day && item.period === period)) return;
    const position = col.rows.filter((r) => String(r.day) === day && r.period === period).length + 1;
    try { await col.update(item.id, { day: Number(day), period, position }); toast("Actividad movida."); }
    catch (err) { toast(errorMessage(err), "error"); col.reload(); }
  };

  if (col.loading) return <Spinner />;
  return (
    <div>
      <p className="mb-4 text-sm text-gris">Mantené apretada una actividad y arrastrala a otro momento o día.</p>
      <DndContext sensors={sensors} onDragStart={(e) => setDragging(col.rows.find((r) => r.id === e.active.id) || null)} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
        <div className="space-y-4">
          {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
            <section key={day} className="card p-3 sm:p-4">
              <h3 className="mb-3 flex items-baseline gap-2 px-1">
                <span className="font-display text-2xl text-noche">Día {day}</span>
                <span className="text-sm capitalize text-gris">{dayLabel(day)}</span>
              </h3>
              <div className="grid gap-2.5 md:grid-cols-3">
                {PERIODS.map((p) => (
                  <Slot key={p} id={`${day}|${p}`} period={p}
                    items={col.rows.filter((r) => Number(r.day) === day && r.period === p)}
                    onAdd={() => setForm({ defaults: { day, period: p } })}
                    onOpen={(row) => setForm({ row })} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <DragOverlay>{dragging ? <Card item={dragging} overlay /> : null}</DragOverlay>
      </DndContext>
      <Button variant="secondary" className="mt-4 w-full" onClick={() => onUpdateTrip({ itinerary_days: days + 1 })}><CalendarPlus size={16} />Agregar un día</Button>

      <ResourceForm open={!!form} onClose={() => setForm(null)} title={form?.row ? "Editar actividad" : "Nueva actividad"}
        fields={itineraryFields}
        initial={form?.row || initialValues(itineraryFields, form?.defaults)}
        onSave={(v) => form?.row ? col.update(form.row.id, v) : col.create({ ...v, position: col.rows.length + 1 })}
        onDelete={form?.row ? () => col.remove(form.row!.id) : undefined} />
    </div>
  );
}
