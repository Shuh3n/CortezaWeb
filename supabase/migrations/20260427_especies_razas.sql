-- 1. Crear tabla de especies
CREATE TABLE IF NOT EXISTS public.especies (
    id SERIAL PRIMARY KEY,
    nombre CHARACTER VARYING NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Crear tabla de razas
CREATE TABLE IF NOT EXISTS public.razas (
    id SERIAL PRIMARY KEY,
    nombre CHARACTER VARYING NOT NULL,
    especie_id INTEGER REFERENCES public.especies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(nombre, especie_id)
);

-- 3. Insertar valores predeterminados
INSERT INTO public.especies (nombre) VALUES ('Perro'), ('Gato') ON CONFLICT DO NOTHING;

-- Razas de perros
INSERT INTO public.razas (nombre, especie_id) 
SELECT r.nombre, e.id FROM (
    VALUES ('Criollo'), ('Labrador'), ('Golden Retriever'), ('Pastor Alemán'), ('Beagle'), ('Pug'), ('Siberian Husky'), ('French Poodle'), ('Pinscher'), ('Chihuahua'), ('Pitbull')
) AS r(nombre)
JOIN public.especies e ON e.nombre = 'Perro'
ON CONFLICT DO NOTHING;

-- Razas de gatos
INSERT INTO public.razas (nombre, especie_id) 
SELECT r.nombre, e.id FROM (
    VALUES ('Criollo'), ('Persa'), ('Siamés'), ('Angora'), ('Maine Coon'), ('Bengalí'), ('Azul Ruso')
) AS r(nombre)
JOIN public.especies e ON e.nombre = 'Gato'
ON CONFLICT DO NOTHING;

-- 4. Modificar tabla peludos
-- Primero agregamos las columnas como opcionales
ALTER TABLE public.peludos ADD COLUMN IF NOT EXISTS especie_id INTEGER REFERENCES public.especies(id);
ALTER TABLE public.peludos ADD COLUMN IF NOT EXISTS raza_id INTEGER REFERENCES public.razas(id);

-- Intentar migrar datos existentes (heurística simple)
UPDATE public.peludos p
SET especie_id = (SELECT id FROM public.especies WHERE lower(nombre) = lower(p.especie))
WHERE especie_id IS NULL;

-- Asignar Criollo por defecto a los que ya tienen especie pero no raza definida
UPDATE public.peludos p
SET raza_id = (SELECT r.id FROM public.razas r WHERE r.nombre = 'Criollo' AND r.especie_id = p.especie_id)
WHERE especie_id IS NOT NULL AND raza_id IS NULL;

-- 5. RLS para las nuevas tablas
ALTER TABLE public.especies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de especies" ON public.especies FOR SELECT USING (true);
CREATE POLICY "Lectura pública de razas" ON public.razas FOR SELECT USING (true);

-- Permisos para autenticados (Admin)
CREATE POLICY "Admin gestión especies" ON public.especies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gestión razas" ON public.razas FOR ALL USING (auth.role() = 'authenticated');
