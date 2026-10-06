"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, CalendarDays, ChevronDown, Wand2 } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useApp } from "@/hooks/useApp";
import { useFeedback } from "@/components/ui/Feedback";
import { Badge, Progress, Spinner } from "@/components/ui/Bits";
import { Button } from "@/components/ui/Button";
import { ResourceForm, initialValues } from "@/components/crud/ResourceForm";
import { inputCls } from "@/components/crud/FieldInput";
import { weddingTaskFields, PHASES, DEFAULT_WEDDING_TASKS, TASK_STATUS } from "@/config/wedding-resources";
import { insertMany, updateRow, errorMessage } from "@/services/db";
import { cn, daysUntil, fmtDate, pct } from "@/lib/format";
import type { Row } from "@/types";

const STATUS_STYLE: Record<string, string> = {
  Pendiente: "border-noche-300 bg-white text-noche-500",
  "En proceso": "border-vela bg-vela-100 text-vela-600",
  Realizado: "border-mar bg-mar text-white",
};

export async function seedWeddingTasks(coupleId: string) {
  let pos = 0;
  const rows = Object.entries(DEFAULT_WEDDING_TASKS).flatMap(([phase, titles]) =>
    titles.map((title) => ({ title, phase, status: "Pendiente", position: ++pos, couple_id: coupleId })));
  await insertMany("wedding_tasks", rows);
}

export function WeddingChecklist() {
  const { couple, wedding, setWedding } = useApp();
  const col = useCollection("wedding_tasks", {}, { key: "position", asc: true });
  const { toast } = useFeedback();
  const [form, setForm] = useState<{ row?: Row; defaults?: Record<string, any> } | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [who, setWho] = useState<string>("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const seeding = useRef(false);

  // Genera la checklist orientativa la primera vez
  useEffect(() => {
    if (col.loading || !couple || !wedding || wedding.checklist_seeded || seeding.current) return;
    seeding.current = true;
    (async () => {
      try {
        if (col.rows.length === 0) await seedWeddingTasks(couple.id);
        const w = await updateRow("wedding", wedding.id, { checklist_seeded: true });
        setWedding(w as any);
        await col.reload();
      } catch (e) { toast(errorMessage(e), "error"); }
    })();
  }, [col.loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = col.rows.filter((t) => t.status === "Realizado").length;
  const progress = pct(done, col.rows.length);

  const visible = useMemo(() => col.rows.filter((t) => (!filter || t.status === filter) && (!who || t.assignee === who)), [col.rows, filter, who]);

  const cycle = async (t: Row) => {
    const next = TASK_STATUS[(TASK_STATUS.indexOf(t.status) + 1) % TASK_STATUS.length];
    try { await col.update(t.id, { status: next }); if (next === "Realizado") toast("¡Una menos! ✓"); }
    catch (e) { toast(errorMessage(e), "error"); col.reload(); }
  };

  const restore = async () => {
    if (!couple) return;
    const existing = new Set(col.rows.map((r) => r.title));
    let pos = col.rows.length;
    const missing = Object.entries(DEFAULT_WEDDING_TASKS).flatMap(([phase, titles]) =>
      titles.filter((t) => !existing.has(t)).map((title) => ({ title, phase, status: "Pendiente", position: ++pos, couple_id: couple.id })));
    if (!missing.length) return toast("La checklist sugerida ya está completa.");
    try { await insertMany("wedding_tasks", missing); await col.reload(); toast(`Se agregaron ${missing.length} tareas sugeridas.`); }
    catch (e) { toast(errorMessage(e), "error"); }
  };

  if (col.loading) return <Spinner />;
  const phases = [...PHASES, ...Array.from(new Set<string>(col.rows.map((r) => String(r.phase || "")))).filter((p) => !PHASES.includes(p))];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card mb-4 p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gris">Organización completada</p>
            <p className="font-display text-5xl font-light tabular-nums text-noche">{progress}%</p>
          </div>
          <p className="text-right text-sm text-gris">{done} de {col.rows.length} tareas<br />{col.rows.filter((t) => t.status === "En proceso").length} en proceso</p>
        </div>
        <Progress value={progress} tone="vela" className="mt-3" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select className={cn(inputCls, "w-auto py-2")} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>{TASK_STATUS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={cn(inputCls, "w-auto py-2")} value={who} onChange={(e) => setWho(e.target.value)} aria-label="Filtrar por responsable">
          <option value="">Todos</option><option>Lucas</option><option>Cande</option><option>Ambos</option>
        </select>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={restore}><Wand2 size={15} />Restaurar sugeridas</Button>
        <Button size="sm" onClick={() => setForm({ defaults: {} })}><Plus size={16} />Nueva tarea</Button>
      </div>

      <div className="space-y-3">
        {phases.map((phase) => {
          const all = col.rows.filter((t) => t.phase === phase);
          const items = visible.filter((t) => t.phase === phase);
          if (!all.length) return null;
          const pd = all.filter((t) => t.status === "Realizado").length;
          const isCol = collapsed[phase];
          return (
            <section key={phase} className="card overflow-hidden">
              <button onClick={() => setCollapsed((c) => ({ ...c, [phase]: !c[phase] }))} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                <span className="flex-1">
                  <span className="block font-medium text-noche">{phase}</span>
                  <span className="text-xs text-gris">{pd} de {all.length}</span>
                </span>
                <Progress value={pct(pd, all.length)} tone="vela" className="w-20" />
                <ChevronDown size={18} className={cn("text-noche-300 transition", isCol && "-rotate-90")} />
              </button>
              {!isCol && (
                <ul className="divide-y divide-noche-100 border-t border-noche-100">
                  {items.map((t) => {
                    const due = daysUntil(t.due_date);
                    return (
                      <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                        <button onClick={() => cycle(t)} title="Cambiar estado"
                          className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition", STATUS_STYLE[t.status] || STATUS_STYLE.Pendiente)}>
                          {t.status === "Realizado" ? "✓ Hecho" : t.status}
                        </button>
                        <button className="min-w-0 flex-1 text-left" onClick={() => setForm({ row: t })}>
                          <span className={cn("block text-[15px]", t.status === "Realizado" && "text-gris line-through")}>{t.title}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            {t.assignee && <Badge tone={t.assignee === "Cande" ? "rose" : t.assignee === "Lucas" ? "info" : "neutral"}>{t.assignee}</Badge>}
                            {t.due_date && <Badge tone={due !== null && due < 0 && t.status !== "Realizado" ? "bad" : "neutral"}><CalendarDays size={11} />{fmtDate(t.due_date)}</Badge>}
                            {t.notes && <span className="truncate text-xs text-gris">{t.notes}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {!items.length && <li className="px-4 py-3 text-sm text-gris">Nada con estos filtros.</li>}
                  <li><button onClick={() => setForm({ defaults: { phase } })} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-noche-500 hover:bg-porcelana"><Plus size={15} />Agregar a esta etapa</button></li>
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <ResourceForm open={!!form} onClose={() => setForm(null)} title={form?.row ? "Editar tarea" : "Nueva tarea"} fields={weddingTaskFields}
        initial={form?.row || initialValues(weddingTaskFields, form?.defaults)}
        onSave={(v) => form?.row ? col.update(form.row.id, v) : col.create({ ...v, position: col.rows.length + 1 })}
        onDelete={form?.row ? () => col.remove(form.row!.id) : undefined} />
    </div>
  );
}
