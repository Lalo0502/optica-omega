-- ========================================
-- VERIFICACIÓN Y CORRECCIÓN DE BUCKET PÚBLICO
-- ========================================
-- 1. Verificar si el bucket existe y si es público
SELECT id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'promociones';
-- Si el bucket no es público, actualizarlo:
UPDATE storage.buckets
SET public = true
WHERE id = 'promociones';
-- 2. Eliminar TODAS las políticas antiguas del bucket promociones
DROP POLICY IF EXISTS "Public access to promociones images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload promociones images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update promociones images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete promociones images" ON storage.objects;
-- 3. Crear políticas nuevas simplificadas
-- Permitir acceso público de LECTURA (importante para el 404)
CREATE POLICY "Anyone can view promociones" ON storage.objects FOR
SELECT USING (bucket_id = 'promociones');
-- Permitir SUBIR archivos solo a usuarios autenticados
CREATE POLICY "Authenticated can upload to promociones" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'promociones'
        AND auth.role() = 'authenticated'
    );
-- Permitir ACTUALIZAR solo a usuarios autenticados
CREATE POLICY "Authenticated can update promociones" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'promociones'
        AND auth.role() = 'authenticated'
    );
-- Permitir ELIMINAR solo a usuarios autenticados
CREATE POLICY "Authenticated can delete from promociones" ON storage.objects FOR DELETE USING (
    bucket_id = 'promociones'
    AND auth.role() = 'authenticated'
);
-- 4. Verificar que todo quedó bien
SELECT schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'objects'
    AND policyname LIKE '%promociones%'
ORDER BY cmd;
-- 5. Verificar el bucket actualizado
SELECT id,
    name,
    public
FROM storage.buckets
WHERE id = 'promociones';