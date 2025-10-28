/*
  # Sistema de Facturación

  1. Nuevas Tablas
    - `facturas`: Tabla principal de facturas
      - `id` (uuid, primary key)
      - `fecha` (date)
      - `subtotal` (decimal)
      - `iva` (decimal)
      - `total` (decimal)
      - `anticipo` (decimal)
      - `saldo` (decimal)
      - `metodo_pago` (text)
      - `estado` (text)
      - `notas` (text)
      - `created_at` (timestamp)

    - `factura_recetas`: Relación entre facturas y recetas
      - `id` (uuid, primary key)
      - `factura_id` (uuid, referencia a facturas)
      - `receta_id` (uuid, referencia a recetas)
      - `descripcion` (text)
      - `precio` (decimal)
      - `notas` (text)
      - `created_at` (timestamp)

    - `factura_pagos`: Registro de pagos
      - `id` (uuid, primary key)
      - `factura_id` (uuid, referencia a facturas)
      - `fecha` (date)
      - `monto` (decimal)
      - `metodo_pago` (text)
      - `notas` (text)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Añadir políticas para acceso público (demo)
*/

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  iva decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  anticipo decimal(10,2) NOT NULL DEFAULT 0,
  saldo decimal(10,2) NOT NULL DEFAULT 0,
  metodo_pago text NOT NULL DEFAULT 'efectivo',
  estado text NOT NULL DEFAULT 'pendiente',
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de relación entre facturas y recetas
CREATE TABLE IF NOT EXISTS factura_recetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas(id) ON DELETE CASCADE,
  receta_id uuid REFERENCES recetas(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  precio decimal(10,2) NOT NULL DEFAULT 0,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de pagos de facturas
CREATE TABLE IF NOT EXISTS factura_pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  monto decimal(10,2) NOT NULL DEFAULT 0,
  metodo_pago text NOT NULL DEFAULT 'efectivo',
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para todas las tablas
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_pagos ENABLE ROW LEVEL SECURITY;

-- Políticas para facturas
CREATE POLICY "Acceso público para lectura de facturas"
  ON facturas
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de facturas"
  ON facturas
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de facturas"
  ON facturas
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de facturas"
  ON facturas
  FOR DELETE
  TO anon
  USING (true);

-- Políticas para factura_recetas
CREATE POLICY "Acceso público para lectura de factura_recetas"
  ON factura_recetas
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de factura_recetas"
  ON factura_recetas
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de factura_recetas"
  ON factura_recetas
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de factura_recetas"
  ON factura_recetas
  FOR DELETE
  TO anon
  USING (true);

-- Políticas para factura_pagos
CREATE POLICY "Acceso público para lectura de factura_pagos"
  ON factura_pagos
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acceso público para inserción de factura_pagos"
  ON factura_pagos
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualización de factura_pagos"
  ON factura_pagos
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminación de factura_pagos"
  ON factura_pagos
  FOR DELETE
  TO anon
  USING (true);