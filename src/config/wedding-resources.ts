import type { ResourceConfig } from "@/types";
import { ASSIGNEE_OPTIONS } from "./site";

export const WEDDING_CATEGORIES = ["Salón", "Catering", "Fotografía", "Video", "DJ", "Decoración", "Vestido", "Traje", "Iglesia", "Civil", "Invitaciones", "Cotillón", "Souvenirs", "Torta", "Barra", "Transporte", "Luna de miel", "Otros"];

export const PHASES = ["12+ meses antes", "9-12 meses antes", "6-9 meses antes", "3-6 meses antes", "1-3 meses antes", "Último mes", "Última semana", "Después del casamiento"];
export const TASK_STATUS = ["Pendiente", "En proceso", "Realizado"];

export const weddingTaskFields: ResourceConfig["fields"] = [
  { name: "title", label: "Tarea", type: "text", required: true },
  { name: "phase", label: "Etapa", type: "select", options: PHASES, required: true },
  { name: "status", label: "Estado", type: "select", options: TASK_STATUS, required: true, half: true },
  { name: "assignee", label: "Responsable", type: "select", options: ASSIGNEE_OPTIONS, half: true },
  { name: "due_date", label: "Fecha límite", type: "date" },
  { name: "notes", label: "Notas", type: "textarea" },
];

/** Checklist orientativa (se genera automáticamente la primera vez). */
export const DEFAULT_WEDDING_TASKS: Record<string, string[]> = {
  "12+ meses antes": ["Definir fecha", "Definir presupuesto", "Lista inicial de invitados", "Buscar salón", "Consultar iglesia y fecha de ceremonia", "Reservar salón", "Evaluar wedding planner"],
  "9-12 meses antes": ["Contratar fotografía", "Contratar video", "Contratar DJ", "Definir catering", "Definir estilo de decoración", "Buscar vestido", "Buscar traje", "Elegir estilo de música"],
  "6-9 meses antes": ["Enviar Save the Date", "Diseñar invitaciones", "Turno en el Registro Civil", "Comprar alianzas", "Elegir torta", "Contratar barra de tragos", "Organizar transporte", "Curso prematrimonial / documentación de la iglesia"],
  "3-6 meses antes": ["Confirmar menú", "Definir cantidad de mesas", "Elegir cotillón", "Elegir souvenirs", "Prueba de vestido", "Prueba de traje", "Música de la ceremonia", "Música de la fiesta", "Enviar invitaciones"],
  "1-3 meses antes": ["Confirmar invitados", "Distribución de mesas", "Últimas reuniones con proveedores", "Documentación civil e iglesia", "Revisar pagos pendientes", "Armar cronograma del día"],
  "Último mes": ["Confirmación definitiva de invitados", "Cantidad final al salón y catering", "Horarios de cada proveedor", "Pagos finales", "Vestimenta lista", "Retirar anillos", "Documentos listos", "Armar kit de emergencia"],
  "Última semana": ["Confirmar a todos los proveedores", "Preparar alianzas", "Preparar documentos", "Revisar pagos", "Preparar valijas (luna de miel)", "Confirmar horarios con familia y testigos"],
};

export const reminders: ResourceConfig = {
  table: "wedding_reminders", singular: "recordatorio", plural: "recordatorios", layout: "list",
  fields: [
    { name: "title", label: "Título", type: "text", required: true, placeholder: "Pagar segunda cuota del salón" },
    { name: "description", label: "Descripción", type: "textarea" },
    { name: "due_date", label: "Fecha", type: "date", half: true },
    { name: "priority", label: "Prioridad", type: "select", options: ["Alta", "Media", "Baja"], required: true, half: true },
    { name: "assignee", label: "Responsable", type: "select", options: ASSIGNEE_OPTIONS, half: true },
    { name: "done", label: "Hecho", type: "boolean", placeholder: "Ya está hecho", half: true },
  ],
  titleKey: "title", subtitleKeys: ["due_date", "assignee"], textKey: "description",
  badgeKeys: ["priority"], tones: { Alta: "bad", Media: "warn", Baja: "neutral" },
  searchKeys: ["title", "description"], filterKeys: ["priority", "assignee"],
  sortOptions: [{ label: "Fecha", key: "due_date", dir: "asc" }, { label: "Prioridad", key: "priority", dir: "asc" }],
  emptyText: "“Llamar al fotógrafo”, “Enviar documentación a la iglesia”… Lo próximo aparece en el inicio.",
};

