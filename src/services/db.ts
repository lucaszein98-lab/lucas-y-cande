import { supabase } from "@/lib/supabase";
import type { Row } from "@/types";

type Match = Record<string, string | number | boolean | null>;

function clean(data: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (["id", "created_at", "updated_at", "created_by"].includes(k)) continue;
    out[k] = v === "" ? null : v;
  }
  return out;
}

export async function listRows<T = Row>(table: string, match: Match, order = "created_at", ascending = false) {
  let q = supabase.from(table).select("*");
  for (const [k, v] of Object.entries(match)) q = v === null ? q.is(k, null) : q.eq(k, v as any);
  const { data, error } = await q.order(order, { ascending });
  if (error) throw error;
  return (data || []) as T[];
}

export async function getRow<T = Row>(table: string, id: string) {
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as T | null;
}

export async function insertRow<T = Row>(table: string, data: Record<string, any>) {
  const { data: row, error } = await supabase.from(table).insert(clean(data)).select().single();
  if (error) throw error;
  return row as T;
}

export async function insertMany(table: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).insert(rows.map(clean));
  if (error) throw error;
}

export async function updateRow<T = Row>(table: string, id: string, data: Record<string, any>) {
  const { data: row, error } = await supabase.from(table).update(clean(data)).eq("id", id).select().single();
  if (error) throw error;
  return row as T;
}

export async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export function errorMessage(e: any): string {
  const msg = e?.message || String(e);
  if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos.";
  if (msg.includes("Email not confirmed")) return "Tenés que confirmar el email (revisá tu casilla).";
  if (msg.includes("User already registered")) return "Ese email ya tiene una cuenta. Iniciá sesión.";
  if (msg.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("Código inválido")) return "El código de pareja no existe. Revisalo.";
  if (msg.includes("Failed to fetch")) return "No hay conexión con el servidor. Revisá internet o la configuración de Supabase.";
  return msg;
}
