"use client";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { ResourceManager } from "@/components/crud/ResourceManager";
import { Stat, Progress } from "@/components/ui/Bits";
import { CategoryBars, SplitBar } from "@/components/ui/Charts";
import { tripExpenses, EXPENSE_CATEGORIES } from "@/config/trip-resources";
import { inTripCurrency, money, pct } from "@/lib/format";
import type { Trip, Row } from "@/types";

export function useTripTotals(rows: Row[], trip?: Trip | null) {
  return useMemo(() => {
    const cur = trip?.currency || "USD";
    let spent = 0, pending = 0, unconverted = 0;
    const byCat: Record<string, number> = {};
    const byPerson: Record<string, number> = { Lucas: 0, Cande: 0, Compartido: 0 };
    for (const e of rows) {
      const { value, converted } = inTripCurrency(e, cur);
      if (!converted) { unconverted++; continue; }
      if (e.status === "Pendiente") pending += value; else spent += value;
      byCat[e.category || "Otros"] = (byCat[e.category || "Otros"] || 0) + value;
      byPerson[e.paid_by || "Compartido"] = (byPerson[e.paid_by || "Compartido"] || 0) + value;
    }
    return { cur, spent, pending, unconverted, byCat, byPerson, total: spent + pending };
  }, [rows, trip?.currency]);
}

export function TripExpenses({ trip, col }: { trip: Trip; col: any }) {
  const t = useTripTotals(col.rows, trip);
  const budget = Number(trip.budget || 0);
  const used = pct(t.total, budget);

  const header = (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Presupuesto total" value={money(budget, t.cur)} />
        <Stat label="Total gastado" value={money(t.spent, t.cur)} accent="vela" hint={t.pending ? `+ ${money(t.pending, t.cur)} pendiente` : undefined} />
        <Stat label="Saldo disponible" value={money(budget - t.total, t.cur)} accent={budget - t.total < 0 ? "malva" : "mar"} />
        <Stat label="Presupuesto usado" value={`${used}%`} hint={<Progress value={used} tone="mar" className="mt-1" />} />
      </div>
      {t.unconverted > 0 && (
        <p className="flex items-center gap-2 rounded-xl bg-vela-100 px-3 py-2 text-sm text-vela-600">
          <AlertTriangle size={16} /> {t.unconverted} gasto(s) en otra moneda sin tipo de cambio: no se suman al total. Editalos y cargá el tipo de cambio.
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <p className="mb-2 font-medium text-noche">Gastos por categoría</p>
          <CategoryBars currency={t.cur} data={EXPENSE_CATEGORIES.map((c) => ({ name: c, value: t.byCat[c] || 0 }))} />
        </div>
        <div className="card p-4">
          <p className="mb-4 font-medium text-noche">¿Quién pagó?</p>
          <SplitBar currency={t.cur} parts={[
            { name: "Lucas", value: t.byPerson.Lucas || 0, color: "#1C2340" },
            { name: "Cande", value: t.byPerson.Cande || 0, color: "#A2566E" },
            { name: "Compartido", value: t.byPerson.Compartido || 0, color: "#B8893A" },
          ]} />
          {(() => {
            const diff = (t.byPerson.Lucas || 0) - (t.byPerson.Cande || 0);
            if (Math.abs(diff) < 0.01) return null;
            return <p className="mt-4 rounded-xl bg-porcelana px-3 py-2 text-sm text-noche-700">
              Para quedar a mano, {diff > 0 ? "Cande" : "Lucas"} le debe {money(Math.abs(diff) / 2, t.cur)} a {diff > 0 ? "Lucas" : "Cande"}.
            </p>;
          })()}
        </div>
      </div>
    </div>
  );

  return <ResourceManager config={tripExpenses} col={col} currency={t.cur} header={header}
    defaults={{ currency: t.cur, paid_by: "Compartido", status: "Pagado" }} addLabel="Agregar gasto" />;
}
