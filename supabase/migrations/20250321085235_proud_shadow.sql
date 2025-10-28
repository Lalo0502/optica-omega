-- Drop existing policies
DROP POLICY IF EXISTS "Acceso público para lectura de facturas" ON facturas;
DROP POLICY IF EXISTS "Acceso público para inserción de facturas" ON facturas;
DROP POLICY IF EXISTS "Acceso público para actualización de facturas" ON facturas;
DROP POLICY IF EXISTS "Acceso público para eliminación de facturas" ON facturas;

DROP POLICY IF EXISTS "Usuarios autenticados pueden leer facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar facturas" ON facturas;

-- Create new policies for facturas
CREATE POLICY "Enable read access for all users"
  ON facturas FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON facturas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON facturas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON facturas FOR DELETE
  USING (true);

-- Drop existing policies for factura_pacientes
DROP POLICY IF EXISTS "Acceso público para lectura de factura_pacientes" ON factura_pacientes;
DROP POLICY IF EXISTS "Acceso público para inserción de factura_pacientes" ON factura_pacientes;
DROP POLICY IF EXISTS "Acceso público para actualización de factura_pacientes" ON factura_pacientes;
DROP POLICY IF EXISTS "Acceso público para eliminación de factura_pacientes" ON factura_pacientes;

-- Create new policies for factura_pacientes
CREATE POLICY "Enable read access for all users"
  ON factura_pacientes FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON factura_pacientes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON factura_pacientes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON factura_pacientes FOR DELETE
  USING (true);

-- Drop existing policies for factura_recetas
DROP POLICY IF EXISTS "Acceso público para lectura de factura_recetas" ON factura_recetas;
DROP POLICY IF EXISTS "Acceso público para inserción de factura_recetas" ON factura_recetas;
DROP POLICY IF EXISTS "Acceso público para actualización de factura_recetas" ON factura_recetas;
DROP POLICY IF EXISTS "Acceso público para eliminación de factura_recetas" ON factura_recetas;

-- Create new policies for factura_recetas
CREATE POLICY "Enable read access for all users"
  ON factura_recetas FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON factura_recetas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON factura_recetas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON factura_recetas FOR DELETE
  USING (true);

-- Drop existing policies for factura_pagos
DROP POLICY IF EXISTS "Acceso público para lectura de factura_pagos" ON factura_pagos;
DROP POLICY IF EXISTS "Acceso público para inserción de factura_pagos" ON factura_pagos;
DROP POLICY IF EXISTS "Acceso público para actualización de factura_pagos" ON factura_pagos;
DROP POLICY IF EXISTS "Acceso público para eliminación de factura_pagos" ON factura_pagos;

-- Create new policies for factura_pagos
CREATE POLICY "Enable read access for all users"
  ON factura_pagos FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON factura_pagos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON factura_pagos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON factura_pagos FOR DELETE
  USING (true);