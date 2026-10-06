"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Bell } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useCollection } from "@/hooks/useCollection";
import { Names } from "@/components/layout/Names";
import { Badge, StoredImage } from "@/components/ui/Bits";
import { useWeddingTotals, guestTotals } from "@/components/wedding/useWeddingTotals";
import { countdownText, daysUntil, fmtDate, inTripCurrency, money, pct } from "@/lib/format";
import { site } from "@/config/site";
import type { Trip } from "@/types";

export default function Inicio() {
  const { couple, wedding } = useApp();
  const trips = useCollection<Trip>("trips", {}, { key: "start_date", asc: true });
  const tripExpenses = useCollection("trip_expenses");
  const wExpenses = useCollection("wedding_expenses");
  const tasks = useCollection("wedding_tasks");
  const guests = useCollection("wedding_guests");
  const reminders = useCollection("wedding_reminders", {}, { key: "due_date", asc: true });

  const nextTrip = useMemo(() => trips.rows.find((t) => { const d = daysUntil(t.start_date); return d !== null && d >= 0; })
    || trips.rows.find((t) => !t.start_date), [trips.rows]);
  const tripSpent = useMemo(() => nextTrip ? tripExpenses.rows.filter((e) => e.trip_id === nextTrip.id)
    .reduce((s, e) => s + inTripCurrency(e, nextTrip.currency).value, 0) : 0, [nextTrip, tripExpenses.rows]);
  const w = useWeddingTotals(wExpenses.rows, wedding);
  const g = guestTotals(guests.rows);
  const done = tasks.rows.filter((t) => t.status === "Realizado").length;
  const upcomingReminders = reminders.rows.filter((r) => !r.done && r.due_date).slice(0, 4);

  const moments = [
    ...trips.rows.filter((t) => (daysUntil(t.start_date) ?? -1) >= 0).map((t) => ({ icon: "✈️", label: t.name, date: t.start_date!, href: `/viajes/${t.id}` })),
    ...(wedding?.date && (daysUntil(wedding.date) ?? -1) >= 0 ? [{ icon: "💍", label: "Casamiento", date: wedding.date, href: "/casamiento" }] : []),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  const coupleName = couple?.name || site.name;

  return (
    <div>
      <section className="relative h-[62dvh] min-h-[420px] overflow-hidden md:h-[520px]">
        <StoredImage src={couple?.home_photo || site.photos.home} alt="Lucas y Cande" className="h-full w-full object-[50%_32%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-porcelana via-noche/25 to-noche/10" />
        <div className="container-app absolute inset-x-0 bottom-0 pb-10">
          <p className="hero-in mb-2 text-sm font-medium text-white drop-shadow">Hola ❤️</p>
          <h1 className="hero-in font-display text-[3.6rem] font-light leading-[0.92] text-noche sm:text-7xl md:text-8xl">
            <Names name={coupleName} />
          </h1>
          <p className="hero-in-2 mt-3 max-w-md text-noche-700">{couple?.subtitle || site.subtitle}</p>
        </div>
      </section>

      <div className="container-app -mt-2 space-y-8 pb-6">
        {moments.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-2xl text-noche">Próximos momentos</h2>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {moments.map((m) => (
                <Link key={m.href + m.date} href={m.href} className="card min-w-[200px] flex-1 p-4">
                  <p className="text-sm text-gris">{m.icon} {m.label}</p>
                  <p className="mt-1 font-display text-3xl tabular-nums text-noche">{countdownText(m.date).replace("Faltan ", "")}</p>
                  <p className="text-xs text-gris">{fmtDate(m.date)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <Link href="/viajes" className="group relative block overflow-hidden rounded-[1.75rem] bg-noche text-white shadow-suave">
            <StoredImage src={nextTrip?.cover_url} fallback={site.stock.playa} alt="" className="absolute inset-0 h-full w-full opacity-60 transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-mar-600/95 via-mar-600/40 to-transparent" />
            <div className="relative flex min-h-[300px] flex-col justify-end p-6">
              <p className="text-sm text-white/80">✈️ Nuestros viajes</p>
              {nextTrip ? (
                <>
                  <p className="mt-1 font-display text-4xl leading-tight">{nextTrip.emoji} {nextTrip.name}</p>
                  <p className="text-sm text-white/85">Próxima aventura · {countdownText(nextTrip.start_date)}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-white/70">Presupuesto</p><p className="font-semibold tabular-nums">{money(nextTrip.budget, nextTrip.currency || "USD")}</p></div>
                    <div><p className="text-white/70">Gastado</p><p className="font-semibold tabular-nums">{money(tripSpent, nextTrip.currency || "USD")}</p></div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/25"><div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, pct(tripSpent, Number(nextTrip.budget || 0)))}%` }} /></div>
                </>
              ) : <p className="mt-1 font-display text-4xl leading-tight">Planear el próximo destino</p>}
            </div>
          </Link>

          <Link href="/casamiento" className="group relative block overflow-hidden rounded-[1.75rem] bg-noche text-white shadow-suave">
            <StoredImage src={wedding?.cover_url || site.photos.casamiento} alt="" className="absolute inset-0 h-full w-full object-[50%_30%] opacity-70 transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/50 to-transparent" />
            <div className="relative flex min-h-[300px] flex-col justify-end p-6">
              <p className="text-sm text-white/80">💍 Nuestro casamiento</p>
              <p className="mt-1 font-display text-4xl leading-tight">{wedding?.date ? countdownText(wedding.date) : "Elegir la fecha"}</p>
              <p className="text-sm text-white/85">Un paso más cerca del gran día.</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-white/70">Tareas</p><p className="font-semibold tabular-nums">{pct(done, tasks.rows.length)}%</p></div>
                <div><p className="text-white/70">Gastado</p><p className="font-semibold tabular-nums">{money(w.total, w.cur)}</p></div>
                <div><p className="text-white/70">Invitados</p><p className="font-semibold tabular-nums">{g.total || wedding?.estimated_guests || 0}</p></div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/25"><div className="h-full rounded-full bg-[#D9B26A]" style={{ width: `${Math.min(100, pct(w.total, w.budget))}%` }} /></div>
              <p className="mt-1.5 text-xs text-white/70">{money(w.total, w.cur)} de {money(w.budget, w.cur)} presupuestados</p>
            </div>
          </Link>
        </section>

        {upcomingReminders.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-display text-2xl text-noche"><Bell size={20} />Próximos vencimientos</h2>
            <div className="card divide-y divide-noche-100">
              {upcomingReminders.map((r) => {
                const d = daysUntil(r.due_date);
                return (
                  <Link key={r.id} href="/casamiento#recordatorios" className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm">{r.title} {r.assignee && <Badge className="ml-1">{r.assignee}</Badge>}</span>
                    <Badge tone={d !== null && d < 0 ? "bad" : d !== null && d <= 7 ? "warn" : "neutral"}>{d !== null && d < 0 ? "Vencido" : fmtDate(r.due_date, { day: "numeric", month: "short" })}</Badge>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <p className="pt-4 text-center font-display text-xl italic text-noche-300">Nuestra historia continúa…</p>
      </div>
    </div>
  );
}
