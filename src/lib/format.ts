export function money(value: number | null | undefined, currency = "USD") {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("es-AR")}`;
  }
}

/** Convierte "2027-11-20" en Date local a medianoche (sin corrimiento de zona horaria). */
export function parseDate(d?: string | null): Date | null {
  if (!d) return null;
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

export function daysUntil(d?: string | null): number | null {
  const date = parseDate(d);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

export function countdownText(d?: string | null) {
  const n = daysUntil(d);
  if (n === null) return "Sin fecha";
  if (n > 1) return `Faltan ${n} días`;
  if (n === 1) return "¡Es mañana!";
  if (n === 0) return "¡Es hoy!";
  return `Hace ${Math.abs(n)} días`;
}

export function fmtDate(d?: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  const date = parseDate(d);
  if (!date) return "";
  return date.toLocaleDateString("es-AR", opts);
}

export function fmtRange(a?: string | null, b?: string | null) {
  if (!a && !b) return "Fechas a definir";
  if (a && !b) return fmtDate(a);
  if (!a && b) return `Hasta ${fmtDate(b)}`;
  return `${fmtDate(a, { day: "numeric", month: "short" })} – ${fmtDate(b)}`;
}

export function nightsBetween(a?: string | null, b?: string | null) {
  const x = parseDate(a), y = parseDate(b);
  if (!x || !y) return null;
  return Math.max(0, Math.round((y.getTime() - x.getTime()) / 86400000));
}

export function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function whatsappLink(n?: string | null) {
  if (!n) return "";
  const digits = n.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function instagramLink(v?: string | null) {
  if (!v) return "";
  if (v.startsWith("http")) return v;
  return `https://instagram.com/${v.replace(/^@/, "")}`;
}

export function ensureUrl(v?: string | null) {
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Importe de un gasto expresado en la moneda del viaje (usa el tipo de cambio si la moneda difiere). */
export function inTripCurrency(e: Record<string, any>, tripCurrency?: string | null) {
  const amount = Number(e.amount || 0);
  if (!e.currency || !tripCurrency || e.currency === tripCurrency) return { value: amount, converted: true };
  if (e.rate) return { value: amount * Number(e.rate), converted: true };
  return { value: 0, converted: false };
}
