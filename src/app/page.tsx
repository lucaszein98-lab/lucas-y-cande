"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Label, inputCls } from "@/components/crud/FieldInput";
import { useFeedback } from "@/components/ui/Feedback";
import { Names } from "@/components/layout/Names";
import { useApp } from "@/hooks/useApp";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { errorMessage } from "@/services/db";
import { site } from "@/config/site";
import { cn } from "@/lib/format";

type Mode = "login" | "registro" | "recuperar";

export default function Bienvenida() {
  const router = useRouter();
  const { session, authReady } = useApp();
  const { toast } = useFeedback();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState("");

  useEffect(() => {
    if (authReady && session) router.replace("/inicio");
  }, [authReady, session, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setSent("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "registro") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name }, emailRedirectTo: `${window.location.origin}/inicio` },
        });
        if (error) throw error;
        if (!data.session) setSent("Te enviamos un email para confirmar la cuenta. Abrilo y volvé a entrar.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/recuperar` });
        if (error) throw error;
        setSent("Listo. Revisá tu email para crear una contraseña nueva.");
      }
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-dvh bg-noche lg:grid lg:grid-cols-[1.1fr_1fr]">
      <section className="relative h-[58dvh] overflow-hidden lg:h-dvh">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={site.photos.login} alt="Lucas y Cande" className="absolute inset-0 h-full w-full object-cover object-[50%_35%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 pb-10 sm:p-10">
          <h1 className="hero-in font-display text-[3.4rem] font-light leading-[0.95] text-white sm:text-7xl">
            <Names name={site.name} />
          </h1>
          <p className="hero-in-2 mt-3 max-w-sm text-[15px] text-white/80">{site.subtitle}</p>
        </div>
      </section>

      <section className="relative -mt-6 rounded-t-[2rem] bg-porcelana px-6 pb-[max(env(safe-area-inset-bottom),32px)] pt-8 lg:mt-0 lg:flex lg:items-center lg:rounded-none lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {!supabaseConfigured && (
            <div className="mb-6 rounded-2xl bg-vela-100 p-4 text-sm text-vela-600">
              Falta conectar Supabase. Cargá <b>NEXT_PUBLIC_SUPABASE_URL</b> y <b>NEXT_PUBLIC_SUPABASE_ANON_KEY</b> (ver README).
            </div>
          )}
          <h2 className="font-display text-3xl text-noche">
            {mode === "login" ? "Bienvenidos de nuevo" : mode === "registro" ? "Crear cuenta" : "Recuperar contraseña"}
          </h2>
          <p className="mt-1 text-sm text-gris">
            {mode === "login" ? "Entrá para seguir planeando." : mode === "registro" ? "Cada uno crea su cuenta y después se unen como pareja." : "Te mandamos un link a tu email."}
          </p>

          {sent ? (
            <div className="mt-6 rounded-2xl bg-mar-100 p-4 text-sm text-mar-600">{sent}
              <button className="mt-3 block font-medium underline" onClick={() => { setSent(""); setMode("login"); }}>Volver a iniciar sesión</button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "registro" && (
                <div><Label htmlFor="name">Tu nombre</Label>
                  <input id="name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Lucas" autoComplete="given-name" /></div>
              )}
              <div><Label htmlFor="email">Email</Label>
                <input id="email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
              {mode !== "recuperar" && (
                <div><Label htmlFor="pass">Contraseña</Label>
                  <input id="pass" type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>
              )}
              <Button type="submit" size="lg" className="w-full" loading={busy}>
                {mode === "login" ? "Iniciar sesión" : mode === "registro" ? "Crear cuenta" : "Enviar link"}
              </Button>
            </form>
          )}

          <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm">
            {mode !== "login" && <button className="text-noche-500 hover:text-noche" onClick={() => setMode("login")}>Ya tengo cuenta</button>}
            {mode !== "registro" && <button className="font-medium text-noche" onClick={() => setMode("registro")}>Crear cuenta</button>}
            {mode === "login" && <button className={cn("text-noche-500 hover:text-noche")} onClick={() => setMode("recuperar")}>Olvidé mi contraseña</button>}
          </div>
          <p className="mt-8 text-xs text-gris">La sesión queda iniciada en este dispositivo hasta que la cierres.</p>
        </div>
      </section>
    </main>
  );
}
