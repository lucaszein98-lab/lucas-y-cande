"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Users } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Bits";
import { Label, inputCls } from "@/components/crud/FieldInput";
import { useFeedback } from "@/components/ui/Feedback";
import { createCouple, joinCouple } from "@/services/couple";
import { errorMessage } from "@/services/db";
import { supabase } from "@/lib/supabase";
import { site } from "@/config/site";
import { cn } from "@/lib/format";

export default function Pareja() {
  const { session, authReady, couple, coupleReady, refreshCouple } = useApp();
  const router = useRouter();
  const { toast } = useFeedback();
  const [tab, setTab] = useState<"crear" | "unirme">("crear");
  const [name, setName] = useState("");
  const [coupleName, setCoupleName] = useState(site.name);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!session) router.replace("/");
    else if (coupleReady && couple) router.replace("/inicio");
  }, [authReady, session, couple, coupleReady, router]);

  useEffect(() => {
    const n = session?.user?.user_metadata?.display_name;
    if (n) setName(n);
  }, [session]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "crear") await createCouple(coupleName, name);
      else await joinCouple(code, name);
      await refreshCouple();
      toast(tab === "crear" ? "Espacio creado ❤️" : "¡Ya están juntos en el mismo espacio!");
      router.replace("/inicio");
    } catch (err) { toast(errorMessage(err), "error"); } finally { setBusy(false); }
  };

  if (!authReady || !coupleReady || !session) return <Spinner />;

  return (
    <main className="flex min-h-dvh items-center justify-center p-5">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl text-noche">Su espacio compartido</h1>
        <p className="mt-2 text-gris">Uno de los dos crea el espacio. El otro se une con el código de 6 letras que aparece en Ajustes.</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-white p-1 shadow-suave">
          {(["crear", "unirme"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium", tab === t ? "bg-noche text-white" : "text-noche-500")}>
              {t === "crear" ? <><Heart size={16} />Crear espacio</> : <><Users size={16} />Tengo un código</>}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="card mt-4 space-y-4 p-5">
          <div><Label htmlFor="n">Tu nombre</Label>
            <input id="n" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Lucas" /></div>
          {tab === "crear" ? (
            <div><Label htmlFor="cn">Nombre del espacio</Label>
              <input id="cn" className={inputCls} value={coupleName} onChange={(e) => setCoupleName(e.target.value)} required /></div>
          ) : (
            <div><Label htmlFor="c">Código de pareja</Label>
              <input id="c" className={cn(inputCls, "text-center font-display text-2xl uppercase tracking-[0.3em]")} maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="A1B2C3" /></div>
          )}
          <Button type="submit" size="lg" className="w-full" loading={busy}>{tab === "crear" ? "Crear espacio" : "Unirme"}</Button>
        </form>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 w-full text-center text-sm text-gris">Cerrar sesión</button>
      </div>
    </main>
  );
}
