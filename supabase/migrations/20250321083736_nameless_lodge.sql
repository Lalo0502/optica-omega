/*
  # Fix RLS policies for facturas tables

  1. Changes
    - Drop existing policies
    - Create new policies with proper security checks
    - Enable RLS on all tables
  2. Security
    - Allow authenticated users to perform CRUD operations
    - Allow public access for demo purposes
*/

-- Habilitar RLS en todas las tablas
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_pagos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Acceso público para lectura de facturas" ON facturas;
DROP POLICY IF EXISTS "Acceso público para inserción de facturas" ON facturas;
DROP POLICY IF EXISTS "Acceso público para actualización de facturas" ON facturas;
DROP POLICY IF EXISTS "Acceso público para eliminación de facturas" ON facturas;

DROP POLICY IF EXISTS "Acceso público para lectura de factura_pacientes" ON factura_pacientes;
DROP POLICY IF EXISTS "Acceso público para inserción de factura_pacientes" ON factura_pacientes;
DROP POLICY IF EXISTS "Acceso público para actualización de factura_pacientes" ON factura_pacientes;
DROP POLICY IF EXISTS "Acceso público para eliminación de factura_pacientes" ON factura_pacientes;

DROP POLICY IF EXISTS "Acceso público para lectura de factura_recetas" ON factura_recetas;
DROP POLICY IF EXISTS "Acceso público para inserción de factura_recetas" ON factura_recetas;
DROP POLICY IF EXISTS "Acceso público para actualización de factura_recetas" ON factura_recetas;
DROP POLICY IF EXISTS "Acceso público para eliminación de factura_recetas" ON factura_recetas;

DROP POLICY IF EXISTS "Acceso público para lectura de factura_pagos" ON factura_pagos;
DROP POLICY IF EXISTS "Acceso público para inserción de factura_pagos" ON factura_pagos;
DROP POLICY IF EXISTS "Acceso público para actualización de factura_pagos" ON factura_pagos;
DROP POLICY IF EXISTS "Acceso público para eliminación de factura_pagos" ON factura_pagos;

-- Crear nuevas políticas para facturas
CREATE POLICY "Usuarios autenticados pueden leer facturas"
  ON facturas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar facturas"
  ON facturas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar facturas"
  ON facturas FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar facturas"
  ON facturas FOR DELETE
  USING (auth.role() = 'authenticated');

-- Crear políticas para factura_pacientes
CREATE POLICY "Usuarios autenticados pueden leer factura_pacientes"
  ON factura_pacientes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar factura_pacientes"
  ON factura_pacientes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar factura_pacientes"
  ON factura_pacientes FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar factura_pacientes"
  ON factura_pacientes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Crear políticas para factura_recetas
CREATE POLICY "Usuarios autenticados pueden leer factura_recetas"
  ON factura_recetas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar factura_recetas"
  ON factura_recetas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar factura_recetas"
  ON factura_recetas FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar factura_recetas"
  ON factura_recetas FOR DELETE
  USING (auth.role() = 'authenticated');

-- Crear políticas para factura_pagos
CREATE POLICY "Usuarios autenticados pueden leer factura_pagos"
  ON factura_pagos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar factura_pagos"
  ON factura_pagos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar factura_pagos"
  ON factura_pagos FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar factura_pagos"
  ON factura_pagos FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para acceso público (demo)
CREATE POLICY "Acceso público para lectura de facturas"
  ON facturas FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de facturas"
  ON facturas FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de facturas"
  ON facturas FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de facturas"
  ON facturas FOR DELETE
  TO anon
  USING (true);

-- Repetir políticas para las demás tablas
CREATE POLICY "Acceso público para lectura de factura_pacientes"
  ON factura_pacientes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de factura_pacientes"
  ON factura_pacientes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de factura_pacientes"
  ON factura_pacientes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de factura_pacientes"
  ON factura_pacientes FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Acceso público para lectura de factura_recetas"
  ON factura_recetas FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de factura_recetas"
  ON factura_recetas FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de factura_recetas"
  ON factura_recetas FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de factura_recetas"
  ON factura_recetas FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Acceso público para lectura de factura_pagos"
  ON factura_pagos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de factura_pagos"
  ON factura_pagos FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de factura_pagos"
  ON factura_pagos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de factura_pagos"
  ON factura_pagos FOR DELETE
  TO anon
  USING (true);