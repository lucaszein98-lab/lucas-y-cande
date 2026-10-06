import { supabase } from "@/lib/supabase";
import type { Couple, Member, Wedding } from "@/types";

export async function fetchMyCouple(userId: string) {
  const { data: mem, error } = await supabase
    .from("couple_members").select("couple_id").eq("user_id", userId).limit(1).maybeSingle();
  if (error) throw error;
  if (!mem) return null;
  const cid = mem.couple_id as string;
  const [{ data: couple }, { data: members }, { data: wedding }] = await Promise.all([
    supabase.from("couples").select("*").eq("id", cid).single(),
    supabase.from("couple_members").select("*").eq("couple_id", cid),
    supabase.from("wedding").select("*").eq("couple_id", cid).maybeSingle(),
  ]);
  let w = wedding as Wedding | null;
  if (!w) {
    const { data } = await supabase.from("wedding").insert({ couple_id: cid }).select().single();
    w = data as Wedding;
  }
  return { couple: couple as Couple, members: (members || []) as Member[], wedding: w };
}

export async function createCouple(name: string, displayName: string) {
  const { data, error } = await supabase.rpc("create_couple", { p_name: name, p_display_name: displayName });
  if (error) throw error;
  return data as string;
}

export async function joinCouple(code: string, displayName: string) {
  const { data, error } = await supabase.rpc("join_couple", { p_code: code, p_display_name: displayName });
  if (error) throw error;
  return data as string;
}
