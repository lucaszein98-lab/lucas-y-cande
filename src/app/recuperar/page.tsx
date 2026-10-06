"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Label, inputCls } from "@/components/crud/FieldInput";
import { useFeedback } from "@/components/ui/Feedback";
import { errorMessage } from "@/services/db";

export default function Recuperar() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useFeedback();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast("Contraseña actualizada.");
      router.replace("/inicio");
    } catch (err) { toast(errorMessage(err), "error"); } finally { setBusy(false); }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <h1 className="font-display text-3xl text-noche">Nueva contraseña</h1>
        <div><Label htmlFor="p">Contraseña nueva</Label>
          <input id="p" type="password" minLength={6} required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></div>
        <Button type="submit" className="w-full" loading={busy}>Guardar contraseña</Button>
      </form>
    </main>
  );
}