export const IDEA_CATEGORIES = ["Decoración", "Centros de mesa", "Invitaciones", "Souvenirs", "Vestimenta", "Iluminación", "Fiesta", "Fotos", "Ceremonia", "Mesa dulce", "Cotillón"];
export const weddingIdeas: ResourceConfig = {
  table: "wedding_ideas", singular: "idea", plural: "ideas", layout: "masonry", female: true,
  fields: [
    { name: "title", label: "Idea", type: "text", required: true },
    { name: "category", label: "Categoría", type: "select", options: IDEA_CATEGORIES, required: true, half: true },
    { name: "approx_price", label: "Precio aproximado", type: "money", half: true },
    { name: "photo_url", label: "Foto", type: "image" },
    { name: "description", label: "Descripción", type: "textarea" },
    { name: "supplier", label: "Proveedor", type: "text" },
    { name: "link", label: "Link (Pinterest, Instagram…)", type: "url" },
    { name: "favorite", label: "Favorito", type: "boolean", placeholder: "❤️ Nos encanta" },
    { name: "tags", label: "Etiquetas", type: "tags" },
  ],
  titleKey: "title", subtitleKeys: ["category", "supplier"], imageKey: "photo_url", textKey: "description",
  moneyKey: "approx_price", linkKeys: ["link"], favoriteKey: "favorite",
  searchKeys: ["title", "description", "supplier"], filterKeys: ["category"],
  emptyText: "Su propio Pinterest: subí fotos de lo que les gusta.",
};

export const BUDGET_STATUS = ["Consultado", "Presupuesto recibido", "En evaluación", "Elegido", "Descartado"];
export const quotes: ResourceConfig = {
  table: "wedding_budget", singular: "presupuesto", plural: "presupuestos",
  fields: [
    { name: "supplier", label: "Proveedor", type: "text", required: true },
    { name: "category", label: "Rubro", type: "select", options: WEDDING_CATEGORIES, required: true, half: true },
    { name: "price", label: "Precio", type: "money", half: true },
    { name: "status", label: "Estado", type: "select", options: BUDGET_STATUS, required: true, half: true },
    { name: "date", label: "Fecha", type: "date", half: true },
    { name: "contact", label: "Contacto", type: "text", half: true },
    { name: "whatsapp", label: "WhatsApp", type: "tel", half: true },
    { name: "instagram", label: "Instagram", type: "text", half: true, placeholder: "@usuario" },
    { name: "web", label: "Web", type: "url", half: true },
    { name: "file_url", label: "PDF o foto del presupuesto", type: "file" },
    { name: "notes", label: "Notas", type: "textarea" },
  ],
  titleKey: "supplier", subtitleKeys: ["category", "date", "contact"], badgeKeys: ["status"],
  tones: { Consultado: "neutral", "Presupuesto recibido": "info", "En evaluación": "warn", Elegido: "ok", Descartado: "bad" },
  moneyKey: "price", textKey: "notes", whatsappKey: "whatsapp", instagramKey: "instagram", linkKeys: ["web"], fileKey: "file_url",
  searchKeys: ["supplier", "contact", "notes"], filterKeys: ["category", "status"], groupBy: "category",
  sortOptions: [{ label: "Precio", key: "price", dir: "asc" }, { label: "Fecha", key: "date", dir: "desc" }],
  emptyText: "Cargá los presupuestos que reciben y compáralos por rubro.",
};

