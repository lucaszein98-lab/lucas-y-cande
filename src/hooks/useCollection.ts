"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { deleteRow, insertRow, listRows, updateRow } from "@/services/db";
import { useApp } from "./useApp";
import type { Row } from "@/types";

/**
 * Carga una tabla filtrada por pareja (+ filtros extra), y se mantiene
 * sincronizada en tiempo real: si Cande agrega algo, Lucas lo ve al instante.
 */
export function useCollection<T extends Row = Row>(
  table: string,
  extra: Record<string, any> = {},
  order: { key: string; asc: boolean } = { key: "created_at", asc: false },
  enabled = true,
) {
  const { couple } = useApp();
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const extraKey = JSON.stringify(extra);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const reload = useCallback(async () => {
    if (!couple || !enabled) return;
    try {
      const data = await listRows<T>(table, { couple_id: couple.id, ...JSON.parse(extraKey) }, order.key, order.asc);
      setRows(data);
    } catch (e) {
      console.error(table, e);
    } finally {
      setLoading(false);
    }
  }, [couple?.id, table, extraKey, order.key, order.asc, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  useEffect(() => {
    if (!couple || !enabled) return;
    const ch = supabase
      .channel(`rt-${table}-${extraKey}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table, filter: `couple_id=eq.${couple.id}` }, () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(reload, 300);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [couple?.id, table, extraKey, reload, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const create = useCallback(async (data: Record<string, any>) => {
    if (!couple) throw new Error("Sin pareja");
    const row = await insertRow<T>(table, { ...JSON.parse(extraKey), ...data, couple_id: couple.id });
    setRows((r) => (order.asc ? [...r, row] : [row, ...r]));
    return row;
  }, [couple?.id, table, extraKey, order.asc]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(async (id: string, data: Record<string, any>) => {
    setRows((r) => r.map((x) => (x.id === id ? ({ ...x, ...data } as T) : x)));
    const row = await updateRow<T>(table, id, data);
    setRows((r) => r.map((x) => (x.id === id ? row : x)));
    return row;
  }, [table]);

  const remove = useCallback(async (id: string) => {
    await deleteRow(table, id);
    setRows((r) => r.filter((x) => x.id !== id));
  }, [table]);

  return { rows, setRows, loading, reload, create, update, remove };
}
