"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { fetchMyCouple } from "@/services/couple";
import type { Couple, Member, Wedding } from "@/types";

interface AppState {
  session: Session | null;
  authReady: boolean;
  coupleReady: boolean;
  couple: Couple | null;
  members: Member[];
  wedding: Wedding | null;
  myName: string;
  refreshCouple: () => Promise<void>;
  setWedding: (w: Wedding) => void;
  setCouple: (c: Couple) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [wedding, setWedding] = useState<Wedding | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshCouple = useCallback(async () => {
    const uid = session?.user?.id ?? null;
    if (!uid) {
      setCouple(null); setMembers([]); setWedding(null); setLoadedFor(null);
      return;
    }
    try {
      const res = await fetchMyCouple(uid);
      setCouple(res?.couple || null);
      setMembers(res?.members || []);
      setWedding(res?.wedding || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadedFor(uid);
    }
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authReady) return;
    refreshCouple();
  }, [authReady, refreshCouple]);

  const coupleReady = authReady && loadedFor === (session?.user?.id ?? null);
  const me = members.find((m) => m.user_id === session?.user?.id);
  const myName = me?.display_name || (session?.user?.user_metadata?.display_name as string) || "";

  return (
    <Ctx.Provider value={{ session, authReady, coupleReady, couple, members, wedding, myName, refreshCouple, setWedding, setCouple }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp fuera de AppProvider");
  return c;
}
