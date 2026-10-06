"use client";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "@/lib/format";

const PALETTE = ["#1C2340", "#B8893A", "#2C6B6E", "#A2566E", "#4A5480", "#9AA1C0", "#D9B26A", "#6E9C9E", "#C98A9C", "#7A7F99"];

export function CategoryBars({ data, currency }: { data: { name: string; value: number }[]; currency: string }) {
  const rows = data.filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  if (!rows.length) return <p className="py-8 text-center text-sm text-gris">Sin datos todavía.</p>;
  return (
    <div style={{ height: Math.max(140, rows.length * 38) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 12, fill: "#4A5480" }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "#F2F3F6" }} formatter={(v: any) => money(Number(v), currency)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px -12px rgba(28,35,64,.3)" }} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
            {rows.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barra apilada simple: quién aportó cuánto. */
export function SplitBar({ parts, currency }: { parts: { name: string; value: number; color: string }[]; currency: string }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-noche-100">
        {total > 0 && parts.map((p) => <div key={p.name} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />)}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {parts.map((p) => (
          <div key={p.name}>
            <p className="flex items-center gap-1.5 text-xs text-gris"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}</p>
            <p className="font-display text-lg tabular-nums text-noche">{money(p.value, currency)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
