-- Agregar columna sonido_url a peludos
ALTER TABLE public.peludos ADD COLUMN IF NOT EXISTS sonido_url TEXT;

-- Crear bucket para sonidos si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sonidos-peludos', 'sonidos-peludos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acceso para el bucket de sonidos
-- Permitir lectura pública
CREATE POLICY "Acceso público a sonidos" ON storage.objects FOR SELECT USING (bucket_id = 'sonidos-peludos');

-- Permitir a los administradores subir/actualizar/eliminar sonidos
CREATE POLICY "Admin gestión sonidos" ON storage.objects FOR ALL 
USING (bucket_id = 'sonidos-peludos' AND auth.role() = 'authenticated');