export const weddingExpenseFields: ResourceConfig["fields"] = [
  { name: "concept", label: "Concepto", type: "text", required: true, placeholder: "Seña del salón" },
  { name: "supplier", label: "Proveedor", type: "text", half: true },
  { name: "category", label: "Categoría", type: "select", options: WEDDING_CATEGORIES, required: true, half: true },
  { name: "total", label: "Importe total", type: "money", required: true, half: true },
  { name: "paid", label: "Pagado", type: "money", half: true, defaultValue: 0 },
  { name: "date", label: "Fecha", type: "date", half: true },
  { name: "payment_method", label: "Forma de pago", type: "select", options: ["Efectivo", "Transferencia", "Tarjeta de crédito", "Tarjeta de débito", "Cuotas", "Otro"], half: true },
  { name: "notes", label: "Notas", type: "textarea" },
];
export const weddingExpenses: ResourceConfig = {
  table: "wedding_expenses", singular: "gasto", plural: "gastos", layout: "list",
  fields: weddingExpenseFields, titleKey: "concept", subtitleKeys: ["supplier", "category", "date"],
  moneyKey: "total", badgeKeys: ["payment_method"], textKey: "notes",
  searchKeys: ["concept", "supplier", "notes"], filterKeys: ["category", "payment_method"],
  sortOptions: [{ label: "Fecha", key: "date", dir: "desc" }, { label: "Importe", key: "total", dir: "desc" }],
  emptyText: "Registrá cada contratación: total, lo que ya pagaron y el saldo se calcula solo.",
};

export const SUPPLIER_STATUS = ["Por consultar", "Consultado", "Presupuestado", "Contratado", "Descartado"];
export const suppliers: ResourceConfig = {
  table: "wedding_suppliers", singular: "proveedor", plural: "proveedores",
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "category", label: "Rubro", type: "select", options: WEDDING_CATEGORIES, required: true, half: true },
    { name: "status", label: "Estado", type: "select", options: SUPPLIER_STATUS, required: true, half: true },
    { name: "contact_person", label: "Persona de contacto", type: "text", half: true },
    { name: "price", label: "Precio", type: "money", half: true },
    { name: "phone", label: "Teléfono", type: "tel", half: true },
    { name: "whatsapp", label: "WhatsApp", type: "tel", half: true },
    { name: "instagram", label: "Instagram", type: "text", half: true },
    { name: "web", label: "Página web", type: "url", half: true },
    { name: "notes", label: "Notas", type: "textarea" },
    { name: "tags", label: "Etiquetas", type: "tags" },
  ],
  titleKey: "name", subtitleKeys: ["category", "contact_person"], badgeKeys: ["status"],
  tones: { "Por consultar": "neutral", Consultado: "info", Presupuestado: "warn", Contratado: "ok", Descartado: "bad" },
  moneyKey: "price", textKey: "notes", phoneKey: "phone", whatsappKey: "whatsapp", instagramKey: "instagram", linkKeys: ["web"],
  searchKeys: ["name", "contact_person", "notes", "category"], filterKeys: ["category", "status"],
  sortOptions: [{ label: "Nombre", key: "name", dir: "asc" }, { label: "Rubro", key: "category", dir: "asc" }, { label: "Precio", key: "price", dir: "asc" }],
  emptyText: "Su base de proveedores con WhatsApp e Instagram a un toque.",
};

export const contacts: ResourceConfig = {
  table: "wedding_contacts", singular: "contacto", plural: "contactos", layout: "list",
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "company", label: "Empresa", type: "text", half: true },
    { name: "category", label: "Rubro", type: "select", options: [...WEDDING_CATEGORIES, "Familia", "Padrinos / testigos"], half: true },
    { name: "phone", label: "Teléfono", type: "tel", half: true },
    { name: "whatsapp", label: "WhatsApp", type: "tel", half: true },
    { name: "email", label: "Email", type: "email", half: true },
    { name: "instagram", label: "Instagram", type: "text", half: true },
    { name: "notes", label: "Notas", type: "textarea" },
    { name: "tags", label: "Etiquetas", type: "tags" },
  ],
  titleKey: "name", subtitleKeys: ["company", "category"], textKey: "notes",
  phoneKey: "phone", whatsappKey: "whatsapp", emailKey: "email", instagramKey: "instagram",
  searchKeys: ["name", "company", "category", "phone", "notes"], filterKeys: ["category"],
  sortOptions: [{ label: "Nombre", key: "name", dir: "asc" }],
};

