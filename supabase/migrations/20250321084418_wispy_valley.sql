/*
  # Actualizar tabla factura_recetas para permitir items adicionales manuales

  1. Cambios
    - Hacer opcional la referencia a receta_id
    - Agregar campo descripcion para items manuales
    - Agregar campo tipo para distinguir entre recetas y otros items

  2. Seguridad
    - Mantener las políticas existentes
*/

-- Modificar la tabla factura_recetas
ALTER TABLE factura_recetas
  ALTER COLUMN receta_id DROP NOT NULL,
  ALTER COLUMN descripcion SET NOT NULL,
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL CHECK (tipo IN ('receta', 'manual')) DEFAULT 'receta';

-- Actualizar la vista resumen de facturas
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
  COUNT(DISTINCT CASE WHEN fr.tipo = 'receta' THEN fr.receta_id END) as total_recetas,
  COUNT(DISTINCT CASE WHEN fr.tipo = 'manual' THEN fr.id END) as total_items,
  COUNT(DISTINCT fpa.paciente_id) as total_pacientes
FROM facturas f
LEFT JOIN factura_pagos fp ON f.id = fp.factura_id
LEFT JOIN factura_recetas fr ON f.id = fr.factura_id
LEFT JOIN factura_pacientes fpa ON f.id = fpa.factura_id
GROUP BY f.id, f.folio, f.fecha, f.fecha_vencimiento, f.total, f.anticipo, f.saldo, f.estado;