"use client";
import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/format";
import { resolveUrl } from "@/services/storage";
import type { Tone } from "@/types";

export function StoredImage({ src, alt, className, fallback }: { src?: string | null; alt: string; className?: string; fallback?: string }) {
  const [url, setUrl] = useState<string>("");
  const [err, setErr] = useState(false);
  useEffect(() => {
    let alive = true;
    setErr(false);
    resolveUrl(src || fallback).then((u) => alive && setUrl(u));
    return () => { alive = false; };
  }, [src, fallback]);
  if (!url || err) {
    return <div className={cn("flex items-center justify-center bg-noche-100 text-noche-300", className)}><ImageOff size={22} /></div>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={cn("object-cover", className)} onError={() => fallback && url !== fallback ? setUrl(fallback) : setErr(true)} loading="lazy" />;
}

const toneCls: Record<Tone, string> = {
  neutral: "bg-noche-100 text-noche-700",
  ok: "bg-mar-100 text-mar-600",
  warn: "bg-vela-100 text-vela-600",
  bad: "bg-malva-100 text-malva",
  info: "bg-[#E3EAF7] text-[#2F4A85]",
  gold: "bg-vela text-white",
  rose: "bg-malva text-white",
};
export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", toneCls[tone], className)}>{children}</span>;
}

export function Progress({ value, tone = "noche", className }: { value: number; tone?: "noche" | "vela" | "mar" | "malva"; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const bar = { noche: "bg-noche", vela: "bg-vela", mar: "bg-mar", malva: "bg-malva" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-noche-100", className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all duration-700", value > 100 ? "bg-malva" : bar)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: "vela" | "mar" | "malva" }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-suave">
      <p className="text-[13px] text-gris">{label}</p>
      <p className={cn("mt-1 font-display text-[1.65rem] leading-none tabular-nums",
        accent === "vela" ? "text-vela-600" : accent === "mar" ? "text-mar" : accent === "malva" ? "text-malva" : "text-noche")}>{value}</p>
      {hint && <p className="mt-1.5 text-xs text-gris">{hint}</p>}
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-noche-300/60 px-6 py-12 text-center">
      <p className="font-display text-2xl text-noche">{title}</p>
      {text && <p className="mt-2 max-w-xs text-sm text-gris">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-gris">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-noche-100 border-t-noche" />
      {label}
    </div>
  );
}

export function SectionTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-[1.75rem] leading-tight text-noche">{title}</h2>
        {text && <p className="mt-0.5 text-sm text-gris">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  useEffect(() => {
    document.getElementById(`tab-${active}`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);
  return (
    <nav className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={active === t.id} onClick={() => onChange(t.id)}
          className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
            active === t.id ? "bg-noche text-white" : "bg-white text-noche-500 shadow-suave hover:text-noche")}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
