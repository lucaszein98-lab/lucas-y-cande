"use client";
import { useMemo } from "react";
import type { Row, Wedding } from "@/types";

export function useWeddingTotals(expenses: Row[], wedding: Wedding | null) {
  return useMemo(() => {
    const budget = Number(wedding?.budget || 0);
    let total = 0, paid = 0;
    const byCat: Record<string, number> = {};
    for (const e of expenses) {
      total += Number(e.total || 0);
      paid += Number(e.paid || 0);
      byCat[e.category || "Otros"] = (byCat[e.category || "Otros"] || 0) + Number(e.total || 0);
    }
    return { budget, total, paid, pending: total - paid, available: budget - total, byCat, cur: wedding?.currency || "ARS" };
  }, [expenses, wedding?.budget, wedding?.currency]);
}

export function guestTotals(rows: Row[]) {
  let total = 0, confirmed = 0, pending = 0, declined = 0;
  for (const g of rows) {
    const n = Number(g.party_size || 1);
    total += n;
    if (g.status === "Confirmado") confirmed += n;
    else if (g.status === "No asiste") declined += n;
    else pending += n;
  }
  return { total, confirmed, pending, declined, attending: total - declined };
}
