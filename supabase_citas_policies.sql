-- ========================================
-- POLÍTICAS ADICIONALES PARA GESTIÓN DE CITAS EN EL CMS
-- ========================================
-- Permitir que usuarios autenticados puedan leer todas las solicitudes de citas
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver citas" ON solicitudes_citas;
CREATE POLICY "Usuarios autenticados pueden ver citas" ON solicitudes_citas FOR
SELECT USING (auth.role() = 'authenticated');
-- Permitir que usuarios autenticados puedan actualizar el estado de las citas
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar citas" ON solicitudes_citas;
CREATE POLICY "Usuarios autenticados pueden actualizar citas" ON solicitudes_citas FOR
UPDATE USING (auth.role() = 'authenticated');
-- Verificar que las políticas se crearon correctamente
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'solicitudes_citas';