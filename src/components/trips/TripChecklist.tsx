"use client";
import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useFeedback } from "@/components/ui/Feedback";
import { Progress, Spinner, Badge } from "@/components/ui/Bits";
import { ResourceForm } from "@/components/crud/ResourceForm";
import { inputCls } from "@/components/crud/FieldInput";
import { Button } from "@/components/ui/Button";
import { tripTaskFields } from "@/config/trip-resources";
import { errorMessage } from "@/services/db";
import { cn, pct } from "@/lib/format";
import type { Row } from "@/types";

export function TripChecklist({ tripId }: { tripId: string }) {
  const col = useCollection("trip_tasks", { trip_id: tripId }, { key: "position", asc: true });
  const { toast, confirm } = useFeedback();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const done = col.rows.filter((t) => t.done).length;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await col.create({ title: text.trim(), position: col.rows.length + 1 });
      setText("");
      toast("Tarea agregada.");
    } catch (err) { toast(errorMessage(err), "error"); }
  };
  const toggle = async (t: Row) => {
    try { await col.update(t.id, { done: !t.done }); } catch (err) { toast(errorMessage(err), "error"); col.reload(); }
  };
  const del = async (t: Row) => {
    if (!(await confirm({ title: "¿Eliminar tarea?", text: t.title }))) return;
    try { await col.remove(t.id); toast("Eliminada."); } catch (err) { toast(errorMessage(err), "error"); }
  };

  if (col.loading) return <Spinner />;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card mb-4 p-4">
        <div className="flex items-baseline justify-between"><p className="font-display text-2xl text-noche">Listos para viajar</p><p className="text-sm tabular-nums text-gris">{done} de {col.rows.length}</p></div>
        <Progress value={pct(done, col.rows.length)} tone="mar" className="mt-3" />
      </div>
      <form onSubmit={add} className="mb-4 flex gap-2">
        <input className={inputCls} placeholder="Nueva tarea…" value={text} onChange={(e) => setText(e.target.value)} aria-label="Nueva tarea" />
        <Button type="submit"><Plus size={18} /></Button>
      </form>
      <ul className="card divide-y divide-noche-100 overflow-hidden">
        {col.rows.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => toggle(t)} aria-label={t.done ? "Marcar pendiente" : "Marcar hecha"}
              className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition", t.done ? "border-mar bg-mar text-white" : "border-noche-300")}>
              {t.done && <Check size={14} strokeWidth={3} />}
            </button>
            <button className="flex-1 text-left" onClick={() => setEditing(t)}>
              <span className={cn("text-[15px]", t.done && "text-gris line-through")}>{t.title}</span>
              {t.assignee && <Badge className="ml-2">{t.assignee}</Badge>}
              {t.notes && <span className="block text-xs text-gris">{t.notes}</span>}
            </button>
            <button onClick={() => del(t)} className="p-1 text-noche-300 hover:text-malva" aria-label="Eliminar"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
      <ResourceForm open={!!editing} onClose={() => setEditing(null)} title="Editar tarea" fields={tripTaskFields} initial={editing || {}}
        onSave={(v) => col.update(editing!.id, v)} onDelete={() => col.remove(editing!.id)} />
    </div>
  );
}
