create type public.categoria_publicacion as enum (
  'alerta',
  'recurso',
  'busqueda',
  'oferta',
  'informacion',
  'otro'
);

create table public.publicaciones (
  id uuid primary key default uuid_generate_v4(),
  autor_id uuid references public.perfiles(id) on delete cascade not null,
  titulo text not null,
  contenido text not null,
  categoria public.categoria_publicacion not null default 'informacion',
  ciudad text,
  telefono_contacto text,
  activa boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create unique index idx_publicaciones_un_activa_por_autor
  on public.publicaciones (autor_id)
  where (activa = true);

create index idx_publicaciones_activa on public.publicaciones (activa);
create index idx_publicaciones_categoria on public.publicaciones (categoria);
create index idx_publicaciones_creado on public.publicaciones (creado_en desc);

create trigger publicaciones_actualizado_en
  before update on public.publicaciones
  for each row execute function public.actualizar_timestamp();

alter table public.publicaciones enable row level security;

create policy "publicaciones_lectura_autenticado" on public.publicaciones
  for select using (auth.role() = 'authenticated');

create policy "publicaciones_insertar_propio" on public.publicaciones
  for insert with check (
    autor_id in (select id from public.perfiles where usuario_id = auth.uid())
  );

create policy "publicaciones_actualizar_propio" on public.publicaciones
  for update using (
    autor_id in (select id from public.perfiles where usuario_id = auth.uid())
    or exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid() and p.rol = 'administrador'
    )
  );

create policy "publicaciones_eliminar_propio" on public.publicaciones
  for delete using (
    autor_id in (select id from public.perfiles where usuario_id = auth.uid())
    or exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid() and p.rol = 'administrador'
    )
  );

grant all on public.publicaciones to anon, authenticated, service_role;