export const GUEST_STATUS = ["Sin confirmar", "Confirmado", "No asiste"];
export const guestFields: ResourceConfig["fields"] = [
  { name: "first_name", label: "Nombre", type: "text", required: true, half: true },
  { name: "last_name", label: "Apellido", type: "text", half: true },
  { name: "group_name", label: "Familia / grupo", type: "text", half: true, placeholder: "Familia de Cande" },
  { name: "phone", label: "Teléfono", type: "tel", half: true },
  { name: "invited_by", label: "Invitado por", type: "select", options: ["Lucas", "Cande", "Ambos"], required: true, half: true },
  { name: "status", label: "Confirmación", type: "select", options: GUEST_STATUS, required: true, half: true },
  { name: "party_size", label: "Cantidad de personas", type: "number", half: true, defaultValue: 1 },
  { name: "table_name", label: "Mesa", type: "text", half: true },
  { name: "dietary", label: "Restricciones alimentarias", type: "text", placeholder: "Celíaco, vegetariano…" },
  { name: "notes", label: "Notas", type: "textarea" },
  { name: "tags", label: "Etiquetas", type: "tags" },
];
export const guests: ResourceConfig = {
  table: "wedding_guests", singular: "invitado", plural: "invitados", layout: "list",
  fields: guestFields, titleKey: "first_name", subtitleKeys: ["last_name", "group_name", "table_name"],
  badgeKeys: ["status", "invited_by", "dietary"], tones: { Confirmado: "ok", "Sin confirmar": "warn", "No asiste": "bad" },
  phoneKey: "phone", whatsappKey: "phone",
  searchKeys: ["first_name", "last_name", "group_name", "table_name", "notes"], filterKeys: ["status", "invited_by"],
  sortOptions: [{ label: "Nombre", key: "first_name", dir: "asc" }, { label: "Apellido", key: "last_name", dir: "asc" }, { label: "Grupo", key: "group_name", dir: "asc" }, { label: "Mesa", key: "table_name", dir: "asc" }],
  emptyText: "Armá la lista: la app suma personas, confirmados y pendientes.",
};

export const weddingPlaces: ResourceConfig = {
  table: "wedding_places", singular: "lugar", plural: "lugares",
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "type", label: "Tipo", type: "select", options: ["Salón", "Iglesia", "Espacio para fotos", "Civil", "Hotel"], required: true, half: true },
    { name: "capacity", label: "Capacidad", type: "number", half: true },
    { name: "price", label: "Precio", type: "money", half: true },
    { name: "contact", label: "Contacto", type: "text", half: true },
    { name: "location", label: "Ubicación", type: "text" },
    { name: "photo_url", label: "Foto", type: "image" },
    { name: "link", label: "Link", type: "url" },
    { name: "notes", label: "Notas", type: "textarea" },
    { name: "favorite", label: "Favorito", type: "boolean", placeholder: "❤️ Favorito" },
  ],
  titleKey: "name", subtitleKeys: ["location", "contact"], imageKey: "photo_url", textKey: "notes",
  badgeKeys: ["type"], moneyKey: "price", linkKeys: ["link"], favoriteKey: "favorite", groupBy: "type",
  searchKeys: ["name", "location", "notes"], filterKeys: ["type"],
  sortOptions: [{ label: "Nombre", key: "name", dir: "asc" }, { label: "Precio", key: "price", dir: "asc" }, { label: "Capacidad", key: "capacity", dir: "desc" }],
};

export const DECOR_CATEGORIES = ["Ceremonia", "Salón", "Mesas", "Flores", "Iluminación", "Cartelería", "Entrada", "Mesa dulce"];
export const decor: ResourceConfig = {
  table: "wedding_decor", singular: "inspiración", plural: "inspiraciones", layout: "masonry", female: true,
  fields: [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "category", label: "Sector", type: "select", options: DECOR_CATEGORIES, required: true },
    { name: "photo_url", label: "Foto", type: "image" },
    { name: "link", label: "Link", type: "url" },
    { name: "notes", label: "Notas", type: "textarea" },
    { name: "favorite", label: "Favorito", type: "boolean", placeholder: "❤️ Favorito" },
  ],
  titleKey: "title", imageKey: "photo_url", textKey: "notes", linkKeys: ["link"], favoriteKey: "favorite",
  groupBy: "category", searchKeys: ["title", "notes"], filterKeys: ["category"],
  emptyText: "Moodboard por sector: ceremonia, mesas, flores, luces…",
};

