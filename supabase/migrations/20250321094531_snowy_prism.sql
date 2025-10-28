/*
  # Simplificar tabla factura_recetas

  1. Cambios
    - Eliminar columna precio
    - Mantener solo los campos esenciales
    - Actualizar las restricciones
*/

-- Eliminar restricciones existentes
ALTER TABLE factura_recetas
DROP CONSTRAINT IF EXISTS factura_recetas_tipo_check,
DROP CONSTRAINT IF EXISTS factura_recetas_precio_check;

-- Eliminar columna precio
ALTER TABLE factura_recetas
DROP COLUMN IF EXISTS precio;

-- Actualizar restricción de tipo
ALTER TABLE factura_recetas
ADD CONSTRAINT factura_recetas_tipo_check 
CHECK (tipo IN ('receta', 'manual', 'producto', 'servicio'));