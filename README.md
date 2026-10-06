# Lucas & Cande 💍✈️

Nuestros planes, viajes y sueños en un solo lugar. App web para organizar viajes y el casamiento, compartida entre los dos, desde el celu o la compu.

**Tecnología:** Next.js 14 · React · TypeScript · Tailwind CSS · Supabase (login, base de datos, archivos y tiempo real) · Recharts · dnd-kit.

---

## Publicarla en 6 pasos (≈ 20 minutos, todo gratis)

### 1. Crear Supabase (la base de datos)
1. Entrá a **https://supabase.com** → *Start your project* → registrate con GitHub o email.
2. *New project* → nombre `lucas-y-cande`, elegí una contraseña de base de datos (guardala) y región **South America (São Paulo)**.
3. Esperá 1–2 minutos a que termine de crearse.

### 2. Crear las tablas
1. En Supabase, menú izquierdo → **SQL Editor** → *New query*.
2. Abrí el archivo `supabase/schema.sql` de este proyecto, copiá **todo** y pegalo.
3. Tocá **Run**. Tiene que decir *Success*. (Crea todas las tablas, la seguridad por pareja y el espacio para subir fotos y PDFs.)

### 3. Copiar las claves (variables de entorno)
En Supabase → **Project Settings → API** (o *Data API*). Vas a necesitar dos datos:
- **Project URL** → algo como `https://abcdxyz.supabase.co`
- **anon public key** → un texto largo que empieza con `eyJ...`

Son los valores de:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
(La clave *anon* es pública por diseño: la seguridad la dan las reglas RLS del paso 2. **Nunca** uses la `service_role`.)

### 4. Subir el proyecto a GitHub
1. Creá una cuenta en **https://github.com** si no tenés.
2. Arriba a la derecha **+ → New repository** → nombre `lucas-y-cande` → *Private* → **Create repository**.
3. En la página del repo vacío tocá **uploading an existing file**.
4. Descomprimí el ZIP en tu compu, abrí la carpeta `lucas-y-cande` y **arrastrá todo su contenido** (las carpetas `src`, `public`, `supabase` y los archivos sueltos) a la página. Usá Chrome o Edge para que acepte carpetas.
5. Abajo, **Commit changes**.

### 5. Conectar con Vercel
1. Entrá a **https://vercel.com** → *Sign up* → **Continue with GitHub**.
2. **Add New… → Project** → elegí `lucas-y-cande` → **Import**.
3. En *Project Name* escribí **`lucasycande`** (esto define el link).
4. Abrí **Environment Variables** y agregá las dos del paso 3 (nombre exacto + valor).
5. **Deploy**. En 1–2 minutos está online.

### 6. Obtener el link definitivo y avisarle a Supabase
1. Vercel te muestra el link: **https://lucasycande.vercel.app** (si el nombre estaba tomado, te da uno parecido; lo podés cambiar en *Settings → Domains*).
2. Volvé a Supabase → **Authentication → URL Configuration**:
   - **Site URL:** `https://lucasycande.vercel.app`
   - **Redirect URLs:** agregá `https://lucasycande.vercel.app/**`
   
   Esto hace que los emails de confirmación y de “olvidé mi contraseña” lleven a su página.

¡Listo! Entrá desde el iPhone, tocá **Compartir → Agregar a pantalla de inicio** y queda como una app.

---

## Primer uso
1. **Lucas** entra al link → *Crear cuenta* → confirma el email → *Crear espacio*.
2. En **Ajustes** aparece un **código de 6 letras**.
3. **Cande** crea su cuenta → *Tengo un código* → escribe el código.
4. Desde ahí los dos ven y editan lo mismo, y los cambios aparecen al instante en el otro dispositivo.

> ¿No quieren confirmar email? Supabase → Authentication → Sign In / Providers → Email → desactivar **Confirm email**.

---

## Sus fotos
Ya están incluidas las dos que mandaron, sin ninguna modificación:

| Archivo | Dónde se usa |
|---|---|
| `public/fotos/nosotros-1.png` | Login, Inicio |
| `public/fotos/nosotros-2.png` | Casamiento |

Para cambiarlas: reemplazá el archivo **con el mismo nombre** en `public/fotos/`, o cambiá qué foto va en cada pantalla en **`src/config/site.ts`** (sección `photos`). También pueden subir otra foto desde la app: *Ajustes → Foto de inicio* y *Casamiento → Datos del casamiento → Foto de portada*. Cada viaje tiene su propia foto de portada.

## Cambiar el nombre “Lucas & Cande”
Desde la app: **Ajustes → Nombre del espacio y Subtítulo**. El valor por defecto está en `src/config/site.ts`.

---

## Qué incluye
- **Acceso:** registro, login, sesión persistente, recuperar y cambiar contraseña, espacio compartido de pareja con código.
- **Inicio:** foto de ustedes, *Próximos momentos* con cuenta regresiva, resumen del próximo viaje y del casamiento, próximos vencimientos.
- **Viajes:** crear/editar/eliminar viajes; por viaje: Resumen, Vuelos, Hotel (con comparador), Lugares (categorías, prioridad, ❤️ favoritos), Ideas (tablero), Itinerario por día y momento con *drag & drop*, Gastos (totales, % usado, gráfico por categoría, quién pagó y cuánto se deben, tipos de cambio), Documentos (subir PDFs/fotos o links), Checklist automática, Notas.
- **Casamiento:** Resumen, Checklist orientativa por etapas (≈50 tareas, estados, responsable, fecha límite, progreso), Para recordar, Ideas tipo Pinterest, Presupuestos con comparación por rubro, Gastos (pagado/pendiente/saldo + gráfico), Proveedores, Contactos, Invitados (confirmados/pendientes/no asisten), Lugares, Decoración (moodboard por sector), Música (listas), Fotos, Documentos, Notas.
- **En todo:** crear, editar, eliminar con confirmación, buscador, filtros, ordenamiento, etiquetas, avisos de “Guardado correctamente”, botón **+** flotante para cargar gastos, ideas, recordatorios o invitados en dos toques.

## Estructura del código
```
supabase/schema.sql        Tablas, relaciones, RLS, funciones y storage
src/app/                   Pantallas (login, pareja, inicio, viajes, casamiento, ajustes)
src/components/ui/         Botones, modales, avisos, gráficos, pestañas
src/components/crud/       Formularios y listas reutilizables (búsqueda, filtros, CRUD)
src/components/trips/      Piezas propias de viajes (gastos, itinerario, hoteles…)
src/components/wedding/    Piezas propias del casamiento (checklist, presupuestos…)
src/config/                Campos de cada sección, checklists sugeridas, nombre y fotos
src/services/              Acceso a base de datos y archivos
src/hooks/                 Sesión/pareja y colecciones en tiempo real
src/lib/                   Cliente Supabase y utilidades (fechas, moneda)
src/types/                 Tipos de TypeScript
```
Para agregar un campo a una sección: sumá la columna en Supabase y el campo en `src/config/*-resources.ts`.

## Probar en la compu (opcional)
Necesitás Node.js 18+.
```bash
cp .env.example .env.local   # y completá las dos claves
npm install
npm run dev                  # abre http://localhost:3000
```

## Bueno saber
- **Plan gratis de Supabase:** si el proyecto pasa una semana sin uso, se pausa. Se reactiva desde el panel de Supabase con un clic, sin perder datos.
- **Archivos:** se guardan privados (solo ustedes dos pueden verlos). Máximo 20 MB por archivo.
