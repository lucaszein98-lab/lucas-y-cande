"use client";
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useCollection } from "@/hooks/useCollection";
import { useHashTab } from "@/hooks/useHashTab";
import { Tabs } from "@/components/ui/Bits";
import { ResourceForm } from "@/components/crud/ResourceForm";
import { WeddingHeader } from "@/components/wedding/WeddingHeader";
import { WeddingSummary } from "@/components/wedding/WeddingSummary";
import { WeddingChecklist } from "@/components/wedding/WeddingChecklist";
import { WeddingSection, WeddingPlacesTab, QuotesTab, WeddingExpensesTab, GuestsTab, RemindersTab } from "@/components/wedding/Sections";
import { weddingIdeas, suppliers, contacts, decor, music, photos, weddingDocuments, weddingNotes, weddingSettingsFields } from "@/config/wedding-resources";
import { updateRow } from "@/services/db";
import type { Wedding } from "@/types";

const TABS = [
  { id: "resumen", label: "Resumen" }, { id: "checklist", label: "Checklist" }, { id: "recordatorios", label: "Para recordar" },
  { id: "ideas", label: "Ideas" }, { id: "presupuestos", label: "Presupuestos" }, { id: "gastos", label: "Gastos" },
  { id: "proveedores", label: "Proveedores" }, { id: "contactos", label: "Contactos" }, { id: "invitados", label: "Invitados" },
  { id: "lugares", label: "Lugares" }, { id: "decoracion", label: "Decoración" }, { id: "musica", label: "Música" },
  { id: "fotos", label: "Fotos" }, { id: "documentos", label: "Documentos" }, { id: "notas", label: "Notas" },
];

export default function Casamiento() {
  const { wedding, setWedding } = useApp();
  const expenses = useCollection("wedding_expenses", {}, { key: "date", asc: false });
  const [tab, setTab] = useHashTab(TABS.map((t) => t.id), "resumen");
  const [editing, setEditing] = useState(false);
  if (!wedding) return null;
  const cur = wedding.currency || "ARS";

  return (
    <div>
      <WeddingHeader wedding={wedding} onEdit={() => setEditing(true)} />
      <div className="container-app mt-5">
        <div className="sticky top-0 z-30 -mx-4 bg-porcelana/90 px-4 pb-2 pt-[max(env(safe-area-inset-top),8px)] backdrop-blur md:top-16 md:mx-0 md:px-0 md:pt-2">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="py-5">
          {tab === "resumen" && <WeddingSummary wedding={wedding} expenses={expenses} go={setTab} />}
          {tab === "checklist" && <WeddingChecklist />}
          {tab === "recordatorios" && <RemindersTab />}
          {tab === "ideas" && <WeddingSection config={weddingIdeas} currency={cur} />}
          {tab === "presupuestos" && <QuotesTab currency={cur} />}
          {tab === "gastos" && <WeddingExpensesTab wedding={wedding} col={expenses} />}
          {tab === "proveedores" && <WeddingSection config={suppliers} currency={cur} />}
          {tab === "contactos" && <WeddingSection config={contacts} currency={cur} />}
          {tab === "invitados" && <GuestsTab wedding={wedding} />}
          {tab === "lugares" && <WeddingPlacesTab currency={cur} />}
          {tab === "decoracion" && <WeddingSection config={decor} currency={cur} />}
          {tab === "musica" && <WeddingSection config={music} currency={cur} />}
          {tab === "fotos" && <WeddingSection config={photos} currency={cur} />}
          {tab === "documentos" && <WeddingSection config={weddingDocuments} currency={cur} />}
          {tab === "notas" && <WeddingSection config={weddingNotes} currency={cur} />}
        </div>
      </div>
      <ResourceForm open={editing} onClose={() => setEditing(false)} title="Datos del casamiento" fields={weddingSettingsFields}
        initial={wedding}
        onSave={async (v) => setWedding(await updateRow<Wedding>("wedding", wedding.id, v))} />
    </div>
  );
}
