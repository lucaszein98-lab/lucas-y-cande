"use client";
import { useMemo, useState } from "react";
import { Plus, Search, Heart, ExternalLink, Phone, MessageCircle, Instagram, Mail, Paperclip, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, Empty, Spinner, StoredImage } from "@/components/ui/Bits";
import { useFeedback } from "@/components/ui/Feedback";
import { ResourceForm, initialValues } from "./ResourceForm";
import { inputCls } from "./FieldInput";
import { cn, ensureUrl, fmtDate, instagramLink, money, whatsappLink } from "@/lib/format";
import { resolveUrl } from "@/services/storage";
import { errorMessage } from "@/services/db";
import type { ResourceConfig, Row } from "@/types";

type Col = {
  rows: Row[]; loading: boolean;
  create: (d: Record<string, any>) => Promise<any>;
  update: (id: string, d: Record<string, any>) => Promise<any>;
  remove: (id: string) => Promise<any>;
  reload: () => Promise<any>;
};

export function ResourceManager({ config, col, defaults = {}, header, renderExtra, currency = "USD", transform, addLabel, groupOrder, hideToolbar }: {
  config: ResourceConfig;
  col: Col;
  defaults?: Record<string, any>;
  header?: React.ReactNode;
  renderExtra?: (row: Row) => React.ReactNode;
  currency?: string;
  transform?: (v: Record<string, any>) => Record<string, any>;
  addLabel?: string;
  groupOrder?: string[];
  hideToolbar?: boolean;
}) {
  const { toast } = useFeedback();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [tag, setTag] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [sort, setSort] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    col.rows.forEach((r) => Array.isArray(r.tags) && r.tags.forEach((t: string) => s.add(t)));
    return Array.from(s).sort();
  }, [col.rows]);

  const visible = useMemo(() => {
    let r = col.rows;
    const needle = q.trim().toLowerCase();
    if (needle) {
      const keys = config.searchKeys || [config.titleKey];
      r = r.filter((x) => keys.some((k) => String(x[k] ?? "").toLowerCase().includes(needle)));
    }
    for (const [k, v] of Object.entries(filters)) if (v) r = r.filter((x) => x[k] === v);
    if (tag) r = r.filter((x) => Array.isArray(x.tags) && x.tags.includes(tag));
    if (onlyFav && config.favoriteKey) r = r.filter((x) => x[config.favoriteKey!]);
    const s = config.sortOptions?.[sort];
    if (s) {
      r = [...r].sort((a, b) => {
        const va = a[s.key], vb = b[s.key];
        if (va === vb) return 0;
        if (va === null || va === undefined || va === "") return 1;
        if (vb === null || vb === undefined || vb === "") return -1;
        const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), "es");
        return s.dir === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [col.rows, q, filters, tag, onlyFav, sort, config]);

  const groups = useMemo(() => {
    if (!config.groupBy) return [{ key: "", rows: visible }];
    const m = new Map<string, Row[]>();
    const order = groupOrder || config.fields.find((f) => f.name === config.groupBy)?.options || [];
    order.forEach((o) => m.set(o, []));
    visible.forEach((r) => {
      const k = r[config.groupBy!] || "Otros";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    });
    return Array.from(m.entries()).filter(([, rows]) => rows.length).map(([key, rows]) => ({ key, rows }));
  }, [visible, config, groupOrder]);

  const toggleFav = async (row: Row) => {
    try { await col.update(row.id, { [config.favoriteKey!]: !row[config.favoriteKey!] }); }
    catch (e) { toast(errorMessage(e), "error"); col.reload(); }
  };

  const openFile = async (v: string) => {
    const url = await resolveUrl(v);
    if (url) window.open(url, "_blank", "noopener");
    else toast("No se pudo abrir el archivo.", "error");
  };

  const filterFields = (config.filterKeys || []).map((k) => config.fields.find((f) => f.name === k)!).filter(Boolean);
  const hasActiveFilter = Object.values(filters).some(Boolean) || tag || onlyFav;

  const card = (r: Row) => {
    const img = config.imageKey ? r[config.imageKey] : null;
    const subtitle = (config.subtitleKeys || []).map((k) => {
      const f = config.fields.find((x) => x.name === k);
      const v = r[k];
      if (v === null || v === undefined || v === "") return null;
      return f?.type === "date" ? fmtDate(v) : String(v);
    }).filter(Boolean).join(" · ");
    const cur = (config.currencyKey && r[config.currencyKey]) || currency;
    const actions: React.ReactNode[] = [];
    (config.linkKeys || []).forEach((k) => r[k] && actions.push(
      <a key={k} href={ensureUrl(r[k])} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="chip"><ExternalLink size={14} />Abrir</a>));
    if (config.phoneKey && r[config.phoneKey]) actions.push(<a key="tel" href={`tel:${r[config.phoneKey]}`} onClick={(e) => e.stopPropagation()} className="chip"><Phone size={14} />Llamar</a>);
    if (config.whatsappKey && r[config.whatsappKey]) actions.push(<a key="wa" href={whatsappLink(r[config.whatsappKey])} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="chip"><MessageCircle size={14} />WhatsApp</a>);
    if (config.instagramKey && r[config.instagramKey]) actions.push(<a key="ig" href={instagramLink(r[config.instagramKey])} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="chip"><Instagram size={14} />Instagram</a>);
    if (config.emailKey && r[config.emailKey]) actions.push(<a key="em" href={`mailto:${r[config.emailKey]}`} onClick={(e) => e.stopPropagation()} className="chip"><Mail size={14} />Email</a>);
    if (config.fileKey && r[config.fileKey]) actions.push(<button key="file" onClick={(e) => { e.stopPropagation(); openFile(r[config.fileKey!]); }} className="chip"><Paperclip size={14} />Ver archivo</button>);

    return (
      <article key={r.id} onClick={() => setEditing(r)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setEditing(r)}
        className={cn("group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-suave transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-noche-300",
          config.layout === "masonry" && "mb-3 break-inside-avoid")}>
        {img && <StoredImage src={img} alt={r[config.titleKey]} className={cn("w-full", config.layout === "masonry" ? "h-auto max-h-80" : "h-40")} />}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-snug text-tinta">{r[config.titleKey]}</h3>
            {config.favoriteKey && (
              <button onClick={(e) => { e.stopPropagation(); toggleFav(r); }} aria-label="Favorito" className="-mr-1 -mt-1 rounded-full p-1">
                <Heart size={18} className={r[config.favoriteKey] ? "fill-malva text-malva" : "text-noche-300"} />
              </button>
            )}
          </div>
          {subtitle && <p className="mt-0.5 text-sm text-gris">{subtitle}</p>}
          {config.textKey && r[config.textKey] && <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-noche-700">{r[config.textKey]}</p>}
          {(config.badgeKeys?.length || config.moneyKey || (Array.isArray(r.tags) && r.tags.length)) ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {config.moneyKey && r[config.moneyKey] != null && r[config.moneyKey] !== "" && (
                <span className="mr-1 font-display text-lg tabular-nums text-noche">{money(r[config.moneyKey], cur)}</span>)}
              {config.badgeKeys?.map((k) => r[k] ? <Badge key={k} tone={config.tones?.[r[k]] || "neutral"}>{r[k]}</Badge> : null)}
              {Array.isArray(r.tags) && r.tags.map((t: string) => <Badge key={t} tone="info">#{t}</Badge>)}
            </div>
          ) : null}
          {renderExtra?.(r)}
          {actions.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{actions}</div>}
        </div>
      </article>
    );
  };

  return (
    <div>
      {header}
      {!hideToolbar && (
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-noche-300" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar ${config.plural}…`} className={cn(inputCls, "pl-9")} aria-label={`Buscar ${config.plural}`} />
            </div>
            {(filterFields.length > 0 || config.sortOptions?.length || allTags.length > 0 || config.favoriteKey) && (
              <button onClick={() => setShowFilters((s) => !s)} aria-label="Filtros"
                className={cn("relative rounded-xl border px-3", showFilters || hasActiveFilter ? "border-noche bg-noche text-white" : "border-noche-100 bg-white text-noche")}>
                <SlidersHorizontal size={18} />
              </button>
            )}
            <Button onClick={() => setCreating(true)} className="shrink-0"><Plus size={18} /><span className="hidden sm:inline">{addLabel || `Agregar ${config.singular}`}</span></Button>
          </div>
          {showFilters && (
            <div className="fade-in flex flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-suave">
              {filterFields.map((f) => (
                <select key={f.name} className={cn(inputCls, "w-auto py-2")} value={filters[f.name] || ""} onChange={(e) => setFilters((s) => ({ ...s, [f.name]: e.target.value }))} aria-label={f.label}>
                  <option value="">{f.label}: todos</option>
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ))}
              {config.sortOptions && (
                <select className={cn(inputCls, "w-auto py-2")} value={sort} onChange={(e) => setSort(Number(e.target.value))} aria-label="Ordenar">
                  {config.sortOptions.map((s, i) => <option key={i} value={i}>Ordenar: {s.label}</option>)}
                </select>
              )}
              {allTags.length > 0 && (
                <select className={cn(inputCls, "w-auto py-2")} value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Etiqueta">
                  <option value="">Etiqueta: todas</option>
                  {allTags.map((t) => <option key={t}>{t}</option>)}
                </select>
              )}
              {config.favoriteKey && (
                <button onClick={() => setOnlyFav((v) => !v)} className={cn("chip", onlyFav && "!bg-malva !text-white")}><Heart size={14} />Solo favoritos</button>
              )}
              {hasActiveFilter && <button className="chip" onClick={() => { setFilters({}); setTag(""); setOnlyFav(false); }}>Limpiar</button>}
            </div>
          )}
        </div>
      )}

      {col.loading ? <Spinner /> : col.rows.length === 0 ? (
        <Empty title={`Todavía no hay ${config.plural}`} text={config.emptyText}
          action={<Button onClick={() => setCreating(true)}><Plus size={18} />{addLabel || `Agregar ${config.singular}`}</Button>} />
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-gris">No hay resultados con esos filtros.</p>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.key}>
              {g.key && <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-noche-500">{g.key}<span className="rounded-full bg-noche-100 px-2 text-xs">{g.rows.length}</span></h3>}
              <div className={cn(
                config.layout === "masonry" ? "columns-2 gap-3 md:columns-3 lg:columns-4"
                  : config.layout === "list" ? "grid gap-2.5 md:grid-cols-2"
                  : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3")}>
                {g.rows.map(card)}
              </div>
            </section>
          ))}
        </div>
      )}

      <ResourceForm open={creating} onClose={() => setCreating(false)} title={`${config.female ? "Nueva" : "Nuevo"} ${config.singular}`}
        fields={config.fields} initial={initialValues(config.fields, defaults)} transform={transform}
        onSave={(v) => col.create(v)} />
      <ResourceForm open={!!editing} onClose={() => setEditing(null)} title={`Editar ${config.singular}`}
        fields={config.fields} initial={editing || {}} transform={transform}
        onSave={(v) => col.update(editing!.id, v)} onDelete={() => col.remove(editing!.id)} />
    </div>
  );
}
