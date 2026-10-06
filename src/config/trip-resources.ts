import type { ResourceConfig } from "@/types";
import { CURRENCIES, PEOPLE_OPTIONS, ASSIGNEE_OPTIONS } from "./site";
import { todayISO } from "@/lib/format";

export const tripFields = [
  { name: "name", label: "Nombre del viaje", type: "text", required: true, placeholder: "Río de Janeiro 2027" },
  { name: "emoji", label: "Bandera / emoji", type: "text", half: true, placeholder: "🇧🇷", defaultValue: "✈️" },
  { name: "destination", label: "Destino", type: "text", half: true, placeholder: "Río de Janeiro, Brasil" },
  { name: "start_date", label: "Salida", type: "date", half: true },
  { name: "end_date", label: "Regreso", type: "date", half: true },
  { name: "budget", label: "Presupuesto estimado", type: "money", half: true },
  { name: "currency", label: "Moneda", type: "select", options: CURRENCIES, required: true, half: true },
  { name: "cover_url", label: "Foto de portada", type: "image" },
  { name: "notes", label: "Notas", type: "textarea" },
] as ResourceConfig["fields"];

export const flights: ResourceConfig = {
  table: "trip_flights", singular: "vuelo", plural: "vuelos", layout: "list",
  fields: [
    { name: "direction", label: "Tramo", type: "select", options: ["Ida", "Vuelta", "Interno", "Escala"], required: true, half: true },
    { name: "airline", label: "Aerolínea", type: "text", half: true, required: true },
    { name: "flight_number", label: "N° de vuelo", type: "text", half: true },
    { name: "booking_code", label: "Código de reserva", type: "text", half: true },
    { name: "from_airport", label: "Sale de", type: "text", half: true, placeholder: "EZE" },
    { name: "to_airport", label: "Llega a", type: "text", half: true, placeholder: "GIG" },
    { name: "date", label: "Fecha", type: "date", half: true },
    { name: "time", label: "Hora", type: "time", half: true },
    { name: "price", label: "Precio", type: "money", half: true },
    { name: "currency", label: "Moneda", type: "select", options: CURRENCIES, half: true },
    { name: "link", label: "Link", type: "url" },
    { name: "notes", label: "Notas", type: "textarea" },
  ],
  titleKey: "airline", subtitleKeys: ["from_airport", "to_airport", "date", "time"],
  badgeKeys: ["direction", "flight_number", "booking_code"], tones: { Ida: "ok", Vuelta: "info" },
  moneyKey: "price", currencyKey: "currency", linkKeys: ["link"], textKey: "notes",
  searchKeys: ["airline", "flight_number", "booking_code", "from_airport", "to_airport"],
  sortOptions: [{ label: "Fecha", key: "date", dir: "asc" }, { label: "Precio", key: "price", dir: "asc" }],
  emptyText: "Cargá el vuelo de ida y de vuelta con su código de reserva para tenerlo a mano.",
};

export const HOTEL_STATUS = ["Idea", "Consultado", "Reservado", "Descartado"];
export const hotels: ResourceConfig = {
  table: "trip_hotels", singular: "alojamiento", plural: "alojamientos",
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "location", label: "Ubicación", type: "text" },
    { name: "status", label: "Estado", type: "select", options: HOTEL_STATUS, required: true, half: true },
    { name: "currency", label: "Moneda", type: "select", options: CURRENCIES, half: true },
    { name: "price_per_night", label: "Precio por noche", type: "money", half: true },
    { name: "nights", label: "Noches", type: "number", half: true, help: "Se calcula con check-in/out" },
    { name: "check_in", label: "Check-in", type: "date", half: true },
    { name: "check_out", label: "Check-out", type: "date", half: true },
    { name: "total_price", label: "Precio total", type: "money", help: "Si lo dejás vacío se calcula: noche × noches" },
    { name: "link", label: "Link (Booking, Airbnb, web)", type: "url" },
    { name: "photo_url", label: "Foto", type: "image" },
    { name: "notes", label: "Notas", type: "textarea" },
  ],
  titleKey: "name", subtitleKeys: ["location", "check_in"], imageKey: "photo_url",
  badgeKeys: ["status"], tones: { Idea: "neutral", Consultado: "warn", Reservado: "ok", Descartado: "bad" },
  moneyKey: "total_price", currencyKey: "currency", linkKeys: ["link"], textKey: "notes",
  searchKeys: ["name", "location", "notes"], filterKeys: ["status"],
  sortOptions: [{ label: "Más recientes", key: "created_at", dir: "desc" }, { label: "Precio total", key: "total_price", dir: "asc" }, { label: "Nombre", key: "name", dir: "asc" }],
  emptyText: "Guardá opciones de hoteles o Airbnbs y después compáralas.",
};

