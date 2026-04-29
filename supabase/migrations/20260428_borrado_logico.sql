-- Agregar columna activa para borrado lógico
ALTER TABLE public.especies ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;
ALTER TABLE public.razas ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;

-- Actualizar políticas para incluir el filtro de activa en lecturas públicas si es necesario
-- Por ahora las políticas existentes permiten ver todo, lo cual está bien para el admin.
-- Para el público, podríamos filtrar, pero eso lo manejaremos en la lógica de las funciones o la UI.
