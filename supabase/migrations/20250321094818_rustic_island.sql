/*
  # Rediseño del sistema de facturación
  
  1. Cambios
    - Eliminar precio de recetas (solo serán referencias)
    - Agregar tabla de items para productos y servicios
    - Modificar factura_recetas para ser solo referencial
    
  2. Estructura
    - `items`: Catálogo de productos y servicios
    - `factura_items`: Items facturados con precios
    - `factura_recetas`: Solo referencia a recetas (sin precio)
*/

-- Crear tabla de items
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  tipo text NOT NULL CHECK (tipo IN ('producto', 'servicio')),
  precio_sugerido decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de items facturados
CREATE TABLE IF NOT EXISTS factura_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas(id) ON DELETE CASCADE,
  item_id uuid REFERENCES items(id),
  descripcion text NOT NULL,
  cantidad integer NOT NULL DEFAULT 1,
  precio_unitario decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT factura_items_cantidad_check CHECK (cantidad > 0),
  CONSTRAINT factura_items_precio_check CHECK (precio_unitario >= 0)
);

-- Modificar factura_recetas para ser solo referencial
ALTER TABLE factura_recetas
DROP COLUMN IF EXISTS precio,
DROP COLUMN IF EXISTS tipo,
ALTER COLUMN receta_id SET NOT NULL;

-- Habilitar RLS en nuevas tablas
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_items ENABLE ROW LEVEL SECURITY;

-- Crear políticas para items
CREATE POLICY "Enable read access for all users"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON items FOR DELETE
  USING (true);

-- Crear políticas para factura_items
CREATE POLICY "Enable read access for all users"
  ON factura_items FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON factura_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON factura_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON factura_items FOR DELETE
  USING (true);

-- Actualizar vista de resumen
CREATE OR REPLACE VIEW vista_resumen_facturas AS
SELECT 
  f.id as factura_id,
  f.folio,
  f.fecha,
  f.fecha_vencimiento,
  f.total,
  f.anticipo,
  f.saldo,
  f.estado,
  COALESCE(SUM(CASE WHEN fp.metodo_pago = 'efectivo' THEN fp.monto ELSE 0 END), 0) as total_efectivo,
  COALESCE(SUM(CASE WHEN fp.metodo_pago = 'tarjeta' THEN fp.monto ELSE 0 END), 0) as total_tarjeta,
  COUNT(DISTINCT fr.receta_id) as total_recetas,
  COUNT(DISTINCT fi.id) as total_items,
  COUNT(DISTINCT fpa.paciente_id) as total_pacientes
FROM facturas f
LEFT JOIN factura_pagos fp ON f.id = fp.factura_id
LEFT JOIN factura_recetas fr ON f.id = fr.factura_id
LEFT JOIN factura_items fi ON f.id = fi.factura_id
LEFT JOIN factura_pacientes fpa ON f.id = fpa.factura_id
GROUP BY f.id, f.folio, f.fecha, f.fecha_vencimiento, f.total, f.anticipo, f.saldo, f.estado;

-- Insertar algunos items comunes
INSERT INTO items (nombre, descripcion, tipo, precio_sugerido) VALUES
  ('Armazón básico', 'Armazón de acetato básico', 'producto', 800.00),
  ('Armazón premium', 'Armazón de marca premium', 'producto', 2500.00),
  ('Lentes monofocales', 'Lentes monofocales básicos', 'producto', 1200.00),
  ('Lentes bifocales', 'Lentes bifocales', 'producto', 2500.00),
  ('Lentes progresivos', 'Lentes progresivos', 'producto', 3500.00),
  ('Tratamiento antirreflejante', 'Tratamiento antirreflejante para lentes', 'servicio', 800.00),
  ('Tratamiento fotocromático', 'Lentes que se oscurecen con el sol', 'servicio', 1200.00),
  ('Ajuste de armazón', 'Servicio de ajuste de armazón', 'servicio', 100.00),
  ('Reparación simple', 'Reparación básica de armazón', 'servicio', 200.00);