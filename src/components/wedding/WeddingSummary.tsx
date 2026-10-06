"use client";
import { Bell, CheckCircle2, Users, Briefcase } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { Badge, Progress, Stat } from "@/components/ui/Bits";
import { useWeddingTotals, guestTotals } from "./useWeddingTotals";
import { daysUntil, fmtDate, money, pct } from "@/lib/format";
import type { Wedding } from "@/types";

export function WeddingSummary({ wedding, expenses, go }: { wedding: Wedding; expenses: any; go: (t: string) => void }) {
  const tasks = useCollection("wedding_tasks", {}, { key: "position", asc: true });
  const guests = useCollection("wedding_guests");
  const suppliers = useCollection("wedding_suppliers");
  const reminders = useCollection("wedding_reminders", {}, { key: "due_date", asc: true });
  const t = useWeddingTotals(expenses.rows, wedding);
  const g = guestTotals(guests.rows);
  const done = tasks.rows.filter((x) => x.status === "Realizado").length;
  const hired = suppliers.rows.filter((s) => s.status === "Contratado");
  const next = reminders.rows.filter((r) => !r.done).slice(0, 5);
  const nextTasks = tasks.rows.filter((x) => x.status !== "Realizado").slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Presupuesto" value={money(t.budget, t.cur)} />
        <Stat label="Gastado" value={money(t.total, t.cur)} accent="vela" hint={`${pct(t.total, t.budget)}% usado`} />
        <Stat label="Saldo" value={money(t.available, t.cur)} accent={t.available < 0 ? "malva" : "mar"} />
        <Stat label="Tareas completadas" value={`${pct(done, tasks.rows.length)}%`} hint={`${done} de ${tasks.rows.length}`} />
        <Stat label="Invitados" value={g.total} hint={`${g.confirmed} confirmados`} />
        <Stat label="Proveedores contratados" value={hired.length} hint={`de ${suppliers.rows.length} cargados`} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button onClick={() => go("recordatorios")} className="card p-4 text-left">
          <p className="mb-3 flex items-center gap-2 font-medium text-noche"><Bell size={18} />Para recordar</p>
          {next.length ? <ul className="space-y-2">{next.map((r) => {
            const d = daysUntil(r.due_date);
            return <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{r.title} {r.assignee && <Badge>{r.assignee}</Badge>}</span>
              {r.due_date && <span className={d !== null && d < 0 ? "text-malva" : "text-gris"}>{fmtDate(r.due_date, { day: "numeric", month: "short" })}</span>}
            </li>;
          })}</ul> : <p className="text-sm text-gris">Sin pendientes. Agregá recordatorios con el botón +.</p>}
        </button>
        <button onClick={() => go("checklist")} className="card p-4 text-left">
          <p className="mb-3 flex items-center gap-2 font-medium text-noche"><CheckCircle2 size={18} />Próximas tareas</p>
          <Progress value={pct(done, tasks.rows.length)} tone="vela" className="mb-3" />
          <ul className="space-y-1.5 text-sm">{nextTasks.map((x) => <li key={x.id} className="flex justify-between gap-2"><span>○ {x.title}</span><span className="shrink-0 text-xs text-gris">{x.phase}</span></li>)}</ul>
        </button>
        <button onClick={() => go("invitados")} className="card p-4 text-left">
          <p className="mb-3 flex items-center gap-2 font-medium text-noche"><Users size={18} />Invitados</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="font-display text-3xl text-mar">{g.confirmed}</p><p className="text-xs text-gris">Confirmados</p></div>
            <div><p className="font-display text-3xl text-vela-600">{g.pending}</p><p className="text-xs text-gris">Pendientes</p></div>
            <div><p className="font-display text-3xl text-malva">{g.declined}</p><p className="text-xs text-gris">No asisten</p></div>
          </div>
        </button>
        <button onClick={() => go("proveedores")} className="card p-4 text-left">
          <p className="mb-3 flex items-center gap-2 font-medium text-noche"><Briefcase size={18} />Contratados</p>
          {hired.length ? <div className="flex flex-wrap gap-1.5">{hired.map((s) => <Badge key={s.id} tone="ok">{s.category}: {s.name}</Badge>)}</div>
            : <p className="text-sm text-gris">Cuando marquen un proveedor como “Contratado” aparece acá.</p>}
        </button>
      </div>
    </div>
  );
}