export const MUSIC_LISTS = ["Ceremonia", "Entrada", "Cena", "Vals", "Fiesta", "Sí o sí", "Prohibidas"];
export const music: ResourceConfig = {
  table: "wedding_music", singular: "canción", plural: "canciones", layout: "list", female: true,
  fields: [
    { name: "song", label: "Canción", type: "text", required: true },
    { name: "artist", label: "Artista", type: "text", half: true },
    { name: "list", label: "Lista", type: "select", options: MUSIC_LISTS, required: true, half: true },
    { name: "link", label: "Link de Spotify / YouTube", type: "url" },
    { name: "notes", label: "Notas", type: "textarea" },
  ],
  titleKey: "song", subtitleKeys: ["artist"], textKey: "notes", linkKeys: ["link"], groupBy: "list",
  searchKeys: ["song", "artist"], filterKeys: ["list"],
  emptyText: "Armen las listas: ceremonia, entrada, vals, fiesta, las que sí o sí y las prohibidas.",
};

export const photos: ResourceConfig = {
  table: "wedding_photos", singular: "foto", plural: "fotos", layout: "masonry", female: true,
  fields: [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "category", label: "Álbum", type: "select", options: ["Referencias", "Nosotros", "Pruebas", "Preboda", "El gran día"], required: true },
    { name: "photo_url", label: "Foto", type: "image" },
    { name: "notes", label: "Notas", type: "textarea" },
    { name: "favorite", label: "Favorito", type: "boolean", placeholder: "❤️ Favorita" },
  ],
  titleKey: "title", imageKey: "photo_url", textKey: "notes", favoriteKey: "favorite", groupBy: "category",
  searchKeys: ["title", "notes"], filterKeys: ["category"],
  emptyText: "Referencias de poses, fotos de pruebas de vestido o traje, y las de ustedes.",
};

export const weddingDocuments: ResourceConfig = {
  table: "wedding_documents", singular: "documento", plural: "documentos", layout: "list",
  fields: [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "type", label: "Tipo", type: "select", options: ["Contrato", "Iglesia", "Civil", "Factura / recibo", "Presupuesto", "Otro"], required: true },
    { name: "file_url", label: "Archivo", type: "file" },
    { name: "link", label: "Link", type: "url" },
    { name: "notes", label: "Notas", type: "textarea" },
  ],
  titleKey: "title", badgeKeys: ["type"], fileKey: "file_url", linkKeys: ["link"], textKey: "notes",
  searchKeys: ["title", "notes"], filterKeys: ["type"], groupBy: "type",
};

export const weddingNotes: ResourceConfig = {
  table: "wedding_notes", singular: "nota", plural: "notas", female: true,
  fields: [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "content", label: "Contenido", type: "textarea" },
  ],
  titleKey: "title", textKey: "content", searchKeys: ["title", "content"],
  sortOptions: [{ label: "Más recientes", key: "updated_at", dir: "desc" }, { label: "Título", key: "title", dir: "asc" }],
};

export const weddingSettingsFields: ResourceConfig["fields"] = [
  { name: "date", label: "Fecha del casamiento", type: "date", help: "Si todavía no tienen el día exacto, pongan uno aproximado (ej. noviembre 2027) y lo cambian después." },
  { name: "ceremony_place", label: "Iglesia / ceremonia", type: "text", half: true },
  { name: "party_place", label: "Salón / fiesta", type: "text", half: true },
  { name: "budget", label: "Presupuesto total", type: "money", half: true },
  { name: "currency", label: "Moneda", type: "select", options: ["ARS", "USD", "EUR"], required: true, half: true },
  { name: "estimated_guests", label: "Invitados estimados", type: "number" },
  { name: "cover_url", label: "Foto de portada (opcional)", type: "image", help: "Si no subís ninguna, se usa la foto de ustedes." },
  { name: "notes", label: "Notas", type: "textarea" },
];
