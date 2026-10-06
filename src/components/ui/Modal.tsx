"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/format";

export function Modal({ open, onClose, title, children, size = "md", footer }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
  size?: "sm" | "md" | "lg"; footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fade-in absolute inset-0 bg-noche/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn(
        "sheet-in relative flex max-h-[92dvh] w-full flex-col rounded-t-[1.75rem] bg-white shadow-flotante sm:rounded-[1.5rem]",
        size === "sm" && "sm:max-w-sm", size === "md" && "sm:max-w-lg", size === "lg" && "sm:max-w-3xl")}>
        <div className="flex items-center justify-between gap-3 border-b border-noche-100 px-5 py-4">
          <h2 className="font-display text-2xl leading-tight text-noche">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gris hover:bg-porcelana" aria-label="Cerrar"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-noche-100 px-5 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">{footer}</div>}
      </div>
    </div>
  );
}
