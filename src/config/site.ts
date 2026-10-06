/**
 * Configuración general del sitio.
 * El nombre y subtítulo también se pueden cambiar desde la app (Ajustes),
 * estos son solo los valores por defecto.
 */
export const site = {
  name: "Lucas & Cande",
  subtitle: "Nuestros planes, viajes y sueños en un solo lugar.",
  people: ["Lucas", "Cande"] as const,

  // Fotos de ustedes: van en /public/fotos/
  photos: {
    login: "/fotos/nosotros-1.png",
    home: "/fotos/nosotros-1.png",
    viajes: "/fotos/nosotros-1.png",
    casamiento: "/fotos/nosotros-2.png",
  },

  // Imágenes de apoyo (Unsplash, uso gratuito)
  stock: {
    viajes: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1400&q=70", // Río de Janeiro
    playa: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=70",
    casamiento: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=70",
    viajeDefault: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=70",
  },
};

export const PEOPLE_OPTIONS = ["Lucas", "Cande", "Compartido"];
export const ASSIGNEE_OPTIONS = ["Lucas", "Cande", "Ambos"];
export const CURRENCIES = ["USD", "ARS", "BRL", "EUR"];
