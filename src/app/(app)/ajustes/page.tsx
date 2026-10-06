"use client";
import { useEffect, useState } from "react";
import { Copy, LogOut, KeyRound, Heart } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useFeedback } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { FieldInput, Label, inputCls } from "@/components/crud/FieldInput";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/services/db";
import type { Couple } from "@/types";

export default function Ajustes() {
  const { couple, members, session, myName, setCouple, refreshCouple } = useApp();
  const { toast } = useFeedback();
  const [name, setName] = useState(couple?.name || "");
  const [subtitle, setSubtitle] = useState(couple?.subtitle || "");
  const [photo, setPhoto] = useState<string | null>(couple?.home_photo || null);
  const [me, setMe] = useState(myName);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setMe(myName); }, [myName]);

  const saveCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couple) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from("couples").update({ name, subtitle, home_photo: photo }).eq("id", couple.id).select().single();
      if (error) throw error;
      setCouple(data as Couple);
      if (me !== myName && session) {
        const { error: e2 } = await supabase.from("couple_members").update({ display_name: me }).eq("couple_id", couple.id).eq("user_id", session.user.id);
        if (e2) throw e2;
        await refreshCouple();
      }
      toast("Guardado correctamente.");
    } catch (err) { toast(errorMessage(err), "error"); } finally { setBusy(false); }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(couple?.invite_code || ""); toast("Código copiado."); }
    catch { toast(`Código: ${couple?.invite_code}`); }
  };

  const resetPass = async () => {
    if (!session?.user.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, { redirectTo: `${window.location.origin}/recuperar` });
    error ? toast(errorMessage(error), "error") : toast("Te enviamos un email para cambiar la contraseña.");
  };

  return (
    <div className="container-app max-w-2xl py-8 pt-[max(env(safe-area-inset-top),32px)]">
      <h1 className="font-display text-4xl text-noche">Ajustes</h1>

      <section className="card mt-6 p-5">
        <h2 className="flex items-center gap-2 font-medium text-noche"><Heart size={18} />Compartir con tu pareja</h2>
        <p className="mt-1 text-sm text-gris">Tu pareja crea su cuenta, elige “Tengo un código” y escribe este código. Desde ese momento ven y editan lo mismo.</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="rounded-2xl bg-porcelana px-5 py-3 font-display text-3xl tracking-[0.3em] text-noche">{couple?.invite_code}</span>
          <Button variant="secondary" onClick={copy}><Copy size={16} />Copiar</Button>
        </div>
        <p className="mt-4 text-sm text-gris">En este espacio: {members.map((m) => m.display_name || "Sin nombre").join(" y ")}</p>
      </section>

      <form onSubmit={saveCouple} className="card mt-4 space-y-4 p-5">
        <h2 className="font-medium text-noche">Personalizar</h2>
        <div><Label htmlFor="cn">Nombre del espacio</Label><input id="cn" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><Label htmlFor="cs">Subtítulo</Label><input id="cs" className={inputCls} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></div>
        <div><Label htmlFor="me">Tu nombre</Label><input id="me" className={inputCls} value={me} onChange={(e) => setMe(e.target.value)} /></div>
        <div><Label>Foto de inicio (opcional)</Label>
          <FieldInput field={{ name: "home_photo", label: "Foto", type: "image" }} value={photo} onChange={setPhoto} />
          <p className="mt-1 text-xs text-gris">Si no subís ninguna se usa /public/fotos/nosotros-1.png.</p></div>
        <Button type="submit" loading={busy}>Guardar cambios</Button>
      </form>

      <section className="card mt-4 space-y-2 p-5">
        <h2 className="font-medium text-noche">Cuenta</h2>
        <p className="text-sm text-gris">{session?.user.email}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="secondary" onClick={resetPass}><KeyRound size={16} />Cambiar contraseña</Button>
          <Button variant="ghost" className="text-malva" onClick={() => supabase.auth.signOut()}><LogOut size={16} />Cerrar sesión</Button>
        </div>
      </section>
    </div>
  );
}
