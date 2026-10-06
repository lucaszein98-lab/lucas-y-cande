"use client";
import { useState } from "react";
import { Upload, Paperclip, X } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { uploadFile, isStored } from "@/services/storage";
import { StoredImage } from "@/components/ui/Bits";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/format";
import type { FieldDef } from "@/types";

export const inputCls =
  "w-full rounded-xl border border-noche-100 bg-porcelana/60 px-3.5 py-2.5 text-[16px] text-tinta outline-none transition placeholder:text-noche-300 focus:border-noche-300 focus:bg-white focus:ring-2 focus:ring-noche-100 sm:text-sm";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-noche-700">{children}</label>;
}

export function FieldInput({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  const { couple } = useApp();
  const { toast } = useFeedback();
  const [busy, setBusy] = useState(false);
  const id = `f-${field.name}`;

  const onFile = async (f?: File | null) => {
    if (!f || !couple) return;
    if (f.size > 20 * 1024 * 1024) return toast("El archivo supera 20 MB.", "error");
    setBusy(true);
    try {
      const path = await uploadFile(couple.id, field.type === "image" ? "fotos" : "documentos", f);
      onChange(path);
    } catch (e: any) {
      toast(`No se pudo subir: ${e.message}`, "error");
    } finally { setBusy(false); }
  };

  const common = { id, name: field.name, placeholder: field.placeholder, required: field.required };

  switch (field.type) {
    case "textarea":
      return <textarea {...common} rows={4} className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "number":
    case "money":
      return <input {...common} type="number" inputMode="decimal" step="any" className={inputCls}
        value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
    case "date":
      return <input {...common} type="date" className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} />;
    case "time":
      return <input {...common} type="time" className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <select {...common} className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {!field.required && <option value="">—</option>}
          {field.options?.map((o) => <option key={o} value={o}>{field.optionLabels?.[o] ?? o}</option>)}
        </select>
      );
    case "boolean":
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-porcelana/60 px-3.5 py-2.5">
          <input id={id} type="checkbox" className="h-5 w-5 accent-[#1C2340]" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm text-noche-700">{field.placeholder || "Sí"}</span>
        </label>
      );
    case "tags":
      return <input {...common} className={inputCls} placeholder={field.placeholder || "Separadas por coma: romántico, económico"}
        value={Array.isArray(value) ? value.join(", ") : value ?? ""}
        onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />;
    case "image":
    case "file": {
      const isImg = field.type === "image";
      return (
        <div className="space-y-2">
          {value && isImg && (
            <div className="relative overflow-hidden rounded-xl">
              <StoredImage src={value} alt="" className="h-40 w-full" />
              <button type="button" onClick={() => onChange(null)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-noche" aria-label="Quitar"><X size={16} /></button>
            </div>
          )}
          {value && !isImg && (
            <div className="flex items-center justify-between rounded-xl bg-porcelana px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate"><Paperclip size={15} />{isStored(value) ? "Archivo subido" : value}</span>
              <button type="button" onClick={() => onChange(null)} className="text-gris" aria-label="Quitar"><X size={16} /></button>
            </div>
          )}
          <div className="flex gap-2">
            <label className={cn("flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-noche-300 px-3 py-2.5 text-sm text-noche-500 hover:bg-porcelana", busy && "opacity-60")}>
              <Upload size={16} /> {busy ? "Subiendo…" : isImg ? "Subir foto" : "Subir archivo (PDF, imagen)"}
              <input type="file" className="hidden" accept={isImg ? "image/*" : "image/*,application/pdf,.doc,.docx,.xls,.xlsx"} onChange={(e) => onFile(e.target.files?.[0])} disabled={busy} />
            </label>
          </div>
          <input className={inputCls} placeholder={isImg ? "…o pegá el link de una imagen" : "…o pegá un link"} value={value && !isStored(value) ? value : ""}
            onChange={(e) => onChange(e.target.value || null)} />
        </div>
      );
    }
    default:
      return <input {...common} type={field.type === "url" ? "url" : field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
        inputMode={field.type === "tel" ? "tel" : field.type === "url" ? "url" : undefined}
        className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}
