-- ========================================
-- POLÍTICAS PARA GESTIÓN DE PROMOCIONES EN EL CMS
-- ========================================
-- Permitir que usuarios autenticados puedan leer todas las promociones
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver promociones" ON promociones;
CREATE POLICY "Usuarios autenticados pueden ver promociones" ON promociones FOR
SELECT USING (auth.role() = 'authenticated');
-- Permitir que usuarios autenticados puedan crear promociones
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear promociones" ON promociones;
CREATE POLICY "Usuarios autenticados pueden crear promociones" ON promociones FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- Permitir que usuarios autenticados puedan actualizar promociones
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar promociones" ON promociones;
CREATE POLICY "Usuarios autenticados pueden actualizar promociones" ON promociones FOR
UPDATE USING (auth.role() = 'authenticated');
-- Permitir que usuarios autenticados puedan eliminar promociones
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar promociones" ON promociones;
CREATE POLICY "Usuarios autenticados pueden eliminar promociones" ON promociones FOR DELETE USING (auth.role() = 'authenticated');
-- Verificar que las políticas se crearon correctamente
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'promociones';