export const PLACE_CATEGORIES = ["Playa", "Restaurante", "Bar", "Excursión", "Turismo", "Compras", "Experiencia", "Otro"];
export const places: ResourceConfig = {
  table: "trip_places", singular: "lugar", plural: "lugares",
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "category", label: "Categoría", type: "select", options: PLACE_CATEGORIES, required: true, half: true },
    { name: "priority", label: "Prioridad", type: "select", options: ["Imperdible", "Queremos ir", "Si hay tiempo"], required: true, half: true },
    { name: "status", label: "Estado", type: "select", options: ["Pendiente", "Reservado", "Visitado"], required: true, half: true },
    { name: "approx_price", label: "Precio aproximado", type: "money", half: true },
    { name: "location", label: "Ubicación", type: "text" },
    { name: "description", label: "Descripción", type: "textarea" },
    { name: "photo_url", label: "Foto", type: "image" },
    { name: "link", label: "Link", type: "url" },
    { name: "favorite", label: "Favorito", type: "boolean", placeholder: "❤️ Marcar como favorito" },
    { name: "tags", label: "Etiquetas", type: "tags" },
  ],
  titleKey: "name", subtitleKeys: ["category", "location"], imageKey: "photo_url",
  badgeKeys: ["priority", "status"], tones: { Imperdible: "rose", "Queremos ir": "warn", "Si hay tiempo": "neutral", Visitado: "ok", Reservado: "info" },
  moneyKey: "approx_price", linkKeys: ["link"], textKey: "description", favoriteKey: "favorite",
  searchKeys: ["name", "location", "description", "category"], filterKeys: ["category", "priority", "status"],
  sortOptions: [{ label: "Prioridad", key: "priority", dir: "asc" }, { label: "Nombre", key: "name", dir: "asc" }, { label: "Precio", key: "approx_price", dir: "asc" }],
  emptyText: "Playas, restaurantes, excursiones… todo lo que no se quieren perder.",
};

export const tripIdeas: ResourceConfig = {
  table: "trip_ideas", singular: "idea", plural: "ideas", layout: "masonry", female: true,
  fields: [
    { name: "title", label: "Título", type: "text", required: true, placeholder: "Cena en barco" },
    { name: "category", label: "Categoría", type: "select", options: PLACE_CATEGORIES },
    { name: "description", label: "Descripción", type: "textarea" },
    { name: "photo_url", label: "Foto", type: "image" },
    { name: "link", label: "Link", type: "url" },
    { name: "comments", label: "Comentarios", type: "textarea", placeholder: "¿Qué opinan?" },
    { name: "favorite", label: "Favorito", type: "boolean", placeholder: "❤️ Me encanta" },
    { name: "tags", label: "Etiquetas", type: "tags" },
  ],
  titleKey: "title", subtitleKeys: ["category"], imageKey: "photo_url", textKey: "description",
  linkKeys: ["link"], favoriteKey: "favorite", searchKeys: ["title", "description", "comments"], filterKeys: ["category"],
  emptyText: "Un tablero para ir guardando lo que encuentran: “Ver el Cristo al amanecer”, “Alquilar buggy”…",
};

export const PERIODS = ["Mañana", "Tarde", "Noche"];
export const itineraryFields: ResourceConfig["fields"] = [
  { name: "title", label: "Actividad", type: "text", required: true },
  { name: "day", label: "Día", type: "number", half: true, required: true, defaultValue: 1 },
  { name: "period", label: "Momento", type: "select", options: PERIODS, required: true, half: true },
  { name: "time", label: "Hora", type: "time", half: true },
  { name: "location", label: "Lugar", type: "text", half: true },
  { name: "notes", label: "Notas", type: "textarea" },
];

