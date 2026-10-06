"use client";
import { Pencil } from "lucide-react";
import { StoredImage } from "@/components/ui/Bits";
import { daysUntil, fmtDate } from "@/lib/format";
import { site } from "@/config/site";
import type { Wedding } from "@/types";

export function WeddingHeader({ wedding, onEdit }: { wedding: Wedding; onEdit: () => void }) {
  const d = daysUntil(wedding.date);
  return (
    <header className="relative h-[52dvh] min-h-[340px] overflow-hidden md:h-[440px]">
      <StoredImage src={wedding.cover_url || site.photos.casamiento} alt="Lucas y Cande" className="h-full w-full object-[50%_30%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/30 to-transparent" />
      <button onClick={onEdit} className="absolute right-4 top-[max(env(safe-area-inset-top),16px)] flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-noche shadow md:top-4">
        <Pencil size={15} />Datos del casamiento
      </button>
      <div className="container-app absolute inset-x-0 bottom-0 pb-8 text-white">
        <h1 className="font-display text-5xl font-light leading-none sm:text-6xl">Nuestro casamiento</h1>
        <p className="mt-2 text-white/85">
          {wedding.date ? fmtDate(wedding.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Fecha a definir"}
          {wedding.ceremony_place ? ` · ${wedding.ceremony_place}` : ""}
        </p>
        {d !== null && d > 0 && (
          <p className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-6xl font-light tabular-nums leading-none text-[#D9B26A]">{d}</span>
            <span className="text-white/85">{d === 1 ? "día" : "días"} ❤️ · Un paso más cerca del gran día.</span>
          </p>
        )}
        {d === 0 && <p className="mt-4 font-display text-4xl text-[#D9B26A]">¡Hoy es el gran día!</p>}
      </div>
    </header>
  );
}
