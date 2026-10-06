"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

type ToastT = { id: number; text: string; kind: "ok" | "error" };
interface FeedbackCtx {
  toast: (text: string, kind?: "ok" | "error") => void;
  confirm: (opts: { title: string; text?: string; action?: string }) => Promise<boolean>;
}
const Ctx = createContext<FeedbackCtx | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const [dlg, setDlg] = useState<{ title: string; text?: string; action?: string } | null>(null);
  const resolver = useRef<(v: boolean) => void>();

  const toast = useCallback((text: string, kind: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 5000 : 2600);
  }, []);

  const confirm = useCallback((opts: { title: string; text?: string; action?: string }) => {
    setDlg(opts);
    return new Promise<boolean>((res) => { resolver.current = res; });
  }, []);

  const close = (v: boolean) => { resolver.current?.(v); setDlg(null); };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),12px)] z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div key={t.id} role="status"
            className={`toast-in pointer-events-auto flex max-w-sm items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-flotante ${
              t.kind === "ok" ? "bg-noche text-white" : "bg-malva text-white"}`}>
            {t.kind === "ok" ? <Check size={16} /> : <AlertCircle size={16} />}
            {t.text}
          </div>
        ))}
      </div>
      <Modal open={!!dlg} onClose={() => close(false)} title={dlg?.title || ""} size="sm">
        {dlg?.text && <p className="text-gris">{dlg.text}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => close(false)}>Cancelar</Button>
          <Button variant="danger" onClick={() => close(true)}>{dlg?.action || "Eliminar"}</Button>
        </div>
      </Modal>
    </Ctx.Provider>
  );
}

export function useFeedback() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFeedback fuera de FeedbackProvider");
  return c;
}
