export type Row = Record<string, any> & { id: string; created_at?: string; updated_at?: string };

export interface Couple {
  id: string;
  name: string;
  subtitle: string | null;
  home_photo: string | null;
  invite_code: string;
}

export interface Member {
  couple_id: string;
  user_id: string;
  display_name: string | null;
}

export interface Trip extends Row {
  couple_id: string;
  name: string;
  destination: string | null;
  emoji: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string | null;
  cover_url: string | null;
  notes: string | null;
  itinerary_days: number | null;
}

export interface Wedding extends Row {
  couple_id: string;
  date: string | null;
  ceremony_place: string | null;
  party_place: string | null;
  budget: number | null;
  currency: string | null;
  estimated_guests: number | null;
  cover_url: string | null;
  notes: string | null;
  checklist_seeded: boolean;
}

export type FieldType =
  | "text" | "textarea" | "number" | "money" | "date" | "time" | "select"
  | "url" | "tel" | "email" | "image" | "file" | "boolean" | "tags";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  optionLabels?: Record<string, string>;
  required?: boolean;
  placeholder?: string;
  half?: boolean;
  defaultValue?: any;
  help?: string;
}

export type Tone = "neutral" | "ok" | "warn" | "bad" | "info" | "gold" | "rose";

export interface ResourceConfig {
  table: string;
  singular: string;          // "hotel"
  plural: string;            // "hoteles"
  fields: FieldDef[];
  titleKey: string;
  subtitleKeys?: string[];
  imageKey?: string;
  badgeKeys?: string[];
  tones?: Record<string, Tone>;
  moneyKey?: string;
  currencyKey?: string;
  searchKeys?: string[];
  filterKeys?: string[];
  sortOptions?: { label: string; key: string; dir: "asc" | "desc" }[];
  groupBy?: string;
  layout?: "grid" | "list" | "masonry";
  favoriteKey?: string;
  linkKeys?: string[];
  phoneKey?: string;
  whatsappKey?: string;
  instagramKey?: string;
  emailKey?: string;
  fileKey?: string;
  dateKey?: string;
  textKey?: string;
  emptyText?: string;
  female?: boolean;
}