export const EXPENSE_CATEGORIES = ["Vuelo", "Hotel", "Comida", "Excursión", "Transporte", "Compras", "Seguro", "Otros"];
export const tripExpenseFields: ResourceConfig["fields"] = [
  { name: "concept", label: "Concepto", type: "text", required: true, placeholder: "Cena en Ipanema" },
  { name: "amount", label: "Importe", type: "money", required: true, half: true },
  { name: "currency", label: "Moneda", type: "select", options: CURRENCIES, half: true },
  { name: "category", label: "Categoría", type: "select", options: EXPENSE_CATEGORIES, required: true, half: true },
  { name: "date", label: "Fecha", type: "date", half: true, defaultValue: () => todayISO() },
  { name: "paid_by", label: "Quién pagó", type: "select", options: PEOPLE_OPTIONS, required: true, half: true },
  { name: "status", label: "Estado", type: "select", options: ["Pagado", "Pendiente"], required: true, half: true },
  { name: "rate", label: "Tipo de cambio a la moneda del viaje", type: "number", help: "Solo si el gasto está en otra moneda. Ej: 1 BRL = 0.18 USD → 0.18" },
  { name: "notes", label: "Notas", type: "textarea" },
];
export const tripExpenses: ResourceConfig = {
  table: "trip_expenses", singular: "gasto", plural: "gastos", layout: "list",
  fields: tripExpenseFields, titleKey: "concept", subtitleKeys: ["category", "date", "paid_by"],
  badgeKeys: ["status"], tones: { Pagado: "ok", Pendiente: "warn" }, moneyKey: "amount", currencyKey: "currency",
  textKey: "notes", searchKeys: ["concept", "notes", "category"], filterKeys: ["category", "paid_by", "status"],
  sortOptions: [{ label: "Fecha", key: "date", dir: "desc" }, { label: "Importe", key: "amount", dir: "desc" }],
  emptyText: "Registrá cada gasto y la app calcula el saldo, el porcentaje usado y quién pagó qué.",
};

export const tripDocuments: ResourceConfig = {
  table: "trip_documents", singular: "documento", plural: "documentos", layout: "list",
  fields: [
    { name: "title", label: "Título", type: "text", required: true, placeholder: "Pasaje Aerolíneas ida" },
    { name: "type", label: "Tipo", type: "select", options: ["Pasaje", "Reserva", "Voucher", "Seguro", "Documento personal", "Otro"], required: true },
    { name: "file_url", label: "Archivo", type: "file" },
    { name: "link", label: "Link", type: "url" },
    { name: "notes", label: "Información importante", type: "textarea" },
  ],
  titleKey: "title", badgeKeys: ["type"], fileKey: "file_url", linkKeys: ["link"], textKey: "notes",
  searchKeys: ["title", "notes"], filterKeys: ["type"], groupBy: "type",
  emptyText: "Subí pasajes, vouchers y el seguro para tenerlos sin conexión a mano en el celu.",
};

export const tripTaskFields: ResourceConfig["fields"] = [
  { name: "title", label: "Tarea", type: "text", required: true },
  { name: "assignee", label: "Responsable", type: "select", options: ASSIGNEE_OPTIONS },
  { name: "notes", label: "Notas", type: "textarea" },
];

export const tripNotes: ResourceConfig = {
  table: "trip_notes", singular: "nota", plural: "notas", female: true,
  fields: [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "content", label: "Contenido", type: "textarea" },
  ],
  titleKey: "title", textKey: "content", searchKeys: ["title", "content"],
  sortOptions: [{ label: "Más recientes", key: "updated_at", dir: "desc" }, { label: "Título", key: "title", dir: "asc" }],
};

export const DEFAULT_TRIP_TASKS = [
  "Pasajes comprados", "Hotel reservado", "Seguro de viaje", "Documentación (DNI / pasaporte)",
  "Valija", "Dinero en efectivo", "Tarjetas habilitadas para el exterior", "Traslado al aeropuerto",
  "Internet / roaming / chip", "Reservas importantes",
];
