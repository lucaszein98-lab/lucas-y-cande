-- =====================================================================
--  LUCAS & CANDE — Esquema de base de datos (Supabase / PostgreSQL)
--  Pegá TODO este archivo en Supabase > SQL Editor > New query > Run.
--  Se puede ejecutar más de una vez sin romper nada.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- PERFILES Y PAREJAS
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Lucas & Cande',
  subtitle text default 'Nuestros planes, viajes y sueños en un solo lugar.',
  home_photo text,
  invite_code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);
create index if not exists couple_members_user_idx on public.couple_members(user_id);

-- ¿El usuario actual pertenece a esta pareja?
create or replace function public.is_member(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.couple_members where couple_id = cid and user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- VIAJES
-- ---------------------------------------------------------------------
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null,
  destination text,
  emoji text default '✈️',
  start_date date,
  end_date date,
  budget numeric(14,2) default 0,
  currency text default 'USD',
  cover_url text,
  notes text,
  itinerary_days int,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_flights (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  direction text default 'Ida',
  airline text, flight_number text, from_airport text, to_airport text,
  date date, time text, price numeric(14,2), currency text,
  booking_code text, link text, notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trip_hotels (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null, location text,
  price_per_night numeric(14,2), nights int, total_price numeric(14,2), currency text,
  link text, check_in date, check_out date, photo_url text,
  status text default 'Idea', notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trip_places (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null, category text, location text, description text, photo_url text,
  approx_price numeric(14,2), link text, priority text default 'Queremos ir',
  status text default 'Pendiente', favorite boolean default false, tags text[] default '{}',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trip_ideas (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null, description text, photo_url text, link text, category text,
  comments text, favorite boolean default false, tags text[] default '{}',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trip_itinerary (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  day int not null default 1,
  period text not null default 'Mañana',
  title text not null, time text, location text, notes text,
  position int default 0,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trip_expenses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  concept text not null, category text default 'Otros', date date default current_date,
  amount numeric(14,2) not null default 0, currency text, rate numeric(14,6),
  paid_by text default 'Compartido', status text default 'Pagado', notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trip_documents (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null, type text default 'Otro', file_url text, link text, notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trip_tasks (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null, done boolean default false, assignee text, notes text, position int default 0,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trip_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null, content text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CASAMIENTO (uno por pareja)
-- ---------------------------------------------------------------------
create table if not exists public.wedding (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null unique references public.couples(id) on delete cascade,
  date date,
  ceremony_place text, party_place text,
  budget numeric(14,2) default 0, currency text default 'ARS',
  estimated_guests int default 0,
  cover_url text, notes text,
  checklist_seeded boolean default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_tasks (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, phase text default '12+ meses antes',
  status text default 'Pendiente', assignee text, due_date date, notes text, position int default 0,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_reminders (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, description text, due_date date, priority text default 'Media',
  assignee text, done boolean default false,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_ideas (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, description text, photo_url text, category text,
  approx_price numeric(14,2), supplier text, link text, favorite boolean default false, tags text[] default '{}',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_budget (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  supplier text not null, category text, price numeric(14,2), date date,
  contact text, whatsapp text, instagram text, web text, file_url text, notes text,
  status text default 'Consultado',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_expenses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  concept text not null, supplier text, category text default 'Otros',
  total numeric(14,2) not null default 0, paid numeric(14,2) not null default 0,
  date date, payment_method text, notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_suppliers (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null, category text, contact_person text, phone text, whatsapp text,
  instagram text, web text, price numeric(14,2), notes text, status text default 'Por consultar',
  tags text[] default '{}',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_contacts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null, company text, category text, phone text, whatsapp text,
  email text, instagram text, notes text, tags text[] default '{}',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_guests (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  first_name text not null, last_name text, group_name text, phone text,
  invited_by text default 'Ambos', status text default 'Sin confirmar',
  party_size int default 1, table_name text, dietary text, notes text, tags text[] default '{}',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_places (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null, type text default 'Salón', location text, photo_url text,
  price numeric(14,2), capacity int, contact text, link text, notes text, favorite boolean default false,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_decor (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, category text default 'Salón', photo_url text, link text, notes text,
  favorite boolean default false,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_music (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  list text not null default 'Fiesta', song text not null, artist text, link text, notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_photos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, photo_url text, category text default 'Referencias', notes text,
  favorite boolean default false,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_documents (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, type text default 'Otro', file_url text, link text, notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.wedding_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, content text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ÍNDICES, updated_at, RLS y REALTIME para todas las tablas de datos
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$
declare t text;
begin
  foreach t in array array[
    'trips','trip_flights','trip_hotels','trip_places','trip_ideas','trip_itinerary',
    'trip_expenses','trip_documents','trip_tasks','trip_notes',
    'wedding','wedding_tasks','wedding_reminders','wedding_ideas','wedding_budget',
    'wedding_expenses','wedding_suppliers','wedding_contacts','wedding_guests',
    'wedding_places','wedding_decor','wedding_music','wedding_photos',
    'wedding_documents','wedding_notes'
  ] loop
    execute format('create index if not exists %1$s_couple_idx on public.%1$I(couple_id)', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "miembros_select" on public.%I', t);
    execute format('drop policy if exists "miembros_insert" on public.%I', t);
    execute format('drop policy if exists "miembros_update" on public.%I', t);
    execute format('drop policy if exists "miembros_delete" on public.%I', t);
    execute format('create policy "miembros_select" on public.%I for select using (public.is_member(couple_id))', t);
    execute format('create policy "miembros_insert" on public.%I for insert with check (public.is_member(couple_id))', t);
    execute format('create policy "miembros_update" on public.%I for update using (public.is_member(couple_id)) with check (public.is_member(couple_id))', t);
    execute format('create policy "miembros_delete" on public.%I for delete using (public.is_member(couple_id))', t);
    execute format('drop trigger if exists touch_%1$s on public.%1$I', t);
    execute format('create trigger touch_%1$s before update on public.%1$I for each row execute function public.touch_updated_at()', t);
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when others then null; -- ya estaba agregada
    end;
  end loop;
end $$;

-- Índices por viaje
create index if not exists trip_flights_trip_idx on public.trip_flights(trip_id);
create index if not exists trip_hotels_trip_idx on public.trip_hotels(trip_id);
create index if not exists trip_places_trip_idx on public.trip_places(trip_id);
create index if not exists trip_ideas_trip_idx on public.trip_ideas(trip_id);
create index if not exists trip_itinerary_trip_idx on public.trip_itinerary(trip_id);
create index if not exists trip_expenses_trip_idx on public.trip_expenses(trip_id);
create index if not exists trip_documents_trip_idx on public.trip_documents(trip_id);
create index if not exists trip_tasks_trip_idx on public.trip_tasks(trip_id);
create index if not exists trip_notes_trip_idx on public.trip_notes(trip_id);

-- RLS de perfiles, parejas y miembros
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;

drop policy if exists "perfil_propio" on public.profiles;
create policy "perfil_propio" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "pareja_select" on public.couples;
drop policy if exists "pareja_update" on public.couples;
create policy "pareja_select" on public.couples for select using (public.is_member(id));
create policy "pareja_update" on public.couples for update using (public.is_member(id)) with check (public.is_member(id));

drop policy if exists "miembros_ver" on public.couple_members;
drop policy if exists "miembros_editar_propio" on public.couple_members;
create policy "miembros_ver" on public.couple_members for select using (public.is_member(couple_id));
create policy "miembros_editar_propio" on public.couple_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- FUNCIONES: crear pareja / unirse con código
-- ---------------------------------------------------------------------
create or replace function public.create_couple(p_name text, p_display_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'No autenticado'; end if;
  insert into public.couples(name, created_by) values (coalesce(nullif(p_name,''), 'Lucas & Cande'), auth.uid())
  returning id into cid;
  insert into public.couple_members(couple_id, user_id, display_name) values (cid, auth.uid(), p_display_name);
  insert into public.wedding(couple_id) values (cid);
  insert into public.profiles(id, display_name) values (auth.uid(), p_display_name)
    on conflict (id) do update set display_name = excluded.display_name;
  return cid;
end; $$;

create or replace function public.join_couple(p_code text, p_display_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'No autenticado'; end if;
  select id into cid from public.couples where invite_code = upper(trim(p_code));
  if cid is null then raise exception 'Código inválido'; end if;
  insert into public.couple_members(couple_id, user_id, display_name) values (cid, auth.uid(), p_display_name)
    on conflict do nothing;
  insert into public.profiles(id, display_name) values (auth.uid(), p_display_name)
    on conflict (id) do update set display_name = excluded.display_name;
  return cid;
end; $$;

grant execute on function public.create_couple(text, text) to authenticated;
grant execute on function public.join_couple(text, text) to authenticated;
grant execute on function public.is_member(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- STORAGE: bucket privado "archivos" (fotos, PDFs, vouchers)
-- Las rutas son: <couple_id>/<carpeta>/<archivo>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('archivos', 'archivos', false)
on conflict (id) do nothing;

drop policy if exists "archivos_select" on storage.objects;
drop policy if exists "archivos_insert" on storage.objects;
drop policy if exists "archivos_update" on storage.objects;
drop policy if exists "archivos_delete" on storage.objects;

create policy "archivos_select" on storage.objects for select to authenticated
  using (bucket_id = 'archivos' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "archivos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'archivos' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "archivos_update" on storage.objects for update to authenticated
  using (bucket_id = 'archivos' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "archivos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'archivos' and public.is_member(((storage.foldername(name))[1])::uuid));
