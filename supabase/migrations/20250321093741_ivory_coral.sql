/*
  # Fix recetas pricing logic

  1. Changes
    - Make precio column nullable in factura_recetas
    - Update existing recetas to have null precio
    - Add constraint to ensure only manual items have prices
*/

-- Make precio column nullable
ALTER TABLE factura_recetas
ALTER COLUMN precio DROP NOT NULL,
ALTER COLUMN precio SET DEFAULT NULL;

-- Set precio to NULL for all recetas
UPDATE factura_recetas
SET precio = NULL
WHERE tipo = 'receta';

-- Add check constraint to ensure only manual items have prices
ALTER TABLE factura_recetas
ADD CONSTRAINT factura_recetas_precio_check
CHECK (
  (tipo = 'receta' AND precio IS NULL) OR
  (tipo IN ('manual', 'producto', 'servicio') AND precio IS NOT NULL)
);