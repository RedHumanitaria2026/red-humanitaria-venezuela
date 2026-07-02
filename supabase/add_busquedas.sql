do $$ begin
  if not exists (select 1 from pg_type where typname = 'estado_busqueda') then
    create type public.estado_busqueda as enum ('en_busqueda', 'encontrado');
  end if;
end $$;

create table if not exists public.busquedas (
  id                    uuid primary key default gen_random_uuid(),
  creador_id            uuid not null references public.perfiles(id) on delete cascade,
  nombre                text not null check (char_length(nombre) between 1 and 100),
  apellido              text not null check (char_length(apellido) between 1 and 100),
  edad                  integer check (edad >= 0 and edad <= 120),
  altura_cm             integer check (altura_cm >= 50 and altura_cm <= 250),
  sexo                  text check (sexo in ('masculino', 'femenino', 'otro')),
  ciudad                text check (char_length(ciudad) <= 100),
  ultima_ubicacion      text check (char_length(ultima_ubicacion) <= 200),
  telefono_contacto     text check (char_length(telefono_contacto) <= 30),
  informacion_adicional text check (char_length(informacion_adicional) <= 1000),
  foto_url              text,
  estado                public.estado_busqueda not null default 'en_busqueda',
  activa                boolean not null default true,
  creado_en             timestamptz not null default now(),
  actualizado_en        timestamptz not null default now()
);

create index if not exists idx_busquedas_creador on public.busquedas(creador_id);
create index if not exists idx_busquedas_estado on public.busquedas(estado) where activa = true;
create index if not exists idx_busquedas_ciudad on public.busquedas(ciudad) where activa = true;

create or replace function public.actualizar_busqueda_ts()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists trg_busquedas_updated_at on public.busquedas;
create trigger trg_busquedas_updated_at
  before update on public.busquedas
  for each row execute function public.actualizar_busqueda_ts();

alter table public.busquedas enable row level security;

drop policy if exists "busquedas_select_autenticados" on public.busquedas;
create policy "busquedas_select_autenticados"
  on public.busquedas for select
  to authenticated
  using (activa = true);

drop policy if exists "busquedas_insert_autenticados" on public.busquedas;
create policy "busquedas_insert_autenticados"
  on public.busquedas for insert
  to authenticated
  with check (
    creador_id = (
      select id from public.perfiles where usuario_id = auth.uid() limit 1
    )
  );

drop policy if exists "busquedas_update_propias" on public.busquedas;
create policy "busquedas_update_propias"
  on public.busquedas for update
  to authenticated
  using (
    creador_id = (
      select id from public.perfiles where usuario_id = auth.uid() limit 1
    )
    or exists (
      select 1 from public.perfiles
      where usuario_id = auth.uid()
      and rol in ('administrador', 'responsable_centro')
    )
  );

drop policy if exists "busquedas_delete_propias" on public.busquedas;
create policy "busquedas_delete_propias"
  on public.busquedas for delete
  to authenticated
  using (
    creador_id = (
      select id from public.perfiles where usuario_id = auth.uid() limit 1
    )
    or exists (
      select 1 from public.perfiles
      where usuario_id = auth.uid()
      and rol in ('administrador', 'responsable_centro')
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-busquedas',
  'fotos-busquedas',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "busquedas_fotos_upload" on storage.objects;
create policy "busquedas_fotos_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos-busquedas');

drop policy if exists "busquedas_fotos_select" on storage.objects;
create policy "busquedas_fotos_select"
  on storage.objects for select
  to public
  using (bucket_id = 'fotos-busquedas');

drop policy if exists "busquedas_fotos_delete" on storage.objects;
create policy "busquedas_fotos_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos-busquedas' and auth.uid()::text = (storage.foldername(name))[1]);
