/*
  # Fix factura_recetas constraints

  1. Changes
    - Drop existing constraints
    - Modify precio column to be nullable
    - Add new check constraints with proper conditions
    - Update existing records
*/

-- Drop existing constraints
ALTER TABLE factura_recetas
DROP CONSTRAINT IF EXISTS factura_recetas_tipo_check,
DROP CONSTRAINT IF EXISTS factura_recetas_precio_check;

-- Make precio nullable
ALTER TABLE factura_recetas
ALTER COLUMN precio DROP NOT NULL,
ALTER COLUMN precio SET DEFAULT NULL;

-- Add proper check constraints
ALTER TABLE factura_recetas
ADD CONSTRAINT factura_recetas_tipo_check 
CHECK (tipo IN ('receta', 'manual', 'producto', 'servicio'));

-- Add constraint to ensure proper precio values
ALTER TABLE factura_recetas
ADD CONSTRAINT factura_recetas_precio_check
CHECK (
  (tipo = 'receta' AND precio IS NULL) OR
  (tipo IN ('manual', 'producto', 'servicio') AND precio >= 0)
);

-- Update existing records
UPDATE factura_recetas
SET precio = NULL
WHERE tipo = 'receta';

UPDATE factura_recetas
SET precio = 0
WHERE tipo IN ('manual', 'producto', 'servicio') AND precio IS NULL;