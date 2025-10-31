-- ========================================
-- CONFIGURACIÓN DE POLÍTICAS PARA BUCKET DE PROMOCIONES
-- ========================================
-- Nota: El bucket 'promociones' ya debe existir y estar marcado como público
-- Políticas de Storage para el bucket de promociones
-- Permitir lectura pública de todas las imágenes
DROP POLICY IF EXISTS "Public access to promociones images" ON storage.objects;
CREATE POLICY "Public access to promociones images" ON storage.objects FOR
SELECT USING (bucket_id = 'promociones');
-- Permitir que usuarios autenticados suban imágenes
DROP POLICY IF EXISTS "Authenticated users can upload promociones images" ON storage.objects;
CREATE POLICY "Authenticated users can upload promociones images" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'promociones'
        AND auth.role() = 'authenticated'
    );
-- Permitir que usuarios autenticados actualicen imágenes
DROP POLICY IF EXISTS "Authenticated users can update promociones images" ON storage.objects;
CREATE POLICY "Authenticated users can update promociones images" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'promociones'
        AND auth.role() = 'authenticated'
    );
-- Permitir que usuarios autenticados eliminen imágenes
DROP POLICY IF EXISTS "Authenticated users can delete promociones images" ON storage.objects;
CREATE POLICY "Authenticated users can delete promociones images" ON storage.objects FOR DELETE USING (
    bucket_id = 'promociones'
    AND auth.role() = 'authenticated'
);
-- Verificar que el bucket se creó correctamente
SELECT *
FROM storage.buckets
WHERE id = 'promociones';
-- Verificar las políticas
SELECT policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%promociones%';