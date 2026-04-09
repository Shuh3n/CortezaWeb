alter table public.imagenes
add column if not exists deleted_at timestamptz;

create index if not exists idx_imagenes_deleted_at
on public.imagenes (deleted_at);

create index if not exists idx_imagenes_categoria_id
on public.imagenes (categoria_id);
