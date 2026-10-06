"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { errorMessage } from "@/services/db";
import { FieldInput, Label } from "./FieldInput";
import { cn } from "@/lib/format";
import type { FieldDef } from "@/types";

export function initialValues(fields: FieldDef[], defaults: Record<string, any> = {}) {
  const v: Record<string, any> = {};
  for (const f of fields) {
    if (f.defaultValue !== undefined) v[f.name] = typeof f.defaultValue === "function" ? f.defaultValue() : f.defaultValue;
    else if (f.type === "select" && f.required && f.options?.length) v[f.name] = f.options[0];
    else if (f.type === "boolean") v[f.name] = false;
    else if (f.type === "tags") v[f.name] = [];
  }
  return { ...v, ...defaults };
}

export function ResourceForm({ open, onClose, title, fields, initial, onSave, onDelete, transform }: {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldDef[];
  initial: Record<string, any>;
  onSave: (values: Record<string, any>) => Promise<any>;
  onDelete?: () => Promise<any>;
  transform?: (v: Record<string, any>) => Record<string, any>;
}) {
  const [values, setValues] = useState<Record<string, any>>(initial);
  const [saving, setSaving] = useState(false);
  const { toast, confirm } = useFeedback();

  useEffect(() => { if (open) setValues(initial); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && (values[f.name] === undefined || values[f.name] === null || values[f.name] === "")) {
        toast(`Completá "${f.label}".`, "error");
        return;
      }
    }
    setSaving(true);
    try {
      const out: Record<string, any> = {};
      for (const f of fields) out[f.name] = values[f.name] ?? null;
      await onSave(transform ? transform(out) : out);
      toast("Guardado correctamente.");
      onClose();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!onDelete) return;
    const ok = await confirm({ title: "¿Eliminar?", text: "Esta acción no se puede deshacer." });
    if (!ok) return;
    try {
      await onDelete();
      toast("Eliminado.");
      onClose();
    } catch (err) { toast(errorMessage(err), "error"); }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={
        <div className="flex items-center gap-2">
          {onDelete && <Button type="button" variant="ghost" className="text-malva" onClick={del}><Trash2 size={16} />Eliminar</Button>}
          <div className="flex-1" />
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="resource-form" loading={saving}>Guardar</Button>
        </div>
      }>
      <form id="resource-form" onSubmit={submit} className="grid grid-cols-2 gap-x-3 gap-y-4">
        {fields.map((f) => (
          <div key={f.name} className={cn(f.half ? "col-span-1" : "col-span-2")}>
            <Label htmlFor={`f-${f.name}`}>{f.label}{f.required && <span className="text-malva"> *</span>}</Label>
            <FieldInput field={f} value={values[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
            {f.help && <p className="mt-1 text-xs text-gris">{f.help}</p>}
          </div>
        ))}
      </form>
    </Modal>
  );
}
