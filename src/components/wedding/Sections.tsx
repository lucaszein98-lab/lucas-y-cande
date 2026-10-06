"use client";
import { useMemo, useState } from "react";
import { Check, Scale, Users } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useFeedback } from "@/components/ui/Feedback";
import { ResourceManager } from "@/components/crud/ResourceManager";
import { Badge, Progress, Stat } from "@/components/ui/Bits";
import { CategoryBars } from "@/components/ui/Charts";
import { quotes, weddingExpenses, guests, reminders, weddingPlaces, WEDDING_CATEGORIES } from "@/config/wedding-resources";
import { useWeddingTotals, guestTotals } from "./useWeddingTotals";
import { cn, daysUntil, money, pct } from "@/lib/format";
import { errorMessage } from "@/services/db";
import type { Row, Wedding, ResourceConfig } from "@/types";

/** Cualquier pestaña simple del casamiento */
export function WeddingSection({ config, currency }: { config: ResourceConfig; currency: string }) {
  const col = useCollection(config.table);
  return <ResourceManager config={config} col={col} currency={currency} />;
}

export function WeddingPlacesTab({ currency }: { currency: string }) {
  const col = useCollection("wedding_places");
  return <ResourceManager config={weddingPlaces} col={col} currency={currency}
    renderExtra={(r) => r.capacity ? <p className="mt-2 flex items-center gap-1.5 text-sm text-noche-700"><Users size={14} />Hasta {r.capacity} personas</p> : null} />;
}

export function QuotesTab({ currency }: { currency: string }) {
  const col = useCollection("wedding_budget");
  const [compare, setCompare] = useState(true);
  const groups = useMemo(() => {
    const m: Record<string, Row[]> = {};
    col.rows.filter((q) => q.status !== "Descartado" && q.price != null).forEach((q) => { (m[q.category || "Otros"] ||= []).push(q); });
    return Object.entries(m).filter(([, l]) => l.length >= 2).map(([cat, l]) => ({ cat, list: l.sort((a, b) => a.price - b.price) }));
  }, [col.rows]);

  const header = groups.length ? (
    <div className="mb-5">
      <button onClick={() => setCompare((c) => !c)} className={cn("chip", compare && "!bg-noche !text-white")}><Scale size={14} />Comparar por rubro</button>
      {compare && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {groups.map(({ cat, list }) => {
            const max = Math.max(...list.map((q) => Number(q.price)));
            return (
              <div key={cat} className="card p-4">
                <p className="mb-3 font-display text-xl text-noche">{cat}</p>
                <ul className="space-y-2.5">
                  {list.map((q, i) => (
                    <li key={q.id}>
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{q.supplier} {q.status === "Elegido" && <Badge tone="ok"><Check size={11} />Elegido</Badge>}</span>
                        <span className="tabular-nums">{money(q.price, currency)}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-noche-100"><div className={cn("h-full rounded-full", i === 0 ? "bg-mar" : "bg-noche-300")} style={{ width: `${(q.price / max) * 100}%` }} /></div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-gris">Diferencia entre el más caro y el más barato: {money(max - list[0].price, currency)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  ) : null;

  return <ResourceManager config={quotes} col={col} currency={currency} header={header} groupOrder={WEDDING_CATEGORIES} />;
}

export function WeddingExpensesTab({ wedding, col }: { wedding: Wedding; col: any }) {
  const t = useWeddingTotals(col.rows, wedding);
  const header = (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Presupuesto total" value={money(t.budget, t.cur)} />
        <Stat label="Gastado (comprometido)" value={money(t.total, t.cur)} accent="vela" hint={`${pct(t.total, t.budget)}% del presupuesto`} />
        <Stat label="Pagado" value={money(t.paid, t.cur)} accent="mar" />
        <Stat label="Pendiente de pago" value={money(t.pending, t.cur)} accent={t.pending > 0 ? "malva" : undefined} />
        <Stat label="Saldo disponible" value={money(t.available, t.cur)} accent={t.available < 0 ? "malva" : "mar"} />
      </div>
      <div className="card p-4">
        <p className="mb-2 font-medium text-noche">Gastos por categoría</p>
        <CategoryBars currency={t.cur} data={WEDDING_CATEGORIES.map((c) => ({ name: c, value: t.byCat[c] || 0 }))} />
      </div>
    </div>
  );
  return <ResourceManager config={weddingExpenses} col={col} currency={t.cur} header={header} addLabel="Agregar gasto"
    renderExtra={(r) => {
      const p = pct(Number(r.paid || 0), Number(r.total || 0));
      return (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gris"><span>Pagado {money(r.paid, t.cur)}</span><span>Falta {money(Number(r.total || 0) - Number(r.paid || 0), t.cur)}</span></div>
          <Progress value={p} tone="mar" className="mt-1" />
        </div>
      );
    }} />;
}

export function GuestsTab({ wedding }: { wedding: Wedding }) {
  const col = useCollection("wedding_guests", {}, { key: "first_name", asc: true });
  const g = guestTotals(col.rows);
  const header = (
    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Total invitados" value={g.total} hint={wedding.estimated_guests ? `Estimado: ${wedding.estimated_guests}` : undefined} />
      <Stat label="Confirmados" value={g.confirmed} accent="mar" hint={<Progress value={pct(g.confirmed, g.total)} tone="mar" className="mt-1" />} />
      <Stat label="Pendientes" value={g.pending} accent="vela" />
      <Stat label="No asisten" value={g.declined} accent="malva" />
    </div>
  );
  return <ResourceManager config={guests} col={col} header={header}
    renderExtra={(r) => Number(r.party_size) > 1 ? <p className="mt-1.5 text-xs text-gris">{r.party_size} personas</p> : null} />;
}

export function RemindersTab() {
  const col = useCollection("wedding_reminders", {}, { key: "due_date", asc: true });
  const { toast } = useFeedback();
  const toggle = async (r: Row) => {
    try { await col.update(r.id, { done: !r.done }); if (!r.done) toast("Hecho ✓"); } catch (e) { toast(errorMessage(e), "error"); col.reload(); }
  };
  return <ResourceManager config={reminders} col={col}
    renderExtra={(r) => {
      const d = daysUntil(r.due_date);
      return (
        <div className="mt-2 flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); toggle(r); }}
            className={cn("chip", r.done && "!bg-mar !text-white")}><Check size={13} />{r.done ? "Hecho" : "Marcar hecho"}</button>
          {!r.done && d !== null && <span className={cn("text-xs", d < 0 ? "text-malva" : d <= 7 ? "text-vela-600" : "text-gris")}>
            {d < 0 ? `Venció hace ${-d} días` : d === 0 ? "Vence hoy" : `En ${d} días`}</span>}
        </div>
      );
    }} />;
}
