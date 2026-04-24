-- ################################################
-- MIGRACIÓN COMPLETA - CORTEZA WEB (MIGRACIONV2)
-- Generado el: 24 de abril de 2026
-- ################################################

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS PERSONALIZADOS (ENUMS)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genero') THEN
        CREATE TYPE public.genero AS ENUM ('macho', 'hembra');
    END IF;
END $$;

-- 3. TABLAS

-- Tabla: peludos
CREATE TABLE IF NOT EXISTS public.peludos (
    id SERIAL PRIMARY KEY,
    nombre CHARACTER VARYING NOT NULL,
    sexo public.genero NOT NULL,
    edad SMALLINT NOT NULL,
    caracteristicas TEXT NOT NULL,
    esterilizado BOOLEAN DEFAULT false,
    vacunado BOOLEAN DEFAULT false,
    desparasitado BOOLEAN DEFAULT false,
    especie CHARACTER VARYING DEFAULT 'Sin especificar'::character varying,
    peso NUMERIC
);

-- Tabla: usuario
CREATE TABLE IF NOT EXISTS public.usuario (
    id SERIAL PRIMARY KEY,
    nombre CHARACTER VARYING,
    apellido CHARACTER VARYING,
    email CHARACTER VARYING UNIQUE NOT NULL,
    contrasena CHARACTER VARYING NOT NULL,
    habilitado BOOLEAN DEFAULT true,
    telefono CHARACTER VARYING,
    direccion TEXT
);

-- Tabla: galeria_categorias
CREATE TABLE IF NOT EXISTS public.galeria_categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla: imagenes
CREATE TABLE IF NOT EXISTS public.imagenes (
    id SERIAL PRIMARY KEY,
    id_referencia INTEGER REFERENCES public.peludos(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    nombre TEXT DEFAULT 'Sin nombre'::text,
    categoria TEXT DEFAULT 'general'::text,
    fecha DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    categoria_id BIGINT REFERENCES public.galeria_categorias(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla: products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    spec TEXT,
    detail TEXT,
    price TEXT DEFAULT 'Consultar'::text,
    image TEXT,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 0
);

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_imagenes_deleted_at ON public.imagenes (deleted_at);
CREATE INDEX IF NOT EXISTS idx_imagenes_categoria_id ON public.imagenes (categoria_id);

-- 5. RLS (Row Level Security)

-- Habilitar RLS en las tablas
ALTER TABLE public.peludos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeria_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas para: peludos
CREATE POLICY "Permitir lectura publica de peludos" ON public.peludos
    FOR SELECT USING (true);

-- Políticas para: products
CREATE POLICY "Allow public read access" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Allow authenticated update" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Allow authenticated delete" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated'::text);

-- Políticas para: imagenes
CREATE POLICY "Permitir lectura publica de imagenes" ON public.imagenes
    FOR SELECT USING (true);

CREATE POLICY "Public can view gallery images" ON public.imagenes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert gallery images" ON public.imagenes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update gallery images" ON public.imagenes
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete gallery images" ON public.imagenes
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas para: galeria_categorias
CREATE POLICY "Public can view gallery categories" ON public.galeria_categorias
    FOR SELECT USING (activa = true AND deleted_at IS NULL);

CREATE POLICY "Authenticated can insert gallery categories" ON public.galeria_categorias
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Authenticated can update gallery categories" ON public.galeria_categorias
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete gallery categories" ON public.galeria_categorias
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- 6. STORAGE BUCKETS
-- Estos buckets deben crearse manualmente o mediante SQL si se tiene permisos en storage.buckets
-- Nota: La inserción directa en storage.buckets es posible si eres superuser.
INSERT INTO storage.buckets (id, name, public) VALUES 
('fotos-peludos', 'fotos-peludos', true),
('tienda-salvatore', 'tienda-salvatore', true),
('documentos-dian', 'documentos-dian', true)
ON CONFLICT (id) DO NOTHING;
